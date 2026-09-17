/**
 * Client-side image compression utility
 * Shrinks raw camera photos (5-15MB) to clean WebP/JPEG (~80-150KB) in ~30ms.
 * Solves Vercel timeout, 413 Payload Too Large, and slow mobile uploads.
 */
export async function compressImage(
  file: File,
  maxDimension = 900,
  quality = 0.8
): Promise<{ file: File; dataUrl: string }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve({ file, dataUrl: '' });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      // Scale down proportionally if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve({ file, dataUrl: '' });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Fast toBlob without expensive toDataURL strings
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ file, dataUrl: '' });
            return;
          }
          const cleanName = file.name.replace(/\.[^.]+$/, '') + '.webp';
          const compressedFile = new File([blob], cleanName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve({ file: compressedFile, dataUrl: URL.createObjectURL(blob) });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ file, dataUrl: '' });
    };

    img.src = objectUrl;
  });
}
