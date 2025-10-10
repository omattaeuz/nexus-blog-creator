import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link as LinkIcon, Image as ImageIcon, Bold, Italic, Eye, EyeOff, Type, Upload } from "lucide-react";
import { compressImage, uploadToSupabaseStorage } from "@/lib/image-upload";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  preview?: boolean;
  onTogglePreview?: (next: boolean) => void;
}

export default function RichEditor({ value, onChange, preview = false, onTogglePreview }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [internalHtml, setInternalHtml] = useState<string>(value || "");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [galleryUrls, setGalleryUrls] = useState<string>("");
  const [galleryLayout, setGalleryLayout] = useState<"grid" | "carousel">("grid");
  const idSeq = useRef(0);
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(100); // percent

  useEffect(() => {
    setInternalHtml(value || "");
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    const html = editorRef.current?.innerHTML || "";
    setInternalHtml(html);
    onChange(html);
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    exec("createLink", url);
  };

  const removeLink = () => exec("unlink");

  const insertImage = () => {
    if (!imageUrl.trim()) return;
    const id = `re-img-${++idSeq.current}`;
    const imgHtml = `<figure data-re-id="${id}" style="display:inline-block; margin:8px 0;" draggable="true"><img src="${imageUrl.trim()}" alt="" style="width:100%; height:auto; object-fit:contain;" /></figure>`;
    document.execCommand("insertHTML", false, imgHtml);
    setImageUrl("");
    const html = editorRef.current?.innerHTML || "";
    setInternalHtml(html);
    onChange(html);
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = await compressImage(file);
    const url = await uploadToSupabaseStorage(blob, "jpg");
    setImageUrl(url);
    insertImage();
  };

  const insertGallery = () => {
    const urls = galleryUrls
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) return;
    if (galleryLayout === "grid") {
      const imgs = urls.map((u) => `<img src="${u}" style="width:100%;height:auto;object-fit:cover;" />`).join("");
      const grid = `<div data-gallery="grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">${imgs}</div>`;
      document.execCommand("insertHTML", false, grid);
    } else {
      const imgs = urls.map((u) => `<div style="flex:0 0 100%;"><img src="${u}" style="width:100%;height:auto;object-fit:cover;" /></div>`).join("");
      const carousel = `<div data-gallery="carousel" style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:8px;">${imgs}</div>`;
      document.execCommand("insertHTML", false, carousel);
    }
    setGalleryUrls("");
    const html = editorRef.current?.innerHTML || "";
    setInternalHtml(html);
    onChange(html);
  };

  const onInput = () => {
    const html = editorRef.current?.innerHTML || "";
    setInternalHtml(html);
    onChange(html);
  };

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const click = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const img = target?.closest("figure")?.querySelector("img") as HTMLImageElement | null;
      if (img) {
        setSelectedImg(img);
        const percent = Math.round(((img.clientWidth || img.width) / (img.parentElement?.clientWidth || img.width)) * 100);
        if (!Number.isNaN(percent)) setImgWidth(Math.max(10, Math.min(100, percent)));
      } else {
        setSelectedImg(null);
      }
    };
    ed.addEventListener("click", click);
    return () => ed.removeEventListener("click", click);
  }, []);

  const applyImgWidth = (p: number) => {
    if (!selectedImg) return;
    selectedImg.style.width = `${p}%`;
    const html = editorRef.current?.innerHTML || "";
    setInternalHtml(html);
    onChange(html);
  };

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const onDragStart = (e: DragEvent) => {
      const fig = (e.target as HTMLElement)?.closest("figure[data-re-id]") as HTMLElement | null;
      if (!fig) return;
      e.dataTransfer?.setData("text/re-id", fig.getAttribute("data-re-id") || "");
      e.dataTransfer?.setData("text/plain", "reorder");
    };
    const onDragOver = (e: DragEvent) => {
      const fig = (e.target as HTMLElement)?.closest("figure[data-re-id]");
      if (fig) e.preventDefault();
    };
    const onDrop = async (e: DragEvent) => {
      const figTarget = (e.target as HTMLElement)?.closest("figure[data-re-id]");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          const url = URL.createObjectURL(file);
          setImageUrl(url);
          insertImage();
          e.preventDefault();
          return;
        }
      }
      const draggedId = e.dataTransfer?.getData("text/re-id");
      if (!draggedId || !figTarget) return;
      e.preventDefault();
      const figDragged = ed.querySelector(`figure[data-re-id='${draggedId}']`);
      if (figDragged && figDragged !== figTarget) {
        figTarget.parentElement?.insertBefore(figDragged, figTarget);
        const html = ed.innerHTML;
        setInternalHtml(html);
        onChange(html);
      }
    };
    ed.addEventListener("dragstart", onDragStart);
    ed.addEventListener("dragover", onDragOver);
    ed.addEventListener("drop", onDrop);
    return () => {
      ed.removeEventListener("dragstart", onDragStart);
      ed.removeEventListener("dragover", onDragOver);
      ed.removeEventListener("drop", onDrop);
    };
  }, [insertImage, onChange]);

  const togglePreview = () => onTogglePreview?.(!preview);

  return (
    <Card className="border-border/50">
      <CardContent className="p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => exec("bold")} className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 border-slate-600/50"> <Bold className="h-4 w-4" /> </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => exec("italic")} className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 border-slate-600/50"> <Italic className="h-4 w-4" /> </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => exec("formatBlock", "H1")} className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 border-slate-600/50"> <Type className="h-4 w-4" /> H1 </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => exec("formatBlock", "H2")} className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 border-slate-600/50"> <Type className="h-4 w-4" /> H2 </Button>
          <Button type="button" size="sm" variant="outline" onClick={insertLink} className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 border-slate-600/50"> <LinkIcon className="h-4 w-4" /> Link </Button>
          <Button type="button" size="sm" variant="outline" onClick={removeLink} className="text-gray-400 hover:text-red-400 hover:bg-red-500/20 border-slate-600/50"> Unlink </Button>
          <div className="flex items-center gap-2">
            <Input placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="h-8 w-56" />
            <Button type="button" size="sm" variant="outline" onClick={insertImage} className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 border-slate-600/50"> <ImageIcon className="h-4 w-4" /> Add Image </Button>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <Upload className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFilePick} />
              Upload
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Gallery: url1,url2,..." value={galleryUrls} onChange={(e) => setGalleryUrls(e.target.value)} className="h-8 w-64" />
            <select className="h-8 rounded border px-2 text-sm" value={galleryLayout} onChange={(e) => setGalleryLayout(e.target.value as any)}>
              <option value="grid">Grid</option>
              <option value="carousel">Carousel</option>
            </select>
            <Button type="button" size="sm" variant="outline" onClick={insertGallery} className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 border-slate-600/50">Add Gallery</Button>
          </div>
          <div className="ml-auto">
            <Button type="button" size="sm" onClick={togglePreview} className="hidden lg:flex bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
              {preview ? (<><EyeOff className="h-4 w-4 mr-2" /> Edit</>) : (<><Eye className="h-4 w-4 mr-2" /> Preview</>)}
            </Button>
          </div>
        </div>

        {preview ? (
          <div className="hidden lg:block prose max-w-none bg-background rounded border p-3" dangerouslySetInnerHTML={{ __html: internalHtml || "<p><em>Empty content</em></p>" }} />
        ) : (
          <div
            ref={editorRef}
            className="min-h-[240px] border rounded p-3 bg-background focus:outline-primary focus-visible:outline-primary"
            contentEditable
            suppressContentEditableWarning
            onInput={onInput}
          />
        )}

        {!preview && selectedImg && (
          <div className="flex items-center gap-3 border rounded p-2 bg-card">
            <span className="text-sm">Image width</span>
            <input
              type="range"
              min={10}
              max={100}
              value={imgWidth}
              onChange={(e) => { const v = Number(e.target.value); setImgWidth(v); applyImgWidth(v); }}
            />
            <span className="text-xs w-10 text-right">{imgWidth}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}