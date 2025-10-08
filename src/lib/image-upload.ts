import { supabase } from "@/lib/supabase";

function dataURLToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

export async function compressImage(file: File, maxW = 600, quality = 0.4): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    
    // Calculate scale to fit within max width while maintaining aspect ratio
    const scale = Math.min(1, maxW / bitmap.width);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    console.log(`Original: ${bitmap.width}x${bitmap.height}, Compressed: ${w}x${h}`);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      console.warn('Canvas context not available, returning original file');
      return file;
    }

    // Set image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw the compressed image
    ctx.drawImage(bitmap, 0, 0, w, h);
    
    // Convert to JPEG with compression
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const blob = dataURLToBlob(dataUrl);
    
    console.log(`Compression: ${file.size} -> ${blob.size} bytes (${Math.round((1 - blob.size / file.size) * 100)}% reduction)`);
    
    return blob;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original file if compression fails
  }
}

export async function uploadToSupabaseStorage(file: Blob, ext = "jpg"): Promise<string> {
  try {
    const path = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    console.log('Uploading to path:', path);
    
    const { data, error } = await supabase.storage.from("posts-image").upload(path, file, {
      upsert: false,
      cacheControl: "31536000",
      contentType: file.type || `image/${ext}`,
    });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
    
    console.log('Upload successful:', data);
    const { data: pub } = supabase.storage.from("posts-image").getPublicUrl(data.path);
    console.log('Public URL:', pub.publicUrl);
    
    return pub.publicUrl;
  } catch (error) {
    console.error('Error in uploadToSupabaseStorage:', error);
    throw error;
  }
}


