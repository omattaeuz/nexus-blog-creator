import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, RotateCw, RotateCcw, Crop, Move, Download } from 'lucide-react';
import { uploadToSupabaseStorage } from '@/lib/image-upload';

interface ImageEditorProps {
  imageFile: File;
  onSave: (editedImage: string) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageEditor({ imageFile, onSave, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'full'>('center');
  const [resizeMode, setResizeMode] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: 0, height: 0 });
  const [imageDisplayPos, setImageDisplayPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setImageSize({ width: img.width, height: img.height });
      setCropArea({ x: 0, y: 0, width: img.width, height: img.height });
      
      // Calculate initial display size to fit in canvas
      const canvasWidth = 600;
      const canvasHeight = 400;
      const aspectRatio = img.width / img.height;
      
      let displayWidth = canvasWidth * 0.8;
      let displayHeight = displayWidth / aspectRatio;
      
      if (displayHeight > canvasHeight * 0.8) {
        displayHeight = canvasHeight * 0.8;
        displayWidth = displayHeight * aspectRatio;
      }
      
      setImageDisplaySize({ width: displayWidth, height: displayHeight });
      setImageDisplayPos({ 
        x: (canvasWidth - displayWidth) / 2, 
        y: (canvasHeight - displayHeight) / 2 
      });
    };
    img.src = URL.createObjectURL(imageFile);
  }, [imageFile]);

  const drawImage = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawWidth = imageDisplaySize.width;
    const drawHeight = imageDisplaySize.height;
    const x = imageDisplayPos.x;
    const y = imageDisplayPos.y;

    // Apply filters
    ctx.filter = `
      brightness(${brightness}%) 
      contrast(${contrast}%) 
      saturate(${saturation}%)
    `;

    ctx.save();

    // Apply rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw image
    ctx.drawImage(image, x, y, drawWidth, drawHeight);

    // Restore context
    ctx.restore();

    // Draw crop overlay if in crop mode
    if (cropMode) drawCropOverlay(ctx, x, y, drawWidth, drawHeight);

    // Draw resize handles if in resize mode
    if (resizeMode) drawResizeHandles(ctx, x, y, drawWidth, drawHeight);

  };

  const drawCropOverlay = (ctx: CanvasRenderingContext2D, imgX: number, imgY: number, imgWidth: number, imgHeight: number) => {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Clear crop area
    ctx.clearRect(
      imgX + (cropArea.x / imageSize.width) * imgWidth,
      imgY + (cropArea.y / imageSize.height) * imgHeight,
      (cropArea.width / imageSize.width) * imgWidth,
      (cropArea.height / imageSize.height) * imgHeight
    );

    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      imgX + (cropArea.x / imageSize.width) * imgWidth,
      imgY + (cropArea.y / imageSize.height) * imgHeight,
      (cropArea.width / imageSize.width) * imgWidth,
      (cropArea.height / imageSize.height) * imgHeight
    );
  };

  const drawResizeHandles = (ctx: CanvasRenderingContext2D, imgX: number, imgY: number, imgWidth: number, imgHeight: number) => {
    const handleSize = 8;
    const handles = [
      { x: imgX - handleSize/2, y: imgY - handleSize/2, cursor: 'nw-resize' }, // top-left
      { x: imgX + imgWidth/2 - handleSize/2, y: imgY - handleSize/2, cursor: 'n-resize' }, // top
      { x: imgX + imgWidth - handleSize/2, y: imgY - handleSize/2, cursor: 'ne-resize' }, // top-right
      { x: imgX + imgWidth - handleSize/2, y: imgY + imgHeight/2 - handleSize/2, cursor: 'e-resize' }, // right
      { x: imgX + imgWidth - handleSize/2, y: imgY + imgHeight - handleSize/2, cursor: 'se-resize' }, // bottom-right
      { x: imgX + imgWidth/2 - handleSize/2, y: imgY + imgHeight - handleSize/2, cursor: 's-resize' }, // bottom
      { x: imgX - handleSize/2, y: imgY + imgHeight - handleSize/2, cursor: 'sw-resize' }, // bottom-left
      { x: imgX - handleSize/2, y: imgY + imgHeight/2 - handleSize/2, cursor: 'w-resize' }, // left
    ];

    // Draw border around image
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(imgX, imgY, imgWidth, imgHeight);

    // Draw resize handles
    handles.forEach((handle, index) => {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  };

  const getResizeHandle = (mouseX: number, mouseY: number, imgX: number, imgY: number, imgWidth: number, imgHeight: number): string | null => {
    const handleSize = 8;
    const tolerance = 4;
    
    const handles = [
      { x: imgX - handleSize/2, y: imgY - handleSize/2, type: 'nw' },
      { x: imgX + imgWidth/2 - handleSize/2, y: imgY - handleSize/2, type: 'n' },
      { x: imgX + imgWidth - handleSize/2, y: imgY - handleSize/2, type: 'ne' },
      { x: imgX + imgWidth - handleSize/2, y: imgY + imgHeight/2 - handleSize/2, type: 'e' },
      { x: imgX + imgWidth - handleSize/2, y: imgY + imgHeight - handleSize/2, type: 'se' },
      { x: imgX + imgWidth/2 - handleSize/2, y: imgY + imgHeight - handleSize/2, type: 's' },
      { x: imgX - handleSize/2, y: imgY + imgHeight - handleSize/2, type: 'sw' },
      { x: imgX - handleSize/2, y: imgY + imgHeight/2 - handleSize/2, type: 'w' },
    ];

    for (const handle of handles) {
      if (mouseX >= handle.x - tolerance && mouseX <= handle.x + handleSize + tolerance &&
          mouseY >= handle.y - tolerance && mouseY <= handle.y + handleSize + tolerance) {
        return handle.type;
      }
    }
    return null;
  };

  useEffect(() => {
    drawImage();
  }, [image, scale, rotation, brightness, contrast, saturation, cropMode, cropArea, resizeMode, imageDisplaySize, imageDisplayPos]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (resizeMode) {
      const handle = getResizeHandle(mouseX, mouseY, imageDisplayPos.x, imageDisplayPos.y, imageDisplaySize.width, imageDisplaySize.height);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        setDragStart({ x: mouseX, y: mouseY });
        return;
      }
    }

    if (cropMode) {
      setIsDragging(true);
      setDragStart({ x: mouseX, y: mouseY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (isResizing && resizeHandle) {
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;
      
      let newWidth = imageDisplaySize.width;
      let newHeight = imageDisplaySize.height;
      let newX = imageDisplayPos.x;
      let newY = imageDisplayPos.y;

      const aspectRatio = imageSize.width / imageSize.height;

      switch (resizeHandle) {
        case 'se': // bottom-right
          newWidth = Math.max(50, imageDisplaySize.width + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(50, imageDisplaySize.width - deltaX);
          newHeight = newWidth / aspectRatio;
          newX = imageDisplayPos.x + (imageDisplaySize.width - newWidth);
          break;
        case 'ne': // top-right
          newWidth = Math.max(50, imageDisplaySize.width + deltaX);
          newHeight = newWidth / aspectRatio;
          newY = imageDisplayPos.y + (imageDisplaySize.height - newHeight);
          break;
        case 'nw': // top-left
          newWidth = Math.max(50, imageDisplaySize.width - deltaX);
          newHeight = newWidth / aspectRatio;
          newX = imageDisplayPos.x + (imageDisplaySize.width - newWidth);
          newY = imageDisplayPos.y + (imageDisplaySize.height - newHeight);
          break;
        case 'e': // right
          newWidth = Math.max(50, imageDisplaySize.width + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'w': // left
          newWidth = Math.max(50, imageDisplaySize.width - deltaX);
          newHeight = newWidth / aspectRatio;
          newX = imageDisplayPos.x + (imageDisplaySize.width - newWidth);
          break;
        case 's': // bottom
          newHeight = Math.max(50, imageDisplaySize.height + deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case 'n': // top
          newHeight = Math.max(50, imageDisplaySize.height - deltaY);
          newWidth = newHeight * aspectRatio;
          newY = imageDisplayPos.y + (imageDisplaySize.height - newHeight);
          break;
      }

      setImageDisplaySize({ width: newWidth, height: newHeight });
      setImageDisplayPos({ x: newX, y: newY });
      setDragStart({ x: currentX, y: currentY });
    } else if (isDragging && cropMode) {
      const newCropArea = {
        x: Math.min(dragStart.x, currentX),
        y: Math.min(dragStart.y, currentY),
        width: Math.abs(currentX - dragStart.x),
        height: Math.abs(currentY - dragStart.y)
      };

      setCropArea(newCropArea);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const rotateImage = (direction: 'left' | 'right') => {
    setRotation(prev => prev + (direction === 'left' ? -90 : 90));
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setScale(1);
  };

  const applyCrop = async () => {
    if (!image || !canvasRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to crop area
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply rotation and draw cropped image
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.filter = `
      brightness(${brightness}%) 
      contrast(${contrast}%) 
      saturate(${saturation}%)
    `;

    ctx.drawImage(
      image,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, canvas.width, canvas.height
    );

    ctx.restore();

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.9);
    });

    // Upload to Supabase Storage
    const imageUrl = await uploadToSupabaseStorage(blob, 'jpg');
    
    // Create a temporary div to generate the HTML with alignment
    const tempDiv = document.createElement('div');
    const img = document.createElement('img');
    img.src = imageUrl;
    img.setAttribute('data-align', alignment);
    img.className = 'prose-image';
    tempDiv.appendChild(img);
    
    // Return the HTML string with the uploaded image URL
    onSave(tempDiv.innerHTML);
  };

  const saveImage = async () => {
    if (cropMode) {
      applyCrop();
    } else {
      // Save without crop
      if (!image || !canvasRef.current) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Use display size for final output
      canvas.width = imageDisplaySize.width;
      canvas.height = imageDisplaySize.height;

      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.filter = `
        brightness(${brightness}%) 
        contrast(${contrast}%) 
        saturate(${saturation}%)
      `;

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.9);
      });

      // Upload to Supabase Storage
      const imageUrl = await uploadToSupabaseStorage(blob, 'jpg');
      
      const tempDiv = document.createElement('div');
      const img = document.createElement('img');
      img.src = imageUrl;
      img.setAttribute('data-align', alignment);
      img.className = 'prose-image';
      tempDiv.appendChild(img);
      
      onSave(tempDiv.innerHTML);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <CardTitle>Editor de Imagem</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4 overflow-y-auto flex-1 p-4">
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded-lg cursor-crosshair max-w-full"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Controles Básicos</h3>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rotateImage('left')}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rotateImage('right')}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant={cropMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCropMode(!cropMode);
                    if (cropMode) setResizeMode(false);
                  }}
                >
                  <Crop className="h-4 w-4" />
                </Button>
                <Button
                  variant={resizeMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setResizeMode(!resizeMode);
                    if (resizeMode) setCropMode(false);
                  }}
                >
                  <Move className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Alinhamento</Label>
                <Select value={alignment} onValueChange={(value: any) => setAlignment(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Esquerda</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="right">Direita</SelectItem>
                    <SelectItem value="full">Largura Total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Filtros</h3>
              
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Brilho: {brightness}%</Label>
                  <Slider
                    value={[brightness]}
                    onValueChange={([value]) => setBrightness(value)}
                    min={0}
                    max={200}
                    step={1}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Contraste: {contrast}%</Label>
                  <Slider
                    value={[contrast]}
                    onValueChange={([value]) => setContrast(value)}
                    min={0}
                    max={200}
                    step={1}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Saturação: {saturation}%</Label>
                  <Slider
                    value={[saturation]}
                    onValueChange={([value]) => setSaturation(value)}
                    min={0}
                    max={200}
                    step={1}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t flex-shrink-0">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={saveImage}>
              <Download className="h-4 w-4 mr-2" />
              Salvar Imagem
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}