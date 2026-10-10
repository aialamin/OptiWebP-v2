import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Download,
  Code2,
  RefreshCw,
  FileCheck2,
  ExternalLink,
  Tag,
  PenLine,
} from 'lucide-react';
import { ConversionItem, ImageSeoMetadata } from '../types';
import { triggerDownload } from '../utils/converter';

interface AiSeoModalProps {
  item: ConversionItem | null;
  onClose: () => void;
  onUpdateMetadata: (itemId: string, metadata: ImageSeoMetadata) => void;
  onRenameItem?: (itemId: string, newName: string) => void;
  onRegenerate: (item: ConversionItem) => void;
  onDownloadSeoBundle?: (item: ConversionItem) => void;
  isGenerating: boolean;
}

export const AiSeoModal: React.FC<AiSeoModalProps> = ({
  item,
  onClose,
  onUpdateMetadata,
  onRenameItem,
  onRegenerate,
  onDownloadSeoBundle,
  isGenerating,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'img' | 'picture' | 'json'>('img');

  if (!item) return null;

  const seo = item.seoMetadata;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplySuggestedName = () => {
    if (seo?.suggestedFileName && onRenameItem) {
      onRenameItem(item.id, seo.suggestedFileName);
    }
  };

  const handleExportJson = () => {
    if (!seo) return;
    const jsonStr = JSON.stringify(
      {
        fileName: item.name,
        originalWidth: item.originalWidth,
        originalHeight: item.originalHeight,
        seoMetadata: seo,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    triggerDownload(blob, `${item.name.replace(/\.[^/.]+$/, '')}-seo-meta.json`);
  };

  // Generate snippets
  const cleanWebpName = seo?.suggestedFileName || item.name.replace(/\.[^/.]+$/, '') + '.webp';
  const htmlImgTag = `<img src="${cleanWebpName}" alt="${seo?.altText || ''}" title="${seo?.title || ''}" width="${item.outputWidth || item.originalWidth}" height="${item.outputHeight || item.originalHeight}" loading="lazy" decoding="async" />`;
  const htmlPictureTag = `<picture>\n  <source srcset="${cleanWebpName}" type="image/webp">\n  <img src="${item.name}" alt="${seo?.altText || ''}" title="${seo?.title || ''}" width="${item.outputWidth || item.originalWidth}" height="${item.outputHeight || item.originalHeight}" loading="lazy">\n</picture>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#0f1218] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#131720]/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  AI Image SEO Assistant
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800/60">
                  Google Gemini
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-md">
                Optimized Title, Alt Text, Caption & Semantic Keywords for: {item.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRegenerate(item)}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Regenerate with AI"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isGenerating ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Analyzing visual features with Gemini AI...
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1">
                  Extracting objects, context, lighting, and formulating ranking-optimized Title, Alt Text, and Caption.
                </p>
              </div>
            </div>
          ) : !seo ? (
            <div className="py-16 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                No SEO metadata generated yet for this image.
              </p>
              <button
                onClick={() => onRegenerate(item)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-xl"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate SEO Metadata Now</span>
              </button>
            </div>
          ) : (
            <>
              {/* Image Preview & Quick Summary */}
              <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-[#13161f] border border-neutral-200/80 dark:border-neutral-800">
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700 bg-transparency-grid">
                  <img
                    src={item.outputUrl || item.originalPreviewUrl}
                    alt={seo.altText}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono text-neutral-400">Suggested SEO Filename:</span>
                    <button
                      onClick={handleApplySuggestedName}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Use as File Name
                    </button>
                  </div>
                  <div className="font-mono text-xs font-bold text-neutral-900 dark:text-white bg-white dark:bg-[#0c0e12] px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 break-all">
                    {seo.suggestedFileName}
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Hyphenated lowercase naming improves Google Image Search crawling and CTR.
                  </p>
                </div>
              </div>

              {/* Core SEO Metadata Fields */}
              <div className="space-y-4">
                {/* 1. SEO Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      SEO Title
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-neutral-400">
                        {seo.title.length}/60 chars
                      </span>
                      <button
                        onClick={() => handleCopy(seo.title, 'title')}
                        className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                      >
                        {copiedKey === 'title' ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={seo.title}
                    onChange={(e) =>
                      onUpdateMetadata(item.id, { ...seo, title: e.target.value })
                    }
                    className="w-full text-xs font-medium bg-neutral-50 dark:bg-[#13161f] text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>

                {/* 2. Alt Text (Screen Readers & Google Search) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Alt Text (Alternative Description)
                      </label>
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800/60">
                        Crucial for SEO & Accessibility
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-neutral-400">
                        {seo.altText.length}/125 chars
                      </span>
                      <button
                        onClick={() => handleCopy(seo.altText, 'altText')}
                        className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                      >
                        {copiedKey === 'altText' ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={seo.altText}
                    onChange={(e) =>
                      onUpdateMetadata(item.id, { ...seo, altText: e.target.value })
                    }
                    className="w-full text-xs font-medium bg-neutral-50 dark:bg-[#13161f] text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-400 leading-relaxed"
                  />
                </div>

                {/* 3. Caption */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Editorial Caption (Visible to Visitors)
                    </label>
                    <button
                      onClick={() => handleCopy(seo.caption, 'caption')}
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'caption' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={seo.caption}
                    onChange={(e) =>
                      onUpdateMetadata(item.id, { ...seo, caption: e.target.value })
                    }
                    className="w-full text-xs font-medium bg-neutral-50 dark:bg-[#13161f] text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>

                {/* 4. Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Deep Image Description (WordPress Media Library & Schema)
                    </label>
                    <button
                      onClick={() => handleCopy(seo.description, 'description')}
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'description' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={seo.description}
                    onChange={(e) =>
                      onUpdateMetadata(item.id, { ...seo, description: e.target.value })
                    }
                    className="w-full text-xs font-medium bg-neutral-50 dark:bg-[#13161f] text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-400 leading-relaxed"
                  />
                </div>

                {/* 5. Semantic Search Keywords */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-neutral-400" />
                      Target Semantic Keywords
                    </label>
                    <button
                      onClick={() => handleCopy(seo.keywords.join(', '), 'keywords')}
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'keywords' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy All as CSV</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seo.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/80"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ready-to-Paste Embed Code Snippets */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#13161f] border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                      Instant Embed Snippets
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveSnippetTab('img')}
                      className={`px-2 py-0.5 text-xs rounded transition-colors cursor-pointer ${
                        activeSnippetTab === 'img'
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      &lt;img&gt;
                    </button>
                    <button
                      onClick={() => setActiveSnippetTab('picture')}
                      className={`px-2 py-0.5 text-xs rounded transition-colors cursor-pointer ${
                        activeSnippetTab === 'picture'
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      &lt;picture&gt; WebP
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <pre className="p-3 bg-white dark:bg-[#090b0e] border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] font-mono text-neutral-800 dark:text-neutral-200 overflow-x-auto whitespace-pre-wrap">
                    {activeSnippetTab === 'img' ? htmlImgTag : htmlPictureTag}
                  </pre>
                  <button
                    onClick={() =>
                      handleCopy(
                        activeSnippetTab === 'img' ? htmlImgTag : htmlPictureTag,
                        'snippet'
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copiedKey === 'snippet' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white dark:bg-[#0f1218] border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              disabled={!seo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            {onDownloadSeoBundle && (
              <button
                onClick={() => onDownloadSeoBundle(item)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer border border-emerald-300 dark:border-emerald-700"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Download SEO Asset Pack (.zip)</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
