export type PresetMode = 'smart' | 'high' | 'balanced' | 'maximum' | 'lossless' | 'custom';
export type OutputWebpMode = 'auto' | 'lossy' | 'lossless';
export type AlphaChannelHandling = 'preserve' | 'matte-white' | 'matte-black';

export interface ImageAdjustments {
  brightness: number; // -50 to 50, default 0
  contrast: number;   // -50 to 50, default 0
  saturation: number; // -50 to 50, default 0
  rotation: number;   // 0, 90, 180, 270
  flipHorizontal: boolean;
  flipVertical: boolean;
  grayscale: boolean;
  sharpen: boolean;
}

export interface ResponsiveVariant {
  label: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  blob: Blob;
  url: string;
  size: number;
  savingsPercent: number;
}

export interface ConversionSettings {
  preset: PresetMode;
  quality: number; // 0.05 to 1.0
  maxDimension: number | 'original'; // pixel width or height limit, or 'original'
  webpMode?: OutputWebpMode;
  alphaHandling?: AlphaChannelHandling;
  stripMetadata?: boolean;
  sharpenOnResize?: boolean;
  targetMaxKb?: number | null; // e.g. 150 (KB) size cap budget
  namingPattern?: 'original' | 'suffix-opt' | 'suffix-webp' | 'quality-tag';
  adjustments?: Partial<ImageAdjustments>;
  generateResponsiveBundle?: boolean; // Mobile 480w, Tablet 800w, Desktop 1200w
}

export interface ImageSeoMetadata {
  title: string;
  altText: string;
  caption: string;
  description: string;
  keywords: string[];
  suggestedFileName: string;
}

export interface ConversionItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalType: string;
  originalPreviewUrl: string;
  status: 'idle' | 'converting' | 'completed' | 'error';
  outputBlob: Blob | null;
  outputUrl: string | null;
  outputSize: number | null;
  outputWidth: number | null;
  outputHeight: number | null;
  savingsPercent: number | null;
  durationMs: number | null;
  error?: string;
  appliedQuality: number;
  customSettings?: ConversionSettings;
  customAdjustments?: ImageAdjustments;
  selected?: boolean;
  seoMetadata?: ImageSeoMetadata;
  isGeneratingSeo?: boolean;
  responsiveVariants?: ResponsiveVariant[];
  seoPictureMarkup?: string;
  seoJsonLd?: string;
  coreWebVitalsScore?: number; // 0 to 100
}
