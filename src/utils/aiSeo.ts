import { ImageSeoMetadata } from '../types';

/**
 * Converts a Blob or File to a base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Resizes an image in-memory to max 1280px to keep payload light and fast for AI visual analysis
 */
export async function prepareImageForAi(fileOrBlob: Blob): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1200;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, mimeType: 'image/jpeg' });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for AI analysis'));
    };

    img.src = url;
  });
}

/**
 * Request SEO metadata from the backend Gemini API
 */
export async function generateImageSeo(
  fileOrBlob: Blob,
  fileName: string
): Promise<ImageSeoMetadata> {
  const { base64, mimeType } = await prepareImageForAi(fileOrBlob);

  const response = await fetch('/api/ai/seo-metadata', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64: base64,
      mimeType,
      currentName: fileName,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to generate SEO metadata (Status ${response.status})`);
  }

  const data: ImageSeoMetadata = await response.json();
  return data;
}
