import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import { common } from "lowlight";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import CharacterCount from "@tiptap/extension-character-count";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { compressImage, uploadToSupabaseStorage } from "@/lib/image-upload";
import { calculateReadingTime } from "@/lib/formatters";
import ImageEditor from "./ImageEditor";
import { supabase } from "@/lib/supabase";

interface Props {
  value: string; // stores HTML
  onChange: (html: string) => void;
  preview?: boolean;
  onTogglePreview?: (next: boolean) => void;
  title?: string; // for preview header
  onImageEditorToggle?: (isOpen: boolean) => void;
  id?: string; // for accessibility
}

// Removed custom extension - using inline styles instead

export default function RichEditorPro({ value, onChange, preview = false, onTogglePreview, title = "Preview", onImageEditorToggle, id }: Props) {
  const lowlightInstance = createLowlight(common);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        codeBlock: false, // We'll use CodeBlockLowlight instead
        heading: false, // We'll configure it separately
        horizontalRule: false, // We'll configure it separately
        dropcursor: false, // We'll configure it separately
        gapcursor: false, // We'll configure it separately
      }),
      Placeholder.configure({ placeholder: "Escreva sua história..." }),
      Link.configure({ openOnClick: true, HTMLAttributes: { rel: "noopener noreferrer nofollow" } }),
      Image.configure({ inline: false, allowBase64: true }),
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Typography,
      Highlight.configure({ multicolor: true }),
      Color.configure({ types: [TextStyle.name] }),
      TextStyle,
      HorizontalRule,
      CodeBlockLowlight.configure({
        lowlight: lowlightInstance,
      }),
      Dropcursor,
      Gapcursor,
      CharacterCount,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
      editorProps: {
        attributes: {
          class: "prose max-w-none min-h-[400px] p-4 bg-background border-x border-b rounded-b focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:p-4 [&_.ProseMirror]:prose [&_.ProseMirror]:max-w-none [&_.ProseMirror]:text-gray-900",
        },
      },
  });

  useEffect(() => {
    if (!editor) return;
    if (preview) return;
    // only set from outside if different to avoid caret jump
    const current = editor.getHTML();
    if (value && value !== current) editor.commands.setContent(value);
  }, [value, editor, preview]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!editor) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open link modal
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        openLinkModal();
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('keydown', handleKeyDown);
    
    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    
    const handleTableControls = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('notion-menu-btn')) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const action = target.getAttribute('data-action');
      const tableBlock = target.closest('.notion-table-block');
      const table = tableBlock?.querySelector('.notion-table');
      
      if (!table) return;
      
      const tbody = table.querySelector('tbody');
      if (!tbody) return;
      
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const cols = rows[0]?.querySelectorAll('td').length || 0;
      
      switch (action) {
        case 'add-row-above':
          addTableRow(tbody, rows[0], cols);
          break;
        case 'add-row-below':
          addTableRow(tbody, rows[rows.length - 1], cols, true);
          break;
        case 'delete-row':
          if (rows.length > 1) {
            rows[rows.length - 1].remove();
          }
          break;
        case 'add-col-left':
          addTableColumn(tbody, 0, rows.length);
          break;
        case 'add-col-right':
          addTableColumn(tbody, cols, rows.length);
          break;
        case 'delete-col':
          if (cols > 1) {
            rows.forEach(row => {
              const cells = row.querySelectorAll('td');
              if (cells[cells.length - 1]) {
                cells[cells.length - 1].remove();
              }
            });
          }
          break;
      }
      
      // Update editor content
      const html = editor.getHTML();
      onChange(html);
    };
    
    const addTableRow = (tbody: Element, referenceRow: Element, colCount: number, after = false) => {
      const newRow = document.createElement('tr');
      
      for (let i = 0; i < colCount; i++) {
        const cell = document.createElement('td');
        cell.className = 'notion-cell';
        cell.contentEditable = 'true';
        newRow.appendChild(cell);
      }
      
      if (after) {
        tbody.appendChild(newRow);
      } else {
        tbody.insertBefore(newRow, referenceRow);
      }
    };
    
    const addTableColumn = (tbody: Element, colIndex: number, rowCount: number) => {
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.forEach(row => {
        const cell = document.createElement('td');
        cell.className = 'notion-cell';
        cell.contentEditable = 'true';
        
        const cells = row.querySelectorAll('td');
        if (colIndex >= cells.length) {
          row.appendChild(cell);
        } else {
          row.insertBefore(cell, cells[colIndex]);
        }
      });
    };
    
    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleTableControls);
    
    return () => {
      editorElement.removeEventListener('click', handleTableControls);
    };
  }, [editor, onChange]);

  const addImageFromFile = async (file: File) => {
    try {
      console.log('Starting image upload:', file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        console.error('File too large:', file.size, 'max allowed:', maxSize);
        return;
      }

      // Compress image first
      const compressedBlob = await compressImage(file);
      console.log('Image compressed:', compressedBlob.size, 'bytes');

      // Upload to Supabase Storage
      const imageUrl = await uploadToSupabaseStorage(compressedBlob, 'jpg');
      console.log('Image uploaded to Supabase:', imageUrl);
      
      // Insert image into editor
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      console.log('Image inserted into editor successfully');
      
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      console.log('File selected:', f.name);
      
      // Validate file type
      if (!f.type.startsWith('image/')) {
        console.error('Invalid file type:', f.type);
        return;
      }

      // Validate file size (max 10MB for editing)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (f.size > maxSize) {
        console.error('File too large:', f.size, 'max allowed:', maxSize);
        return;
      }

      setSelectedImageFile(f);
      setShowImageEditor(true);
      onImageEditorToggle?.(true);
    }
    e.currentTarget.value = "";
  };

  const handleImageEditorSave = (editedImageHtml: string) => {
    // Insert the edited image HTML into the editor
    editor?.chain().focus().insertContent(editedImageHtml).run();
    console.log('Edited image inserted into editor');
    
    // Close the image editor
    setShowImageEditor(false);
    setSelectedImageFile(null);
    onImageEditorToggle?.(false);
  };

  const handleImageEditorCancel = () => {
    setShowImageEditor(false);
    setSelectedImageFile(null);
    onImageEditorToggle?.(false);
  };

  // Link functions
  const openLinkModal = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    // Check if we're already in a link
    const linkMark = editor.getAttributes('link');
    if (linkMark.href) {
      setLinkUrl(linkMark.href);
      setLinkText(selectedText || linkMark.href);
    } else {
      setLinkUrl("");
      setLinkText(selectedText);
    }
    
    setShowLinkModal(true);
  };

  const handleLinkSave = () => {
    if (!linkUrl.trim()) return;
    
    if (linkText.trim()) {
      // Insert link with custom text
      editor?.chain().focus().insertContent(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer nofollow">${linkText}</a>`).run();
    } else {
      // Set link on selected text or insert URL as text
      editor?.chain().focus().setLink({ href: linkUrl, target: '_blank' }).run();
    }
    
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  const handleLinkCancel = () => {
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  if (!editor) return null;

  return (
    <Card className="border-border/50 h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Professional Toolbar */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-3 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "bg-primary text-primary-foreground" : ""}>B</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "bg-primary text-primary-foreground" : ""}>I</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? "bg-primary text-primary-foreground" : ""}>U</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive("highlight") ? "bg-primary text-primary-foreground" : ""}>H</Button>
            <Button type="button" size="sm" variant="outline" onClick={openLinkModal} className={editor.isActive("link") ? "bg-primary text-primary-foreground" : ""}>🔗</Button>
            {editor.isActive("link") && (
              <Button type="button" size="sm" variant="outline" onClick={removeLink} className="text-red-600 hover:text-red-700">✕</Button>
            )}
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()} className={editor.isActive("heading", { level: 1 }) ? "bg-primary text-primary-foreground" : ""}>H1</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? "bg-primary text-primary-foreground" : ""}>H2</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()} className={editor.isActive("heading", { level: 3 }) ? "bg-primary text-primary-foreground" : ""}>H3</Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "bg-primary text-primary-foreground" : ""}>• List</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "bg-primary text-primary-foreground" : ""}>1. List</Button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={editor.isActive({ textAlign: "left" }) ? "bg-primary text-primary-foreground" : ""}>Left</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={editor.isActive({ textAlign: "center" }) ? "bg-primary text-primary-foreground" : ""}>Center</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={editor.isActive({ textAlign: "right" }) ? "bg-primary text-primary-foreground" : ""}>Right</Button>
          </div>

          {/* Blocks */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive("blockquote") ? "bg-primary text-primary-foreground" : ""}>Quote</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().setHorizontalRule().run()}>HR</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive("codeBlock") ? "bg-primary text-primary-foreground" : ""}>Code</Button>
          </div>

          {/* Table 
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button type="button" size="sm" variant="outline" onClick={() => {
              const tableId = `table-${Date.now()}`;
              const tableHtml = `
                <div class="notion-table-block" data-table-id="${tableId}" contenteditable="false" style="margin: 16px 0; position: relative; border: 2px solid #000000; border-radius: 6px; background: #ffffff; overflow: hidden;">
                  <div class="notion-table-container" style="overflow: auto; max-width: 100%;">
                    <table class="notion-table" style="width: 100%; border-collapse: collapse; background: #ffffff; table-layout: fixed; min-width: 300px;">
                      <tbody>
                        <tr style="border-bottom: 1px solid #000000;">
                          <td class="notion-cell" contenteditable="true" style="border-right: 1px solid #000000; padding: 8px 12px; min-width: 120px; min-height: 36px; position: relative; vertical-align: top; background: #ffffff; transition: background-color 0.1s ease; word-wrap: break-word; overflow-wrap: break-word;"></td>
                          <td class="notion-cell" contenteditable="true" style="border-right: 1px solid #000000; padding: 8px 12px; min-width: 120px; min-height: 36px; position: relative; vertical-align: top; background: #ffffff; transition: background-color 0.1s ease; word-wrap: break-word; overflow-wrap: break-word;"></td>
                        </tr>
                        <tr style="border-bottom: 1px solid #000000;">
                          <td class="notion-cell" contenteditable="true" style="border-right: 1px solid #000000; padding: 8px 12px; min-width: 120px; min-height: 36px; position: relative; vertical-align: top; background: #ffffff; transition: background-color 0.1s ease; word-wrap: break-word; overflow-wrap: break-word;"></td>
                          <td class="notion-cell" contenteditable="true" style="border-right: 1px solid #000000; padding: 8px 12px; min-width: 120px; min-height: 36px; position: relative; vertical-align: top; background: #ffffff; transition: background-color 0.1s ease; word-wrap: break-word; overflow-wrap: break-word;"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="notion-table-menu" style="position: absolute; top: 8px; right: 8px; background: #ffffff; border: 1px solid #000000; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 4px; display: none; flex-direction: row; gap: 2px; z-index: 1000; min-width: auto;">
                    <button class="notion-menu-btn" data-action="add-row-above" title="Add row above" style="padding: 6px; border: none; background: transparent; border-radius: 4px; cursor: pointer; font-size: 16px; color: #374151; text-align: center; transition: background-color 0.1s ease; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">⬆️</button>
                    <button class="notion-menu-btn" data-action="add-row-below" title="Add row below" style="padding: 6px; border: none; background: transparent; border-radius: 4px; cursor: pointer; font-size: 16px; color: #374151; text-align: center; transition: background-color 0.1s ease; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">⬇️</button>
                    <button class="notion-menu-btn" data-action="add-col-left" title="Add column left" style="padding: 6px; border: none; background: transparent; border-radius: 4px; cursor: pointer; font-size: 16px; color: #374151; text-align: center; transition: background-color 0.1s ease; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">⬅️</button>
                    <button class="notion-menu-btn" data-action="add-col-right" title="Add column right" style="padding: 6px; border: none; background: transparent; border-radius: 4px; cursor: pointer; font-size: 16px; color: #374151; text-align: center; transition: background-color 0.1s ease; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">➡️</button>
                    <div class="notion-menu-divider" style="width: 1px; background: #000000; margin: 0 2px;"></div>
                    <button class="notion-menu-btn danger" data-action="delete-row" title="Delete row" style="padding: 6px; border: none; background: transparent; border-radius: 4px; cursor: pointer; font-size: 16px; color: #dc2626; text-align: center; transition: background-color 0.1s ease; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">🗑️</button>
                    <button class="notion-menu-btn danger" data-action="delete-col" title="Delete column" style="padding: 6px; border: none; background: transparent; border-radius: 4px; cursor: pointer; font-size: 16px; color: #dc2626; text-align: center; transition: background-color 0.1s ease; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">🗑️</button>
                  </div>
                </div>
              `;
              
              // Insert as raw HTML with inline styles
              editor.chain().focus().insertContent(tableHtml).run();
            }}>📊 Table</Button>
          </div>
          */}

          {/* Media */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded border hover:bg-accent">
              <input type="file" accept="image/*" className="hidden" onChange={onPickFile} />
              📷 Upload
            </label>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↶</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↷</Button>
            <Button type="button" size="sm" onClick={() => onTogglePreview?.(!preview)}>{preview ? "✏️ Edit" : "👁️ Preview"}</Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto" id={id} aria-labelledby={id ? `${id}-label` : undefined}>
          <EditorContent editor={editor} />
        </div>

        {/* Table Styles */}
        <style>{`
          .notion-table-block {
            margin: 16px 0;
            position: relative;
            border: 2px solid #000000;
            border-radius: 6px;
            background: #ffffff;
            overflow: hidden;
          }
          .notion-table-container {
            overflow: auto;
            max-width: 100%;
          }
          .notion-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            table-layout: fixed;
            min-width: 300px;
          }
          .notion-table tr {
            border-bottom: 1px solid #000000;
          }
          .notion-table tr:last-child {
            border-bottom: none;
          }
          .notion-cell {
            border-right: 1px solid #000000;
            padding: 8px 12px;
            min-width: 120px;
            min-height: 36px;
            position: relative;
            vertical-align: top;
            background: #ffffff;
            transition: background-color 0.1s ease;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .notion-cell:last-child {
            border-right: none;
          }
          .notion-cell:focus {
            outline: none;
            background: #f3f4f6;
            box-shadow: inset 0 0 0 1px #3b82f6;
          }
          .notion-cell:hover {
            background: #f9fafb;
          }
          .notion-cell:empty:before {
            content: "Type here...";
            color: #9ca3af;
            pointer-events: none;
            font-style: italic;
          }
          .notion-table-menu {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #ffffff;
            border: 1px solid #000000;
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            padding: 4px;
            display: none;
            flex-direction: row;
            gap: 2px;
            z-index: 1000;
            min-width: auto;
          }
          .notion-table-block:hover .notion-table-menu {
            display: flex !important;
          }
          .notion-menu-btn {
            padding: 6px;
            border: none;
            background: transparent;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            color: #374151;
            text-align: center;
            transition: background-color 0.1s ease;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .notion-menu-btn:hover {
            background: #f3f4f6;
          }
          .notion-menu-btn.danger {
            color: #dc2626;
          }
          .notion-menu-btn.danger:hover {
            background: #fef2f2;
          }
          .notion-menu-divider {
            width: 1px;
            background: #000000;
            margin: 0 2px;
          }
          .notion-cell[contenteditable="true"] {
            resize: none;
            overflow: hidden;
            min-height: 36px;
            max-height: 200px;
          }
          .notion-cell[contenteditable="true"]:focus {
            min-height: 50px;
          }
          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            .notion-table-block {
              border-color: #ffffff;
              background: #1f2937;
            }
            .notion-table {
              background: #1f2937;
            }
            .notion-table tr {
              border-bottom-color: #ffffff;
            }
            .notion-cell {
              border-right-color: #ffffff;
              background: #1f2937;
              color: #f9fafb;
            }
            .notion-cell:focus {
              background: #374151;
              box-shadow: inset 0 0 0 1px #60a5fa;
            }
            .notion-cell:hover {
              background: #374151;
            }
            .notion-cell:empty:before {
              color: #6b7280;
            }
            .notion-table-menu {
              background: #1f2937;
              border-color: #ffffff;
            }
            .notion-menu-btn {
              color: #f9fafb;
            }
            .notion-menu-btn:hover {
              background: #374151;
            }
            .notion-menu-btn.danger {
              color: #f87171;
            }
            .notion-menu-btn.danger:hover {
              background: #7f1d1d;
            }
            .notion-menu-divider {
              background: #ffffff;
            }
          }
        `}</style>
      </CardContent>

      {/* Image Editor Modal */}
      {showImageEditor && selectedImageFile && (
        <ImageEditor
          imageFile={selectedImageFile}
          onSave={handleImageEditorSave}
          onCancel={handleImageEditorCancel}
        />
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleLinkCancel();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleLinkCancel();
            }
          }}
          tabIndex={-1}
        >
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Adicionar Link</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Dica: Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> para abrir rapidamente
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">URL do Link</label>
                  <Input
                    type="url"
                    placeholder="https://exemplo.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLinkSave();
                      }
                    }}
                    className="w-full"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Texto do Link (opcional)</label>
                  <Input
                    type="text"
                    placeholder="Texto que será exibido"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Se deixar vazio, será usado o texto selecionado ou a URL
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={handleLinkSave} className="flex-1">
                  Adicionar Link
                </Button>
                <Button variant="outline" onClick={handleLinkCancel}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}


