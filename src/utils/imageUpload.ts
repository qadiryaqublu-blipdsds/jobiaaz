/**
 * Helper utility for handling local image file conversions, resizing, and optimizations
 * for Candidate Profile Photos and Company Logos.
 */

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeMB?: number;
}

/**
 * Reads a File object and compresses/resizes it client-side into a clean Base64 data URL.
 */
export async function fileToDataUrl(
  file: File,
  options: ImageUploadOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85,
    maxFileSizeMB = 5,
  } = options;

  if (file.size > maxFileSizeMB * 1024 * 1024) {
    throw new Error(`Fayl ölçüsü ${maxFileSizeMB}MB-dan böyük ola bilməz.`);
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Yalnız JPG, PNG, WebP və ya SVG formatında şəkillər qəbul olunur.');
  }

  // If it's an SVG, read directly as data URL without rasterizing on canvas
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Faylı oxumaq mümkün olmadı.'));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio downscaling if larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Draw and export optimized image
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Şəkil formatını emal etmək mümkün olmadı.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Faylı oxumaq mümkün olmadı.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generates an avatar URL for a company or candidate using DiceBear SVG
 */
export function generateSeedAvatar(seed: string, type: 'initials' | 'identicon' | 'bottts' = 'initials'): string {
  const cleanSeed = encodeURIComponent((seed || 'User').trim());
  return `https://api.dicebear.com/7.x/${type}/svg?seed=${cleanSeed}`;
}
