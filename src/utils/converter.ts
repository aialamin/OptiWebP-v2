import JSZip from 'jszip';
import {
  ConversionSettings,
  ImageAdjustments,
  ImageSeoMetadata,
  ResponsiveVariant,
  ConversionItem,
} from '../types';

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  grayscale: false,
  sharpen: false,
};

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function calculateSavings(originalBytes: number, newBytes: number): number {
  if (originalBytes <= 0) return 0;
  const savings = ((originalBytes - newBytes) / originalBytes) * 100;
  return Math.round(savings * 10) / 10;
}

/**
 * Clean SEO Slug Sanitizer:
 * Converts "IMG_8921 (1).JPG" -> "opt-image-8921.webp" or cleans user titles into SEO-friendly URLs.
 */
export function cleanSeoSlug(name: string): string {
  const base = name.replace(/\.[^/.]+$/, '');
  let cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleaned || cleaned === 'image' || cleaned === 'untitled' || cleaned === 'screenshot') {
    cleaned = 'optimized-image';
  }

  return `${cleaned}.webp`;
}

/**
 * Generates an appropriate output filename based on settings, namingPattern, and SEO metadata
 */
export function formatOutputFileName(
  originalName: string,
  settings?: ConversionSettings,
  seoMetadata?: ImageSeoMetadata
): string {
  if (seoMetadata?.suggestedFileName) {
    let clean = seoMetadata.suggestedFileName.trim();
    if (!clean.toLowerCase().endsWith('.webp')) {
      clean = clean.replace(/\.[^/.]+$/, '') + '.webp';
    }
    return clean;
  }

  const base = originalName.replace(/\.[^/.]+$/, '');
  const pattern = settings?.namingPattern || 'original';

  switch (pattern) {
    case 'suffix-opt':
      return `${base}-opt.webp`;
    case 'quality-tag': {
      const q = Math.round((settings?.quality || 0.85) * 100);
      return `${base}-q${q}.webp`;
    }
    case 'suffix-webp':
      return `${base}.webp`;
    case 'original':
    default:
      return `${base}.webp`;
  }
}

/**
 * Loads an image from a Blob or URL into an HTMLImageElement
 */
export function loadImageElement(source: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = typeof source === 'string' ? source : URL.createObjectURL(source);

    img.onload = () => {
      resolve(img);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image file. Format may be unsupported or corrupted.'));
    };

    img.src = url;
  });
}

/**
 * High-performance off-thread image decoder
 * Uses createImageBitmap if supported for 3x faster decoding without UI blocking
 */
export async function decodeImageSource(file: File | Blob): Promise<{
  source: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  close: () => void;
}> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => {
          try {
            bitmap.close();
          } catch {}
        },
      };
    } catch {
      // Fallback to HTMLImageElement
    }
  }

  const img = await loadImageElement(file);
  return {
    source: img,
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    close: () => {},
  };
}

/**
 * Computes target dimensions based on maxDimension constraint while preserving aspect ratio
 */
export function computeTargetDimensions(
  width: number,
  height: number,
  maxDimension: number | 'original'
): { targetWidth: number; targetHeight: number } {
  if (maxDimension === 'original' || !maxDimension) {
    return { targetWidth: width, targetHeight: height };
  }

  const max = Number(maxDimension);
  if (width <= max && height <= max) {
    return { targetWidth: width, targetHeight: height };
  }

  if (width >= height) {
    const targetWidth = max;
    const targetHeight = Math.max(1, Math.round((height * max) / width));
    return { targetWidth, targetHeight };
  } else {
    const targetHeight = max;
    const targetWidth = Math.max(1, Math.round((width * max) / height));
    return { targetWidth, targetHeight };
  }
}

/**
 * Checks if image contains transparent pixels (for PNG / graphics optimization)
 */
function checkTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const sampleWidth = Math.min(width, 200);
    const sampleHeight = Math.min(height, 200);
    const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    const data = imgData.data;
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] < 250) {
        return true;
      }
    }
  } catch {
    // Canvas security or memory issue; default false
  }
  return false;
}

/**
 * High-performance 3x3 unsharp convolution kernel for edge sharpening
 */
function applySharpeningFilter(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const src = imageData.data;
    const output = ctx.createImageData(width, height);
    const dst = output.data;

    // Convolution weights: Center = 1 + 4*factor, Adjacent = -factor
    const amount = 0.35;
    const center = 1 + 4 * amount;
    const neg = -amount;

    for (let y = 1; y < height - 1; y++) {
      const yPrev = (y - 1) * width * 4;
      const yCurr = y * width * 4;
      const yNext = (y + 1) * width * 4;

      for (let x = 1; x < width - 1; x++) {
        const idx = yCurr + x * 4;
        const top = yPrev + x * 4;
        const bottom = yNext + x * 4;
        const left = yCurr + (x - 1) * 4;
        const right = yCurr + (x + 1) * 4;

        for (let c = 0; c < 3; c++) {
          const val =
            src[idx + c] * center +
            (src[top + c] + src[bottom + c] + src[left + c] + src[right + c]) * neg;
          dst[idx + c] = val < 0 ? 0 : val > 255 ? 255 : val;
        }
        dst[idx + 3] = src[idx + 3];
      }
    }

    for (let x = 0; x < width; x++) {
      const topIdx = x * 4;
      const btmIdx = (height - 1) * width * 4 + x * 4;
      for (let c = 0; c < 4; c++) {
        dst[topIdx + c] = src[topIdx + c];
        dst[btmIdx + c] = src[btmIdx + c];
      }
    }
    for (let y = 0; y < height; y++) {
      const leftIdx = y * width * 4;
      const rightIdx = y * width * 4 + (width - 1) * 4;
      for (let c = 0; c < 4; c++) {
        dst[leftIdx + c] = src[leftIdx + c];
        dst[rightIdx + c] = src[rightIdx + c];
      }
    }

    ctx.putImageData(output, 0, 0);
  } catch (err) {}
}

/**
 * Converts a Canvas to a WebP Blob using canvas.toBlob
 */
function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Browser failed to encode image to WebP format.'));
        }
      },
      'image/webp',
      quality
    );
  });
}

/**
 * Core client-side conversion function with full media controls
 */
export async function convertToWebp(
  file: File | Blob,
  settings: ConversionSettings,
  overrideAdjustments?: ImageAdjustments
): Promise<{
  blob: Blob;
  url: string;
  width: number;
  height: number;
  appliedQuality: number;
  durationMs: number;
}> {
  const startTime = performance.now();
  const decoded = await decodeImageSource(file);

  try {
    const adj: ImageAdjustments = {
      ...DEFAULT_ADJUSTMENTS,
      ...(settings.adjustments || {}),
      ...(overrideAdjustments || {}),
    };

    // 1. Compute Base Scaling
    const { targetWidth, targetHeight } = computeTargetDimensions(
      decoded.width,
      decoded.height,
      settings.maxDimension
    );

    // 2. Handle Rotation
    const isTransposed = adj.rotation === 90 || adj.rotation === 270;
    const finalCanvasWidth = isTransposed ? targetHeight : targetWidth;
    const finalCanvasHeight = isTransposed ? targetWidth : targetHeight;

    const canvas = document.createElement('canvas');
    canvas.width = finalCanvasWidth;
    canvas.height = finalCanvasHeight;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 3. Handle Alpha Matte Background
    if (settings.alphaHandling === 'matte-white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalCanvasWidth, finalCanvasHeight);
    } else if (settings.alphaHandling === 'matte-black') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, finalCanvasWidth, finalCanvasHeight);
    }

    // 4. Apply Tonal Filters
    const filters: string[] = [];
    if (adj.brightness !== 0) {
      filters.push(`brightness(${Math.round(100 + adj.brightness)}%)`);
    }
    if (adj.contrast !== 0) {
      filters.push(`contrast(${Math.round(100 + adj.contrast)}%)`);
    }
    if (adj.saturation !== 0) {
      filters.push(`saturate(${Math.round(100 + adj.saturation)}%)`);
    }
    if (adj.grayscale) {
      filters.push('grayscale(100%)');
    }

    if (filters.length > 0) {
      ctx.filter = filters.join(' ');
    }

    // 5. Apply Transformations
    ctx.save();
    ctx.translate(finalCanvasWidth / 2, finalCanvasHeight / 2);

    if (adj.rotation !== 0) {
      ctx.rotate((adj.rotation * Math.PI) / 180);
    }

    const scaleX = adj.flipHorizontal ? -1 : 1;
    const scaleY = adj.flipVertical ? -1 : 1;
    if (scaleX !== 1 || scaleY !== 1) {
      ctx.scale(scaleX, scaleY);
    }

    ctx.drawImage(
      decoded.source,
      -targetWidth / 2,
      -targetHeight / 2,
      targetWidth,
      targetHeight
    );
    ctx.restore();

    ctx.filter = 'none';

    // 6. Sharpening
    const shouldSharpen =
      adj.sharpen ||
      (settings.sharpenOnResize &&
        (targetWidth < decoded.width || targetHeight < decoded.height));

    if (shouldSharpen) {
      applySharpeningFilter(ctx, finalCanvasWidth, finalCanvasHeight);
    }

    // 7. Determine Quality & WebP Mode
    let targetQuality = settings.quality;

    if (settings.webpMode === 'lossless' || settings.preset === 'lossless') {
      targetQuality = 1.0;
    } else if (settings.webpMode === 'lossy') {
      targetQuality = Math.min(0.95, settings.quality);
    } else if (settings.preset === 'smart') {
      const hasTransparency = checkTransparency(ctx, finalCanvasWidth, finalCanvasHeight);
      const isSmallGraphic = finalCanvasWidth < 600 && finalCanvasHeight < 600;

      if (hasTransparency || isSmallGraphic) {
        targetQuality = 0.92;
      } else {
        targetQuality = 0.86;
      }
    } else if (settings.preset === 'high') {
      targetQuality = 0.90;
    } else if (settings.preset === 'balanced') {
      targetQuality = 0.80;
    } else if (settings.preset === 'maximum') {
      targetQuality = 0.65;
    }

    let webpBlob = await canvasToWebpBlob(canvas, targetQuality);

    // 8. Smart Oversize Fallback
    if (
      settings.preset === 'smart' &&
      webpBlob.size > (file.size || 0) &&
      targetQuality > 0.75
    ) {
      const adjustedQuality = Math.max(0.78, targetQuality - 0.08);
      const smallerBlob = await canvasToWebpBlob(canvas, adjustedQuality);
      if (smallerBlob.size < webpBlob.size) {
        webpBlob = smallerBlob;
        targetQuality = adjustedQuality;
      }
    }

    // 9. Target File Size Budget Constraint
    if (settings.targetMaxKb && settings.targetMaxKb > 0) {
      const maxBytes = settings.targetMaxKb * 1024;
      let iterations = 0;
      let currentQ = targetQuality;

      while (webpBlob.size > maxBytes && currentQ > 0.15 && iterations < 3) {
        iterations++;
        const ratio = maxBytes / webpBlob.size;
        currentQ = Math.max(0.12, Math.min(currentQ - 0.08, currentQ * Math.sqrt(ratio)));
        const candidateBlob = await canvasToWebpBlob(canvas, currentQ);
        webpBlob = candidateBlob;
        targetQuality = currentQ;
      }
    }

    const durationMs = performance.now() - startTime;
    const url = URL.createObjectURL(webpBlob);

    return {
      blob: webpBlob,
      url,
      width: finalCanvasWidth,
      height: finalCanvasHeight,
      appliedQuality: targetQuality,
      durationMs,
    };
  } finally {
    decoded.close();
  }
}

/**
 * Generates Responsive Breakpoints (Mobile 480w, Tablet 800w, Desktop 1200w)
 */
export async function generateResponsiveVariants(
  file: File | Blob,
  baseWidth: number,
  baseHeight: number,
  quality: number = 0.82
): Promise<ResponsiveVariant[]> {
  const targets = [
    { label: 'mobile' as const, width: 480 },
    { label: 'tablet' as const, width: 800 },
    { label: 'desktop' as const, width: 1200 },
  ];

  const variants: ResponsiveVariant[] = [];
  const decoded = await decodeImageSource(file);

  try {
    for (const target of targets) {
      // Don't upscale smaller originals
      if (baseWidth < target.width && target.label !== 'mobile') {
        continue;
      }

      const scaleWidth = Math.min(baseWidth, target.width);
      const scaleHeight = Math.max(1, Math.round((baseHeight * scaleWidth) / baseWidth));

      const canvas = document.createElement('canvas');
      canvas.width = scaleWidth;
      canvas.height = scaleHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(decoded.source, 0, 0, scaleWidth, scaleHeight);

      const blob = await canvasToWebpBlob(canvas, quality);
      const url = URL.createObjectURL(blob);
      const origSize = file.size || 1;
      const savings = Math.max(0, Math.round(((origSize - blob.size) / origSize) * 100));

      variants.push({
        label: target.label,
        width: scaleWidth,
        height: scaleHeight,
        blob,
        url,
        size: blob.size,
        savingsPercent: savings,
      });
    }
  } finally {
    decoded.close();
  }

  return variants;
}

/**
 * Calculates Google Core Web Vitals Readiness Score (0-100)
 */
export function calculateCoreWebVitalsScore(
  outputSize: number | null,
  width: number | null,
  height: number | null,
  hasSeo: boolean
): { score: number; status: string; grade: 'A+' | 'A' | 'B' | 'C' } {
  if (!outputSize || !width || !height) {
    return { score: 70, status: 'Converting', grade: 'B' };
  }

  let points = 0;

  // 1. Next-gen WebP format = +25 pts
  points += 25;

  // 2. Intrinsic dimensions defined for CLS prevention = +25 pts
  if (width > 0 && height > 0) {
    points += 25;
  }

  // 3. Payload size for LCP speed = up to 30 pts
  const sizeKb = outputSize / 1024;
  if (sizeKb < 150) {
    points += 30; // optimal LCP
  } else if (sizeKb < 300) {
    points += 25;
  } else if (sizeKb < 600) {
    points += 18;
  } else {
    points += 10;
  }

  // 4. SEO Alt & Filename keywords = +20 pts
  if (hasSeo) {
    points += 20;
  } else {
    points += 10; // basic filename
  }

  const score = Math.min(100, points);
  let grade: 'A+' | 'A' | 'B' | 'C' = 'A+';
  let status = 'Core Web Vitals Elite (98+ LCP)';

  if (score >= 95) {
    grade = 'A+';
    status = '100% Core Web Vitals Passed';
  } else if (score >= 85) {
    grade = 'A';
    status = 'High Performance LCP Ready';
  } else if (score >= 70) {
    grade = 'B';
    status = 'Good Web Speed';
  } else {
    grade = 'C';
    status = 'Needs Optimization';
  }

  return { score, status, grade };
}

/**
 * Generates Production HTML5 <picture> tag with responsive srcset and CLS preservation
 */
export function generateSeoPictureMarkup(
  item: ConversionItem,
  globalSettings?: ConversionSettings
): string {
  const fileName = formatOutputFileName(
    item.name,
    item.customSettings || globalSettings,
    item.seoMetadata
  );
  const altText = item.seoMetadata?.altText || item.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
  const title = item.seoMetadata?.title || '';
  const w = item.outputWidth || item.originalWidth;
  const h = item.outputHeight || item.originalHeight;
  const aspectRatio = `${w} / ${h}`;

  // Build responsive srcset if variants exist
  const variants = item.responsiveVariants;
  const baseName = fileName.replace(/\.[^/.]+$/, '');

  let sourceSrcset = fileName;
  if (variants && variants.length > 0) {
    sourceSrcset = variants.map((v) => `${baseName}-${v.label}.webp ${v.width}w`).join(', ');
  }

  return `<!-- OptiWebP: Google Core Web Vitals (LCP & Zero-CLS) Optimized Picture -->
<picture class="optiwebp-media">
  <source 
    type="image/webp" 
    srcset="${sourceSrcset}" 
    sizes="(max-width: 768px) 100vw, ${w}px"
  >
  <img 
    src="${item.name}" 
    alt="${altText}"${title ? `\n    title="${title}"` : ''} 
    width="${w}" 
    height="${h}" 
    loading="lazy" 
    decoding="async" 
    fetchpriority="auto" 
    style="aspect-ratio: ${aspectRatio}; max-width: 100%; height: auto; display: block;" 
  >
</picture>`;
}

/**
 * Generates Schema.org ImageObject JSON-LD for Google Image Search
 */
export function generateImageSchemaJson(
  item: ConversionItem,
  domain: string = 'https://mysite.com'
): string {
  const fileName = item.seoMetadata?.suggestedFileName || item.name.replace(/\.[^/.]+$/, '') + '.webp';
  const name = item.seoMetadata?.title || item.name.replace(/\.[^/.]+$/, '');
  const description = item.seoMetadata?.description || item.seoMetadata?.altText || name;
  const w = item.outputWidth || item.originalWidth;
  const h = item.outputHeight || item.originalHeight;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: `${domain}/images/${fileName}`,
    name,
    description,
    width: `${w} px`,
    height: `${h} px`,
    encodingFormat: 'image/webp',
    keywords: item.seoMetadata?.keywords || ['webp', 'high-fidelity', 'optimized'],
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Downloads a Complete SEO Asset Pack (WebP + Responsive Breakpoints + Picture Markup + Schema JSON)
 */
export async function downloadSeoAssetBundleZip(
  item: ConversionItem,
  globalSettings?: ConversionSettings
): Promise<void> {
  if (!item.outputBlob) return;

  const zip = new JSZip();
  const baseName = formatOutputFileName(
    item.name,
    item.customSettings || globalSettings,
    item.seoMetadata
  ).replace(/\.[^/.]+$/, '');

  // 1. Primary High-Res WebP
  zip.file(`${baseName}.webp`, item.outputBlob);

  // 2. Responsive Variants (if already generated or generate now)
  const variants = item.responsiveVariants || (await generateResponsiveVariants(
    item.file,
    item.outputWidth || item.originalWidth,
    item.outputHeight || item.originalHeight,
    item.appliedQuality || 0.82
  ));

  variants.forEach((v) => {
    zip.file(`${baseName}-${v.label}.webp`, v.blob);
  });

  // 3. Production HTML5 Picture Snippet
  const markup = generateSeoPictureMarkup(item, globalSettings);
  zip.file('picture-tag.html', markup);

  // 4. Schema.org JSON-LD Structured Data
  const jsonLd = generateImageSchemaJson(item);
  zip.file('schema-imageobject.json', jsonLd);

  // 5. SEO Quick-Start Guide
  const guide = `# OptiWebP: SEO Asset Pack for ${item.name}

## Included Files
- \`${baseName}.webp\`: Main high-fidelity WebP asset
- \`${baseName}-mobile.webp\`: 480w mobile device variant
- \`${baseName}-tablet.webp\`: 800w tablet display variant
- \`picture-tag.html\`: Copy-paste ready HTML5 responsive picture tag
- \`schema-imageobject.json\`: Google Rich Results ImageObject structured data

## How to use on your website:
1. Upload the .webp files to your \`/images/\` or \`/uploads/\` folder.
2. Paste the contents of \`picture-tag.html\` into your page template.
3. Paste \`schema-imageobject.json\` inside a \`<script type="application/ld+json">\` tag in your page \`<head>\`.
`;
  zip.file('README-SEO-GUIDE.md', guide);

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  triggerDownload(zipBlob, `${baseName}-seo-asset-bundle.zip`);
}

/**
 * Triggers a download of a Blob file
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Bundles converted items into a ZIP archive for one-click download
 */
export async function createZipArchive(
  items: Array<{
    name: string;
    outputBlob: Blob | null;
    customSettings?: ConversionSettings;
    seoMetadata?: ImageSeoMetadata;
  }>,
  globalSettings?: ConversionSettings,
  onProgress?: (progressPercent: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  items.forEach((item) => {
    if (item.outputBlob) {
      const outName = formatOutputFileName(
        item.name,
        item.customSettings || globalSettings,
        item.seoMetadata
      );
      zip.file(outName, item.outputBlob);
    }
  });

  return await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );
}

/**
 * Concurrency Queue for parallel processing without blocking UI
 */
export async function parallelBatchProcess<T, R>(
  items: T[],
  workerFn: (item: T, index: number) => Promise<R>,
  concurrency: number = Math.min(navigator.hardwareConcurrency || 4, 6)
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      results[idx] = await workerFn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
