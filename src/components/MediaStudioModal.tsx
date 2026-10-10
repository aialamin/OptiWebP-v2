import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Maximize2,
  Palette,
  Sparkles,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  SplitSquareVertical,
  Columns,
  Eye,
  Check,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  Undo2,
} from 'lucide-react';
import { ConversionItem, ConversionSettings, ImageAdjustments, PresetMode, OutputWebpMode, AlphaChannelHandling } from '../types';
import {
  convertToWebp,
  formatBytes,
  triggerDownload,
  DEFAULT_ADJUSTMENTS,
  formatOutputFileName,
} from '../utils/converter';

interface MediaStudioModalProps {
  item: ConversionItem | null;
  globalSettings: ConversionSettings;
  onClose: () => void;
  onApplyItemSettings: (id: string, newSettings: ConversionSettings, newAdjustments: ImageAdjustments, processedBlob: Blob, processedUrl: string, width: number, height: number, savings: number, quality: number, durationMs: number) => void;
  onApplyToAll: (settings: ConversionSettings, adjustments: ImageAdjustments) => void;
  onDownloadSeoBundle?: (item: ConversionItem) => void;
}

export const MediaStudioModal: React.FC<MediaStudioModalProps> = ({
  item,
  globalSettings,
  onClose,
  onApplyItemSettings,
  onApplyToAll,
  onDownloadSeoBundle,
}) => {
  // Settings & Adjustments State
  const [activeTab, setActiveTab] = useState<'compression' | 'geometry' | 'color' | 'alpha'>('compression');
  const [preset, setPreset] = useState<PresetMode>('smart');
  const [quality, setQuality] = useState<number>(0.85);
  const [maxDimension, setMaxDimension] = useState<number | 'original'>('original');
  const [webpMode, setWebpMode] = useState<OutputWebpMode>('auto');
  const [alphaHandling, setAlphaHandling] = useState<AlphaChannelHandling>('preserve');
  const [targetMaxKb, setTargetMaxKb] = useState<number | null>(null);
  const [sharpenOnResize, setSharpenOnResize] = useState<boolean>(true);

  // Visual adjustments
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);

  // Live Preview State
  const [liveBlob, setLiveBlob] = useState<Blob | null>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [liveWidth, setLiveWidth] = useState<number>(0);
  const [liveHeight, setLiveHeight] = useState<number>(0);
  const [liveSavings, setLiveSavings] = useState<number>(0);
  const [liveDuration, setLiveDuration] = useState<number>(0);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  // Viewport states
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'single'>('slider');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSliderRef = useRef<boolean>(false);

  // Initialize from item customSettings or globalSettings
  useEffect(() => {
    if (!item) return;

    const sourceSettings = item.customSettings || globalSettings;
    setPreset(sourceSettings.preset);
    setQuality(sourceSettings.quality);
    setMaxDimension(sourceSettings.maxDimension);
    setWebpMode(sourceSettings.webpMode || 'auto');
    setAlphaHandling(sourceSettings.alphaHandling || 'preserve');
    setTargetMaxKb(sourceSettings.targetMaxKb || null);
    setSharpenOnResize(sourceSettings.sharpenOnResize ?? true);

    if (item.customAdjustments) {
      setAdjustments(item.customAdjustments);
    } else {
      setAdjustments(DEFAULT_ADJUSTMENTS);
    }

    if (item.outputBlob && item.outputUrl) {
      setLiveBlob(item.outputBlob);
      setLiveUrl(item.outputUrl);
      setLiveWidth(item.outputWidth || item.originalWidth);
      setLiveHeight(item.outputHeight || item.originalHeight);
      setLiveSavings(item.savingsPercent || 0);
      setLiveDuration(item.durationMs || 0);
    }
  }, [item, globalSettings]);

  // Clean up object URLs created during live preview
  useEffect(() => {
    return () => {
      if (liveUrl && liveUrl !== item?.outputUrl) {
        URL.revokeObjectURL(liveUrl);
      }
    };
  }, [liveUrl, item]);

  // Keyboard shortcut for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced live conversion runner
  const debounceTimerRef = useRef<number | null>(null);

  const triggerLiveRender = useCallback(async () => {
    if (!item) return;
    setIsRendering(true);

    try {
      const currentSettings: ConversionSettings = {
        preset,
        quality,
        maxDimension,
        webpMode,
        alphaHandling,
        sharpenOnResize,
        targetMaxKb,
        adjustments,
      };

      const result = await convertToWebp(item.file, currentSettings, adjustments);

      const savings =
        item.originalSize > 0
          ? Math.round(((item.originalSize - result.blob.size) / item.originalSize) * 1000) / 10
          : 0;

      setLiveBlob(result.blob);
      setLiveUrl((prev) => {
        if (prev && prev !== item.outputUrl) URL.revokeObjectURL(prev);
        return result.url;
      });
      setLiveWidth(result.width);
      setLiveHeight(result.height);
      setLiveSavings(savings);
      setLiveDuration(result.durationMs);
    } catch (err) {
      console.error('Live preview error:', err);
    } finally {
      setIsRendering(false);
    }
  }, [item, preset, quality, maxDimension, webpMode, alphaHandling, sharpenOnResize, targetMaxKb, adjustments]);

  // Trigger render whenever any control updates
  useEffect(() => {
    if (!item) return;

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      triggerLiveRender();
    }, 180);

    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, [triggerLiveRender, item]);

  // Split-slider pointer interaction
  const updateSliderX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = () => {
    isDraggingSliderRef.current = true;
  };

  const handlePointerUp = () => {
    isDraggingSliderRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingSliderRef.current) {
      updateSliderX(e.clientX);
    }
  };

  if (!item) return null;

  const currentSettings: ConversionSettings = {
    preset,
    quality,
    maxDimension,
    webpMode,
    alphaHandling,
    sharpenOnResize,
    targetMaxKb,
    adjustments,
  };

  const handleApplyToThisItem = () => {
    if (!liveBlob || !liveUrl) return;
    onApplyItemSettings(
      item.id,
      currentSettings,
      adjustments,
      liveBlob,
      liveUrl,
      liveWidth,
      liveHeight,
      liveSavings,
      quality,
      liveDuration
    );
    onClose();
  };

  const handleApplyAll = () => {
    onApplyToAll(currentSettings, adjustments);
    onClose();
  };

  const handleDownloadNow = () => {
    if (!liveBlob) return;
    const outName = formatOutputFileName(item.name, currentSettings, item.seoMetadata);
    triggerDownload(liveBlob, outName);
  };

  const handleResetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setQuality(globalSettings.quality);
    setPreset(globalSettings.preset);
    setMaxDimension(globalSettings.maxDimension);
    setWebpMode(globalSettings.webpMode || 'auto');
    setAlphaHandling(globalSettings.alphaHandling || 'preserve');
    setTargetMaxKb(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onPointerUp={handlePointerUp}
    >
      <div className="relative w-full max-w-7xl h-[94vh] max-h-[960px] bg-white dark:bg-[#0c0e12] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#11141b]/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold truncate max-w-[280px] sm:max-w-md">
                  {item.name}
                </h3>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                  Media Studio
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                <span>Orig: {item.originalWidth} × {item.originalHeight}</span>
                <span>·</span>
                <span>{formatBytes(item.originalSize)}</span>
                {liveWidth > 0 && (
                  <>
                    <span>→</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Target: {liveWidth} × {liveHeight} ({formatBytes(liveBlob?.size || 0)})
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Top Viewport Toolbar */}
          <div className="flex items-center gap-2">
            {/* View Mode */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200/80 dark:border-neutral-700">
              <button
                onClick={() => setViewMode('slider')}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === 'slider'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Split Curtain Slider"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === 'side-by-side'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Side by Side Inspection"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('single')}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === 'single'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Optimized Output Only"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200/80 dark:border-neutral-700">
              <button
                onClick={() => setZoomLevel((z) => Math.max(1, z === 4 ? 2 : 1))}
                disabled={zoomLevel === 1}
                className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-40 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-neutral-700 dark:text-neutral-300 tabular-nums">
                {zoomLevel}x
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(4, z === 1 ? 2 : 4))}
                disabled={zoomLevel === 4}
                className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-40 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-2.5 bg-neutral-100/60 dark:bg-[#10131a] border-b border-neutral-200 dark:border-neutral-800 text-xs shrink-0 font-mono">
          <div>
            <span className="text-neutral-500">Original Size: </span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {formatBytes(item.originalSize)}
            </span>
          </div>
          <div>
            <span className="text-neutral-500">Optimized WebP: </span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {formatBytes(liveBlob?.size || 0)}
            </span>
          </div>
          <div>
            <span className="text-neutral-500">Payload Reduction: </span>
            <span className={`font-bold ${liveSavings > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600'}`}>
              {liveSavings > 0 ? `-${liveSavings}%` : `${liveSavings}%`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Render Status: </span>
            {isRendering ? (
              <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" /> Encoding...
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {liveDuration ? `${Math.round(liveDuration)}ms` : 'Instant'}
              </span>
            )}
          </div>
        </div>

        {/* Main Body: Viewport + Controls Panel */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Interactive Media Viewport */}
          <div className="flex-1 bg-neutral-200/50 dark:bg-[#06080c] p-4 flex items-center justify-center overflow-auto relative">
            {/* Viewport Content */}
            {viewMode === 'slider' && (
              <div
                ref={containerRef}
                onPointerMove={handlePointerMove}
                className="relative max-w-full max-h-full select-none cursor-ew-resize overflow-hidden rounded-xl shadow-lg border border-neutral-300 dark:border-neutral-800 bg-transparency-grid"
                style={{
                  width: `${liveWidth * (zoomLevel > 1 ? zoomLevel * 0.4 : 1)}px`,
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              >
                {/* Optimized WebP Layer (Base) */}
                <img
                  src={liveUrl || item.outputUrl || item.originalPreviewUrl}
                  alt="Optimized WebP"
                  className="w-full h-auto block pointer-events-none object-contain"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top left',
                  }}
                />
                <div className="absolute top-3 right-3 bg-neutral-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs pointer-events-none">
                  WebP ({formatBytes(liveBlob?.size || 0)})
                </div>

                {/* Original Layer (Clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={item.originalPreviewUrl}
                    alt="Original"
                    className="w-full h-auto block max-w-none pointer-events-none object-contain"
                    style={{
                      width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top left',
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-neutral-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs pointer-events-none">
                    Original ({formatBytes(item.originalSize)})
                  </div>
                </div>

                {/* Split Slider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.6)] cursor-ew-resize z-10"
                  style={{ left: `${sliderPosition}%` }}
                  onPointerDown={handlePointerDown}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-900 dark:border-white shadow-xl flex items-center justify-center text-[10px] font-bold text-neutral-900 dark:text-white cursor-grab active:cursor-grabbing">
                    ↔
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'side-by-side' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full max-h-full items-center justify-center">
                <div className="relative rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-800 bg-transparency-grid h-full max-h-[580px] flex items-center justify-center">
                  <div className="absolute top-3 left-3 z-10 bg-neutral-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                    Original ({formatBytes(item.originalSize)})
                  </div>
                  <img
                    src={item.originalPreviewUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                </div>
                <div className="relative rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-800 bg-transparency-grid h-full max-h-[580px] flex items-center justify-center">
                  <div className="absolute top-3 left-3 z-10 bg-neutral-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                    WebP ({formatBytes(liveBlob?.size || 0)})
                  </div>
                  <img
                    src={liveUrl || item.outputUrl || item.originalPreviewUrl}
                    alt="WebP"
                    className="max-h-full max-w-full object-contain"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                </div>
              </div>
            )}

            {viewMode === 'single' && (
              <div className="relative rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-800 bg-transparency-grid max-h-full flex items-center justify-center">
                <div className="absolute top-3 left-3 z-10 bg-neutral-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                  WebP Result · {liveWidth} × {liveHeight} ({formatBytes(liveBlob?.size || 0)})
                </div>
                <img
                  src={liveUrl || item.outputUrl || item.originalPreviewUrl}
                  alt="WebP preview"
                  className="max-h-full max-w-full object-contain"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>
            )}
          </div>

          {/* Right Controls Sidebar */}
          <div className="w-full lg:w-[380px] xl:w-[420px] bg-white dark:bg-[#0e1117] border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-neutral-800 flex flex-col shrink-0">
            {/* Category Tab Selector */}
            <div className="grid grid-cols-4 p-2 gap-1 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#12161f]/60 text-xs font-medium">
              <button
                onClick={() => setActiveTab('compression')}
                className={`py-2 px-1 text-center rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'compression'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Quality
              </button>
              <button
                onClick={() => setActiveTab('geometry')}
                className={`py-2 px-1 text-center rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'geometry'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Resize
              </button>
              <button
                onClick={() => setActiveTab('color')}
                className={`py-2 px-1 text-center rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'color'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Tonal
              </button>
              <button
                onClick={() => setActiveTab('alpha')}
                className={`py-2 px-1 text-center rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'alpha'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Alpha
              </button>
            </div>

            {/* Tab Controls Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* TAB 1: COMPRESSION & QUALITY */}
              {activeTab === 'compression' && (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-2">
                      Encoding Preset Profile
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'smart', label: 'Smart Auto', q: 0.86 },
                        { id: 'high', label: 'High Fidelity', q: 0.90 },
                        { id: 'balanced', label: 'Balanced Web', q: 0.80 },
                        { id: 'maximum', label: 'Max Savings', q: 0.65 },
                        { id: 'lossless', label: 'Lossless VP8L', q: 1.0 },
                        { id: 'custom', label: 'Custom Slider', q: quality },
                      ].map((p) => {
                        const isSel = preset === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setPreset(p.id as PresetMode);
                              if (p.id !== 'custom') setQuality(p.q);
                            }}
                            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                              isSel
                                ? 'border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                                : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{p.label}</span>
                              {p.id === 'smart' && <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />}
                            </div>
                            <div className="text-[11px] opacity-75 font-mono mt-0.5">
                              {Math.round(p.q * 100)}% quality
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quality Slider */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Granular Quality Target
                      </span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                        {Math.round(quality * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="1"
                      value={Math.round(quality * 100)}
                      onChange={(e) => {
                        setPreset('custom');
                        setQuality(parseFloat(e.target.value) / 100);
                      }}
                      className="w-full accent-neutral-900 dark:accent-white h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                      <span>5% (Smallest)</span>
                      <span>80% (Balanced)</span>
                      <span>100% (Lossless)</span>
                    </div>
                  </div>

                  {/* WebP Mode Selection */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-2">
                      WebP Encoding Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'auto', label: 'Auto VP8', desc: 'Auto lossless for icons' },
                        { id: 'lossy', label: 'Lossy VP8', desc: 'Standard photo DCT' },
                        { id: 'lossless', label: 'VP8L', desc: '100% pixel exact' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setWebpMode(m.id as OutputWebpMode)}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                            webpMode === m.id
                              ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 font-semibold'
                              : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          <div>{m.label}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target File Size Budget */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Max Target File Size Cap
                      </span>
                      <span className="font-mono text-neutral-500">
                        {targetMaxKb ? `< ${targetMaxKb} KB` : 'No Cap'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[
                        { val: null, label: 'Off' },
                        { val: 100, label: '100 KB' },
                        { val: 200, label: '200 KB' },
                        { val: 500, label: '500 KB' },
                      ].map((opt) => (
                        <button
                          key={String(opt.val)}
                          onClick={() => setTargetMaxKb(opt.val)}
                          className={`flex-1 py-1 px-2 rounded border text-center font-mono text-[11px] transition-colors cursor-pointer ${
                            targetMaxKb === opt.val
                              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white font-semibold'
                              : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GEOMETRY & RESIZING */}
              {activeTab === 'geometry' && (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-2">
                      Dimension Constraint
                    </label>
                    <select
                      value={maxDimension}
                      onChange={(e) => {
                        const v = e.target.value === 'original' ? 'original' : parseInt(e.target.value, 10);
                        setMaxDimension(v);
                      }}
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-neutral-400 cursor-pointer"
                    >
                      <option value="original">Original ({item.originalWidth} × {item.originalHeight})</option>
                      <option value="3840">Max 4K Ultra HD (3840px)</option>
                      <option value="2560">Max 2K Quad HD (2560px)</option>
                      <option value="1920">Max Full HD 1080p (1920px)</option>
                      <option value="1280">Max 720p HD (1280px)</option>
                      <option value="800">Max 800px (Blog Content)</option>
                      <option value="600">Max 600px (Card Thumbnail)</option>
                      <option value="300">Max 300px (Avatar / Icon)</option>
                    </select>
                  </div>

                  {/* Orientation Controls: Rotate & Flip */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-2">
                      Rotation & Orientation
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() =>
                          setAdjustments((prev) => ({
                            ...prev,
                            rotation: (prev.rotation + 90) % 360,
                          }))
                        }
                        className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                        title="Rotate 90 degrees clockwise"
                      >
                        <RotateCw className="w-4 h-4 mb-1" />
                        <span className="text-[10px]">Rotate 90°</span>
                      </button>
                      <button
                        onClick={() =>
                          setAdjustments((prev) => ({
                            ...prev,
                            rotation: (prev.rotation + 270) % 360,
                          }))
                        }
                        className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                        title="Rotate 90 degrees counter-clockwise"
                      >
                        <RotateCcw className="w-4 h-4 mb-1" />
                        <span className="text-[10px]">-90°</span>
                      </button>
                      <button
                        onClick={() =>
                          setAdjustments((prev) => ({
                            ...prev,
                            flipHorizontal: !prev.flipHorizontal,
                          }))
                        }
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg border cursor-pointer ${
                          adjustments.flipHorizontal
                            ? 'border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                            : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800'
                        }`}
                        title="Flip horizontally"
                      >
                        <FlipHorizontal className="w-4 h-4 mb-1" />
                        <span className="text-[10px]">Flip H</span>
                      </button>
                      <button
                        onClick={() =>
                          setAdjustments((prev) => ({
                            ...prev,
                            flipVertical: !prev.flipVertical,
                          }))
                        }
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg border cursor-pointer ${
                          adjustments.flipVertical
                            ? 'border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                            : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800'
                        }`}
                        title="Flip vertically"
                      >
                        <FlipVertical className="w-4 h-4 mb-1" />
                        <span className="text-[10px]">Flip V</span>
                      </button>
                    </div>
                  </div>

                  {/* Sharpening Toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
                    <div>
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Unsharp Mask (Edge Crispness)
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Restores high-frequency edge contrast when downscaling
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={adjustments.sharpen}
                      onChange={(e) =>
                        setAdjustments((prev) => ({ ...prev, sharpen: e.target.checked }))
                      }
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: TONAL & COLOR ADJUSTMENTS */}
              {activeTab === 'color' && (
                <div className="space-y-4">
                  {/* Brightness */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Brightness
                      </span>
                      <span className="font-mono text-neutral-900 dark:text-white tabular-nums">
                        {adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={adjustments.brightness}
                      onChange={(e) =>
                        setAdjustments((prev) => ({
                          ...prev,
                          brightness: parseInt(e.target.value, 10),
                        }))
                      }
                      className="w-full accent-neutral-900 dark:accent-white h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Contrast
                      </span>
                      <span className="font-mono text-neutral-900 dark:text-white tabular-nums">
                        {adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={adjustments.contrast}
                      onChange={(e) =>
                        setAdjustments((prev) => ({
                          ...prev,
                          contrast: parseInt(e.target.value, 10),
                        }))
                      }
                      className="w-full accent-neutral-900 dark:accent-white h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Color Saturation
                      </span>
                      <span className="font-mono text-neutral-900 dark:text-white tabular-nums">
                        {adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={adjustments.saturation}
                      onChange={(e) =>
                        setAdjustments((prev) => ({
                          ...prev,
                          saturation: parseInt(e.target.value, 10),
                        }))
                      }
                      className="w-full accent-neutral-900 dark:accent-white h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Grayscale Mode */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
                    <div>
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Monochrome / Grayscale
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Strips chroma channels; saves 30-40% extra file size
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={adjustments.grayscale}
                      onChange={(e) =>
                        setAdjustments((prev) => ({ ...prev, grayscale: e.target.checked }))
                      }
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: ALPHA & TRANSPARENCY */}
              {activeTab === 'alpha' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-2">
                      Alpha Channel Handling
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          id: 'preserve',
                          title: 'Preserve Transparency',
                          desc: 'Keeps full alpha channel transparency intact (VP8A)',
                        },
                        {
                          id: 'matte-white',
                          title: 'Fill with Matte White',
                          desc: 'Renders transparent areas over white background for e-commerce',
                        },
                        {
                          id: 'matte-black',
                          title: 'Fill with Matte Black',
                          desc: 'Renders transparent areas over solid dark background',
                        },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setAlphaHandling(opt.id as AlphaChannelHandling)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            alphaHandling === opt.id
                              ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800 font-semibold'
                              : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt.title}</span>
                            {alphaHandling === opt.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-1 font-normal">
                            {opt.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Panel */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#11141b]/70 flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetAdjustments}
                  className="flex-1 py-2 px-3 text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleDownloadNow}
                  className="flex-1 py-2 px-3 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                {onDownloadSeoBundle && (
                  <button
                    onClick={() => onDownloadSeoBundle(item)}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-300 dark:border-emerald-700"
                    title="Download complete SEO pack with responsive breakpoints and markup"
                  >
                    <span>SEO Pack</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyToThisItem}
                  className="flex-1 py-2.5 px-3.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply to Image</span>
                </button>
                <button
                  onClick={handleApplyAll}
                  className="py-2.5 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer whitespace-nowrap"
                  title="Apply these quality & dimension settings to all loaded images in queue"
                >
                  Apply to All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
