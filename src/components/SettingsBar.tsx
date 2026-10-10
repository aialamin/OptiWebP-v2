import React, { useState } from 'react';
import {
  Sliders,
  Zap,
  Check,
  RefreshCw,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldCheck,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { ConversionSettings, PresetMode, OutputWebpMode, AlphaChannelHandling } from '../types';

interface SettingsBarProps {
  settings: ConversionSettings;
  onChangeSettings: (newSettings: ConversionSettings) => void;
  onReconvertAll: () => void;
  hasItems: boolean;
  isProcessing: boolean;
}

const PRESET_OPTIONS: Array<{
  id: PresetMode;
  label: string;
  description: string;
  quality: number;
}> = [
  {
    id: 'smart',
    label: 'Smart Auto',
    description: 'Auto-adapts to image type (photos vs transparent graphics) for maximum savings without visual loss',
    quality: 0.86,
  },
  {
    id: 'high',
    label: 'High Quality',
    description: '90% quality · Crystal sharp, imperceptible difference from source',
    quality: 0.90,
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: '80% quality · Standard web baseline, cuts file size by ~65-80%',
    quality: 0.80,
  },
  {
    id: 'maximum',
    label: 'Max Compression',
    description: '65% quality · Smallest file size for performance budgets',
    quality: 0.65,
  },
  {
    id: 'lossless',
    label: 'Lossless',
    description: '100% quality · Pixel-perfect preservation for logos, vectors & diagrams',
    quality: 1.0,
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Manual granular quality slider',
    quality: 0.85,
  },
];

const RESOLUTION_OPTIONS: Array<{ value: number | 'original'; label: string }> = [
  { value: 'original', label: 'Original Dimensions' },
  { value: 3840, label: 'Max 4K (3840px)' },
  { value: 2560, label: 'Max 2K (2560px)' },
  { value: 1920, label: 'Max Full HD (1920px)' },
  { value: 1280, label: 'Max HD (1280px)' },
  { value: 800, label: 'Max 800px (Blog Width)' },
  { value: 600, label: 'Max 600px (Thumbnails)' },
  { value: 300, label: 'Max 300px (Icons / Avatars)' },
];

export const SettingsBar: React.FC<SettingsBarProps> = ({
  settings,
  onChangeSettings,
  onReconvertAll,
  hasItems,
  isProcessing,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePresetSelect = (presetId: PresetMode) => {
    const selected = PRESET_OPTIONS.find((p) => p.id === presetId);
    if (!selected) return;

    onChangeSettings({
      ...settings,
      preset: presetId,
      quality: selected.quality,
      webpMode: presetId === 'lossless' ? 'lossless' : settings.webpMode,
    });
  };

  const handleCustomQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) / 100;
    onChangeSettings({
      ...settings,
      preset: 'custom',
      quality: val,
    });
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value === 'original' ? 'original' : parseInt(e.target.value, 10);
    onChangeSettings({
      ...settings,
      maxDimension: val,
    });
  };

  const activePreset = PRESET_OPTIONS.find((p) => p.id === settings.preset) || PRESET_OPTIONS[0];

  return (
    <div className="w-full bg-white dark:bg-[#11141b] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs transition-colors space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-neutral-500" />
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Global Media Optimization Profile
            </h4>
            {settings.preset === 'smart' && (
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded px-1.5 py-0.2">
                Recommended
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {activePreset.description}
          </p>
        </div>

        {/* Dimension Constraint & Re-convert button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={settings.maxDimension}
              onChange={handleDimensionChange}
              className="text-xs font-medium bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            >
              {RESOLUTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
              showAdvanced
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Advanced Controls</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {hasItems && (
            <button
              onClick={onReconvertAll}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Apply current settings to all loaded images"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Re-optimize All</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESET_OPTIONS.map((preset) => {
          const isActive = settings.preset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {isActive && <Check className="w-3 h-3" />}
              {preset.label}
              {preset.id === 'smart' && (
                <Zap className="w-2.5 h-2.5 ml-0.5 text-amber-400 fill-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Quality Slider */}
      {(settings.preset === 'custom' || settings.preset === 'high' || settings.preset === 'balanced' || settings.preset === 'maximum') && (
        <div className="pt-2 flex items-center gap-4">
          <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 w-28 shrink-0">
            Quality Target:
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={Math.round(settings.quality * 100)}
            onChange={handleCustomQualityChange}
            className="w-full accent-neutral-900 dark:accent-white h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
          />
          <div className="font-mono text-xs font-semibold text-neutral-900 dark:text-white w-12 text-right tabular-nums">
            {Math.round(settings.quality * 100)}%
          </div>
        </div>
      )}

      {/* Advanced Media Controls Panel */}
      {showAdvanced && (
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
          {/* Output Format */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block">
              WebP Output Engine
            </label>
            <select
              value={settings.webpMode || 'auto'}
              onChange={(e) =>
                onChangeSettings({
                  ...settings,
                  webpMode: e.target.value as OutputWebpMode,
                })
              }
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            >
              <option value="auto">Auto (Smart Content Detection)</option>
              <option value="lossy">Lossy VP8 (Best for Photos)</option>
              <option value="lossless">Lossless VP8L (Pixel Exact)</option>
            </select>
          </div>

          {/* Alpha Channel Handling */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block">
              Alpha Transparency
            </label>
            <select
              value={settings.alphaHandling || 'preserve'}
              onChange={(e) =>
                onChangeSettings({
                  ...settings,
                  alphaHandling: e.target.value as AlphaChannelHandling,
                })
              }
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            >
              <option value="preserve">Preserve Transparent Alpha</option>
              <option value="matte-white">Matte White Background</option>
              <option value="matte-black">Matte Black Background</option>
            </select>
          </div>

          {/* Target File Budget */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block">
              File Size Budget Cap
            </label>
            <select
              value={settings.targetMaxKb || ''}
              onChange={(e) =>
                onChangeSettings({
                  ...settings,
                  targetMaxKb: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            >
              <option value="">No Budget Limit</option>
              <option value="100">Cap under 100 KB</option>
              <option value="200">Cap under 200 KB</option>
              <option value="500">Cap under 500 KB</option>
            </select>
          </div>

          {/* Naming Pattern */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block">
              Batch Filename Format
            </label>
            <select
              value={settings.namingPattern || 'original'}
              onChange={(e) =>
                onChangeSettings({
                  ...settings,
                  namingPattern: e.target.value as any,
                })
              }
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            >
              <option value="original">filename.webp</option>
              <option value="suffix-opt">filename-opt.webp</option>
              <option value="quality-tag">filename-q85.webp</option>
            </select>
          </div>

          {/* Toggles Strip */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={settings.sharpenOnResize ?? true}
                  onChange={(e) =>
                    onChangeSettings({
                      ...settings,
                      sharpenOnResize: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <span>Auto-sharpen downscaled images</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={settings.stripMetadata ?? true}
                  onChange={(e) =>
                    onChangeSettings({
                      ...settings,
                      stripMetadata: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <span>Strip EXIF & Camera Metadata (Privacy & Space)</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() =>
                onChangeSettings({
                  preset: 'smart',
                  quality: 0.86,
                  maxDimension: 'original',
                  webpMode: 'auto',
                  alphaHandling: 'preserve',
                  stripMetadata: true,
                  sharpenOnResize: true,
                  targetMaxKb: null,
                  namingPattern: 'original',
                })
              }
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
