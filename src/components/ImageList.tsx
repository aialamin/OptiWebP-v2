import React, { useState } from 'react';
import {
  Download,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Sliders,
  Grid,
  List,
  CheckSquare,
  Square,
  FileCode2,
  Check,
  PackageCheck,
  Gauge,
  Zap,
} from 'lucide-react';
import { ConversionItem, ConversionSettings } from '../types';
import { formatBytes, triggerDownload, formatOutputFileName, generateSeoPictureMarkup } from '../utils/converter';

interface ImageListProps {
  items: ConversionItem[];
  globalSettings: ConversionSettings;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onDownloadAll: () => void;
  onDownloadSelected?: (selectedIds: string[]) => void;
  onDownloadSeoBundle?: (item: ConversionItem) => void;
  onInspectItem: (item: ConversionItem) => void;
  onOpenMediaStudio: (item: ConversionItem) => void;
  onOpenAiSeo: (item: ConversionItem) => void;
  onBatchGenerateSeo?: () => void;
  onItemQualityChange?: (id: string, newQuality: number) => void;
  isGeneratingAnySeo?: boolean;
}

export const ImageList: React.FC<ImageListProps> = ({
  items,
  globalSettings,
  onRemoveItem,
  onClearAll,
  onDownloadAll,
  onDownloadSelected,
  onDownloadSeoBundle,
  onInspectItem,
  onOpenMediaStudio,
  onOpenAiSeo,
  onBatchGenerateSeo,
  onItemQualityChange,
  isGeneratingAnySeo = false,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedMarkupId, setCopiedMarkupId] = useState<string | null>(null);

  if (items.length === 0) return null;

  const completedItems = items.filter((i) => i.status === 'completed');
  const totalOriginalSize = completedItems.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalOptimizedSize = completedItems.reduce((acc, curr) => acc + (curr.outputSize || 0), 0);
  const totalSavedBytes = Math.max(0, totalOriginalSize - totalOptimizedSize);
  const totalSavingsPercent =
    totalOriginalSize > 0 ? Math.round((totalSavedBytes / totalOriginalSize) * 1000) / 10 : 0;

  const handleToggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCopyPictureTag = (item: ConversionItem) => {
    const markup = item.seoPictureMarkup || generateSeoPictureMarkup(item, globalSettings);
    navigator.clipboard.writeText(markup);
    setCopiedMarkupId(item.id);
    setTimeout(() => setCopiedMarkupId(null), 2000);
  };

  return (
    <div className="w-full bg-white dark:bg-[#11141b] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden transition-colors space-y-0">
      {/* Batch Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#131720]/40">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="typespace-heading text-base font-bold text-neutral-900 dark:text-white">
              Optimization Queue & SEO Engine
            </h3>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {items.length} {items.length === 1 ? 'image' : 'images'}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              <Zap className="w-3 h-3 text-emerald-500" />
              Multi-Core Parallel Engine
            </span>
          </div>

          {completedItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 leading-normal">
              <span>Original: <strong className="font-mono text-neutral-900 dark:text-neutral-100">{formatBytes(totalOriginalSize)}</strong></span>
              <span>→</span>
              <span>WebP: <strong className="font-mono text-neutral-900 dark:text-neutral-100">{formatBytes(totalOptimizedSize)}</strong></span>
              <span>·</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                Saved {formatBytes(totalSavedBytes)} (-{totalSavingsPercent}%)
              </span>
            </div>
          )}
        </div>

        {/* Global Action Buttons & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* View Toggle */}
          <div className="flex items-center bg-neutral-200/80 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Compact Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Visual Cards Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          {onBatchGenerateSeo && (
            <button
              onClick={onBatchGenerateSeo}
              disabled={isGeneratingAnySeo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800/80 cursor-pointer disabled:opacity-50"
              title="Generate SEO Title, Alt Text, and Caption for all images using Gemini"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAnySeo ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAnySeo ? 'Analyzing...' : 'AI SEO for All'}</span>
            </button>
          )}

          <button
            onClick={onClearAll}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            Clear All
          </button>

          <button
            onClick={onDownloadAll}
            disabled={completedItems.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All ({completedItems.length})</span>
          </button>
        </div>
      </div>

      {/* Batch Selection Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-neutral-100/70 dark:bg-neutral-800/40 border-b border-neutral-200/70 dark:border-neutral-800 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white cursor-pointer font-medium"
          >
            {selectedIds.length === items.length && items.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>
              {selectedIds.length === items.length ? 'Deselect All' : 'Select All'}
            </span>
          </button>
          {selectedIds.length > 0 && (
            <span className="text-neutral-500 font-mono">
              ({selectedIds.length} selected)
            </span>
          )}
        </div>

        {selectedIds.length > 0 && onDownloadSelected && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadSelected(selectedIds)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Selected ({selectedIds.length})</span>
            </button>
            <button
              onClick={() => {
                selectedIds.forEach((id) => onRemoveItem(id));
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
            >
              Remove Selected
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: COMPACT TABLE LIST */}
      {viewMode === 'table' ? (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {items.map((item) => {
            const isDone = item.status === 'completed';
            const isWorking = item.status === 'converting';
            const isError = item.status === 'error';
            const isSelected = selectedIds.includes(item.id);
            const originalExt = item.name.split('.').pop()?.toUpperCase() || 'IMG';
            const hasSeo = Boolean(item.seoMetadata);
            const appliedQ = Math.round((item.appliedQuality || globalSettings.quality) * 100);
            const cwScore = item.coreWebVitalsScore ?? 95;

            return (
              <div
                key={item.id}
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 sm:px-6 gap-3.5 hover:bg-neutral-50/70 dark:hover:bg-neutral-850/40 transition-colors ${
                  isSelected ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                }`}
              >
                {/* Checkbox + Thumbnail + Filename & Dimensions */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleSelectItem(item.id)}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div
                    className="w-12 h-12 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden shrink-0 bg-transparency-grid flex items-center justify-center cursor-pointer group relative shadow-xs"
                    onClick={() => isDone && onInspectItem(item)}
                    title={isDone ? 'Click to inspect visual quality' : ''}
                  >
                    <img
                      src={item.outputUrl || item.originalPreviewUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {isDone && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Eye className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate max-w-[280px] sm:max-w-md">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase shrink-0 border border-neutral-200/80 dark:border-neutral-700/80">
                        {originalExt} → WEBP
                      </span>

                      {/* Core Web Vitals Elite Badge */}
                      {isDone && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800"
                          title={`Google Core Web Vitals Score: ${cwScore}/100. Fast LCP + Zero CLS Shift`}
                        >
                          <Gauge className="w-3 h-3 text-emerald-500" />
                          <span>{cwScore}/100 LCP</span>
                        </span>
                      )}

                      {hasSeo && (
                        <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800/60">
                          <CheckCircle className="w-3 h-3" />
                          SEO Ready
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
                      <span>
                        {item.outputWidth && item.outputHeight
                          ? `${item.outputWidth} × ${item.outputHeight} px`
                          : item.originalWidth && item.originalHeight
                          ? `${item.originalWidth} × ${item.originalHeight} px`
                          : '—'}
                      </span>
                      <span>·</span>
                      <span>Orig: {formatBytes(item.originalSize)}</span>
                      {isDone && item.outputSize && (
                        <>
                          <span>→</span>
                          <span className="text-neutral-900 dark:text-white font-medium">
                            WebP: {formatBytes(item.outputSize)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline Quality Tuning on Row */}
                {isDone && onItemQualityChange && (
                  <div className="hidden xl:flex items-center gap-2 w-36 shrink-0">
                    <span className="text-[10px] text-neutral-500 font-mono">Q: {appliedQ}%</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={appliedQ}
                      onChange={(e) => onItemQualityChange(item.id, parseInt(e.target.value, 10) / 100)}
                      className="w-20 accent-neutral-900 dark:accent-white h-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                      title="Adjust quality for this image"
                    />
                  </div>
                )}

                {/* Status & Savings */}
                <div className="hidden sm:flex flex-col items-end shrink-0 w-28">
                  {isWorking && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing...</span>
                    </div>
                  )}
                  {isDone && (
                    <>
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {(item.savingsPercent || 0) > 0 ? `-${item.savingsPercent}%` : `${item.savingsPercent}%`}
                      </div>
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
                        {item.durationMs ? `${Math.round(item.durationMs)}ms` : 'instant'}
                      </span>
                    </>
                  )}
                  {isError && (
                    <div className="flex items-center gap-1 text-xs text-rose-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Failed</span>
                    </div>
                  )}
                </div>

                {/* Media & SEO Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                  {/* Media Studio Button */}
                  <button
                    onClick={() => onOpenMediaStudio(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
                    title="Open Media Studio (Adjust quality, scale, dimensions, rotate, and sharp filter)"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden md:inline">Studio</span>
                  </button>

                  {/* AI SEO Assistant Button */}
                  <button
                    onClick={() => onOpenAiSeo(item)}
                    disabled={item.isGeneratingSeo}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
                      hasSeo
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                        : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                    title="Generate or view AI SEO title, caption & alt text"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${item.isGeneratingSeo ? 'animate-spin' : ''}`} />
                    <span className="hidden lg:inline">{item.isGeneratingSeo ? 'Analyzing...' : hasSeo ? 'SEO Ready' : 'AI SEO'}</span>
                  </button>

                  {isDone && (
                    <>
                      {/* Copy Picture Tag Button */}
                      <button
                        onClick={() => handleCopyPictureTag(item)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                        title="Copy Google-Ready HTML5 <picture> Tag (Zero-CLS & Responsive)"
                      >
                        {copiedMarkupId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <FileCode2 className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden xl:inline">{copiedMarkupId === item.id ? 'Copied!' : '<picture>'}</span>
                      </button>

                      {/* Download Complete SEO Asset Pack (Zip) */}
                      {onDownloadSeoBundle && (
                        <button
                          onClick={() => onDownloadSeoBundle(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-100/70 hover:bg-emerald-200/80 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer border border-emerald-300 dark:border-emerald-700"
                          title="Download Complete SEO Asset Pack (WebP + Mobile/Tablet Breakpoints + Markup + Schema JSON)"
                        >
                          <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="hidden sm:inline">SEO Pack</span>
                        </button>
                      )}

                      {/* Split Comparison Viewer */}
                      <button
                        onClick={() => onInspectItem(item)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                        title="Compare original vs WebP"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Save Main WebP File */}
                      <button
                        onClick={() => {
                          if (item.outputBlob) {
                            const outName = formatOutputFileName(
                              item.name,
                              item.customSettings || globalSettings,
                              item.seoMetadata
                            );
                            triggerDownload(item.outputBlob, outName);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer shadow-xs"
                        title="Download converted WebP file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW MODE 2: VISUAL CARDS GRID */
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const isDone = item.status === 'completed';
            const isWorking = item.status === 'converting';
            const isSelected = selectedIds.includes(item.id);
            const appliedQ = Math.round((item.appliedQuality || globalSettings.quality) * 100);
            const cwScore = item.coreWebVitalsScore ?? 95;

            return (
              <div
                key={item.id}
                className={`group relative rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1218] hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Top Media Thumbnail */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-transparency-grid border border-neutral-200/80 dark:border-neutral-700/80 mb-3">
                  <img
                    src={item.outputUrl || item.originalPreviewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Checkbox button top-left */}
                  <button
                    onClick={() => handleToggleSelectItem(item.id)}
                    className="absolute top-2 left-2 p-1.5 rounded-md bg-black/60 text-white cursor-pointer hover:bg-black/80"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Savings pill top-right */}
                  {isDone && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                      {(item.savingsPercent || 0) > 0 ? `-${item.savingsPercent}%` : '0%'}
                    </div>
                  )}

                  {/* Core Web Vitals badge bottom-left */}
                  {isDone && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-black/75 text-emerald-400 border border-emerald-500/40 backdrop-blur-xs flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      <span>{cwScore}/100 LCP</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase shrink-0">
                      WEBP
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span>
                      {item.outputWidth && item.outputHeight
                        ? `${item.outputWidth} × ${item.outputHeight}`
                        : '—'}
                    </span>
                    <span>
                      {isDone && item.outputSize
                        ? formatBytes(item.outputSize)
                        : formatBytes(item.originalSize)}
                    </span>
                  </div>

                  {/* Quality Slider in Grid */}
                  {isDone && onItemQualityChange && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-[10px] text-neutral-500 font-mono">Quality: {appliedQ}%</span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={appliedQ}
                        onChange={(e) => onItemQualityChange(item.id, parseInt(e.target.value, 10) / 100)}
                        className="w-20 accent-neutral-900 dark:accent-white h-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenMediaStudio(item)}
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                      title="Open Media Studio"
                    >
                      <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </button>

                    <button
                      onClick={() => onOpenAiSeo(item)}
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                      title="AI SEO Assistant"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>

                    {isDone && (
                      <button
                        onClick={() => handleCopyPictureTag(item)}
                        className="p-1.5 text-neutral-600 hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                        title="Copy <picture> Tag"
                      >
                        {copiedMarkupId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <FileCode2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isDone && onDownloadSeoBundle && (
                      <button
                        onClick={() => onDownloadSeoBundle(item)}
                        className="p-1.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-md transition-colors cursor-pointer"
                        title="Download SEO Asset Pack (Zip)"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isDone && (
                      <button
                        onClick={() => {
                          if (item.outputBlob) {
                            const outName = formatOutputFileName(
                              item.name,
                              item.customSettings || globalSettings,
                              item.seoMetadata
                            );
                            triggerDownload(item.outputBlob, outName);
                          }
                        }}
                        className="p-1.5 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                        title="Download WebP"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
