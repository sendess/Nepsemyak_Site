/**
 * Resizes a photo in the browser (longest side 1600 px, WebP) and uploads it, so a phone photo of
 * several MB is stored as roughly 150 KB. Used by the admin image fields.
 */
const MAX_SIDE = 1600;

async function resize(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
  if (!blob) throw new Error('This browser could not convert the image.');
  return { blob, width, height };
}

/** Returns the new image's id, URL and stored size. */
export async function uploadImage(file: File): Promise<{ id: string; url: string; kb: number }> {
  const { blob, width, height } = await resize(file);
  const body = new FormData();
  body.append('file', blob, 'image.webp');
  body.append('width', String(width));
  body.append('height', String(height));
  const res = await fetch('/api/admin/media', { method: 'POST', body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'Upload failed.');
  return { id: data.id, url: data.url, kb: Math.round(blob.size / 1024) };
}
