import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Download, Columns, SplitSquareVertical, Sparkles, Sliders } from 'lucide-react';
import { ConversionItem } from '../types';
import { formatBytes, triggerDownload } from '../utils/converter';

interface ComparisonModalProps {
  item: ConversionItem | null;
  onClose: () => void;
  onOpenAiSeo?: (item: ConversionItem) => void;
  onOpenMediaStudio?: (item: ConversionItem) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ item, onClose, onOpenAiSeo, onOpenMediaStudio }) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [zoomLevel, setZoomLevel] = useState(1); // 1, 2, 4
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePointerDown = () => {
    isDraggingRef.current = true;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      updateSliderFromClientX(e.clientX);
    },
    [updateSliderFromClientX]
  );

  const handleSliderClick = (e: React.MouseEvent) => {
    updateSliderFromClientX(e.clientX);
  };

  if (!item || !item.outputUrl) return null;

  const originalExt = item.name.split('.').pop()?.toUpperCase() || 'ORIGINAL';
  const webpSize = item.outputSize || 0;
  const originalSize = item.originalSize;
  const savedPercent = item.savingsPercent || 0;

  const handleDownload = () => {
    if (item.outputBlob) {
      const cleanName = item.name.replace(/\.[^/.]+$/, '') + '.webp';
      triggerDownload(item.outputBlob, cleanName);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onPointerUp={handlePointerUp}
    >
      <div className="relative w-full max-w-6xl h-[90vh] max-h-[920px] bg-white dark:bg-[#0f1218] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#131720]/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white truncate">
              {item.name}
            </h3>
            <span className="hidden sm:inline-block text-xs text-neutral-400 dark:text-neutral-500">
              ·
            </span>
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
              <span>{item.originalWidth} × {item.originalHeight}</span>
              <span>·</span>
              <span>Quality: {Math.round(item.appliedQuality * 100)}%</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-200/80 dark:bg-neutral-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('slider')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'slider'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Split slider view"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'side-by-side'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Side by side view"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-neutral-200/80 dark:bg-neutral-800 rounded-lg p-0.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(1, z === 4 ? 2 : 1))}
                disabled={zoomLevel === 1}
                className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white disabled:opacity-40 cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-neutral-700 dark:text-neutral-300 tabular-nums">
                {zoomLevel}x
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(4, z === 1 ? 2 : 4))}
                disabled={zoomLevel === 4}
                className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white disabled:opacity-40 cursor-pointer"
                title="Zoom in (inspect pixel fidelity)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {onOpenMediaStudio && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMediaStudio(item);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
                title="Adjust media controls in Media Studio"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Media Studio</span>
              </button>
            )}

            {onOpenAiSeo && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAiSeo(item);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                title="Open AI SEO assistant for this image"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI SEO</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download WebP</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-3 bg-neutral-100/60 dark:bg-[#12161f] border-b border-neutral-200 dark:border-neutral-800 text-xs shrink-0">
          <div>
            <div className="text-neutral-500 dark:text-neutral-400">Original ({originalExt})</div>
            <div className="font-mono font-semibold text-neutral-900 dark:text-white mt-0.5 tabular-nums">
              {formatBytes(originalSize)}
            </div>
          </div>
          <div>
            <div className="text-neutral-500 dark:text-neutral-400">Optimized (WEBP)</div>
            <div className="font-mono font-semibold text-neutral-900 dark:text-white mt-0.5 tabular-nums">
              {formatBytes(webpSize)}
            </div>
          </div>
          <div>
            <div className="text-neutral-500 dark:text-neutral-400">Payload Reduction</div>
            <div className={`font-mono font-bold mt-0.5 tabular-nums ${savedPercent > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-300'}`}>
              {savedPercent > 0 ? `-${savedPercent}%` : `${savedPercent}%`}
            </div>
          </div>
          <div>
            <div className="text-neutral-500 dark:text-neutral-400">Local Encoding Time</div>
            <div className="font-mono font-medium text-neutral-700 dark:text-neutral-300 mt-0.5 tabular-nums">
              {item.durationMs ? `${Math.round(item.durationMs)}ms` : 'Instant'}
            </div>
          </div>
        </div>

        {/* Comparison Viewport */}
        <div className="relative flex-1 bg-neutral-200/40 dark:bg-[#07090c] overflow-auto flex items-center justify-center p-4">
          {viewMode === 'slider' ? (
            /* Split-Slider Mode */
            <div
              ref={containerRef}
              onClick={handleSliderClick}
              onPointerMove={handlePointerMove}
              className="relative max-w-full max-h-full select-none cursor-ew-resize overflow-hidden rounded-lg shadow-lg border border-neutral-300 dark:border-neutral-800 bg-transparency-grid"
              style={{
                width: `${item.originalWidth * (zoomLevel > 1 ? zoomLevel * 0.4 : 1)}px`,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              {/* Converted WebP (Right side base layer) */}
              <img
                src={item.outputUrl}
                alt="Converted WebP"
                className="w-full h-auto block pointer-events-none object-contain"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                }}
              />
              <div className="absolute top-3 right-3 bg-neutral-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs pointer-events-none shadow-xs">
                WebP ({formatBytes(webpSize)})
              </div>

              {/* Original Image (Left side clipped layer) */}
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
                <div className="absolute top-3 left-3 bg-neutral-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs pointer-events-none shadow-xs">
                  Original ({formatBytes(originalSize)})
                </div>
              </div>

              {/* Slider Divider Bar and Handle */}
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
          ) : (
            /* Side-by-Side Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-h-full items-center justify-center">
              <div className="relative rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-800 bg-transparency-grid h-full max-h-[600px] flex flex-col items-center justify-center">
                <div className="absolute top-3 left-3 z-10 bg-neutral-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                  Original · {formatBytes(originalSize)}
                </div>
                <img
                  src={item.originalPreviewUrl}
                  alt="Original"
                  className="max-h-full max-w-full object-contain"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>

              <div className="relative rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-800 bg-transparency-grid h-full max-h-[600px] flex flex-col items-center justify-center">
                <div className="absolute top-3 left-3 z-10 bg-neutral-900/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                  WebP · {formatBytes(webpSize)}
                </div>
                <img
                  src={item.outputUrl}
                  alt="WebP"
                  className="max-h-full max-w-full object-contain"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Guidance Footer */}
        <div className="px-6 py-2.5 bg-white dark:bg-[#0f1218] border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
          <span>Drag the center handle left and right to inspect edge sharpness & micro-textures.</span>
          <span className="font-mono text-[11px] text-neutral-400">Esc to close</span>
        </div>
      </div>
    </div>
  );
};
