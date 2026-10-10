import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { OptimizationExplainerAnimation } from './components/OptimizationExplainerAnimation';
import { DropZone } from './components/DropZone';
import { SettingsBar } from './components/SettingsBar';
import { ImageList } from './components/ImageList';
import { ComparisonModal } from './components/ComparisonModal';
import { MediaStudioModal } from './components/MediaStudioModal';
import { AiSeoModal } from './components/AiSeoModal';
import { PrivacyBanner } from './components/PrivacyBanner';
import { WordPressPluginSection } from './components/WordPressPluginSection';
import { MarketComparisonSection } from './components/MarketComparisonSection';
import { SeoFaqSection } from './components/SeoFaqSection';
import { Web3Section } from './components/Web3Section';
import { MetricCard } from './components/untitledui/MetricCard';
import { ConversionItem, ConversionSettings, ImageAdjustments, ImageSeoMetadata } from './types';
import {
  convertToWebp,
  createZipArchive,
  formatBytes,
  loadImageElement,
  triggerDownload,
  DEFAULT_ADJUSTMENTS,
  formatOutputFileName,
  parallelBatchProcess,
  calculateCoreWebVitalsScore,
  generateSeoPictureMarkup,
  generateImageSchemaJson,
  downloadSeoAssetBundleZip,
} from './utils/converter';
import { generateImageSeo } from './utils/aiSeo';
import { Web3WalletState, connectWeb3Wallet } from './utils/web3';
import { createSampleFile, SampleImageDef } from './utils/samples';
import { Logo } from './components/Logo';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('optiwebp_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [settings, setSettings] = useState<ConversionSettings>({
    preset: 'smart',
    quality: 0.86,
    maxDimension: 'original',
    webpMode: 'auto',
    alphaHandling: 'preserve',
    stripMetadata: true,
    sharpenOnResize: true,
    targetMaxKb: null,
    namingPattern: 'original',
    generateResponsiveBundle: true,
  });

  const [items, setItems] = useState<ConversionItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [activeComparisonItem, setActiveComparisonItem] = useState<ConversionItem | null>(null);
  const [activeMediaStudioItem, setActiveMediaStudioItem] = useState<ConversionItem | null>(null);

  // AI SEO state
  const [activeAiSeoItem, setActiveAiSeoItem] = useState<ConversionItem | null>(null);
  const [isGeneratingAiSeo, setIsGeneratingAiSeo] = useState<boolean>(false);
  const [isBatchGeneratingSeo, setIsBatchGeneratingSeo] = useState<boolean>(false);

  // Web3 State
  const [wallet, setWallet] = useState<Web3WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    networkName: 'Not Connected',
  });

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('optiwebp_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('optiwebp_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleConnectWallet = async () => {
    const res = await connectWeb3Wallet();
    setWallet(res);
  };

  const processItem = async (
    item: ConversionItem,
    currentSettings: ConversionSettings,
    overrideAdjustments?: ImageAdjustments
  ): Promise<ConversionItem> => {
    try {
      const res = await convertToWebp(
        item.file,
        currentSettings,
        overrideAdjustments || item.customAdjustments
      );
      const savings =
        item.originalSize > 0
          ? Math.round(((item.originalSize - res.blob.size) / item.originalSize) * 1000) / 10
          : 0;

      const { score } = calculateCoreWebVitalsScore(
        res.blob.size,
        res.width,
        res.height,
        Boolean(item.seoMetadata)
      );

      const updated: ConversionItem = {
        ...item,
        status: 'completed',
        outputBlob: res.blob,
        outputUrl: res.url,
        outputSize: res.blob.size,
        outputWidth: res.width,
        outputHeight: res.height,
        savingsPercent: savings,
        appliedQuality: res.appliedQuality,
        durationMs: res.durationMs,
        coreWebVitalsScore: score,
        error: undefined,
      };

      updated.seoPictureMarkup = generateSeoPictureMarkup(updated, currentSettings);
      updated.seoJsonLd = generateImageSchemaJson(updated);

      return updated;
    } catch (err: any) {
      return {
        ...item,
        status: 'error',
        error: err.message || 'Conversion failed',
      };
    }
  };

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setIsProcessing(true);

      const newItems: ConversionItem[] = await Promise.all(
        files.map(async (file) => {
          const previewUrl = URL.createObjectURL(file);
          let width = 0;
          let height = 0;

          try {
            const img = await loadImageElement(previewUrl);
            width = img.naturalWidth || img.width;
            height = img.naturalHeight || img.height;
          } catch {}

          return {
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            file,
            name: file.name,
            originalSize: file.size,
            originalWidth: width,
            originalHeight: height,
            originalType: file.type || 'image/unknown',
            originalPreviewUrl: previewUrl,
            status: 'converting' as const,
            outputBlob: null,
            outputUrl: null,
            outputSize: null,
            outputWidth: null,
            outputHeight: null,
            savingsPercent: null,
            durationMs: null,
            appliedQuality: settings.quality,
          };
        })
      );

      setItems((prev) => [...newItems, ...prev]);

      // Ultra-fast parallel multi-core batch processing
      await parallelBatchProcess(
        newItems,
        async (item) => {
          const processed = await processItem(item, settings);
          setItems((prev) => prev.map((it) => (it.id === item.id ? processed : it)));
          return processed;
        },
        Math.min(navigator.hardwareConcurrency || 4, 6)
      );

      setIsProcessing(false);
    },
    [settings]
  );

  const handleQuickSampleClick = async (sample: SampleImageDef) => {
    try {
      setLoadingSampleId(sample.id);
      const file = await createSampleFile(sample);
      await handleFilesSelected([file]);
      scrollToConverter();
    } catch (err) {
      console.error('Failed to load sample:', err);
    } finally {
      setLoadingSampleId(null);
    }
  };

  const handleReconvertAll = async (overrideSettings?: ConversionSettings) => {
    const currentSettings = overrideSettings || settings;
    setIsProcessing(true);

    const updated = [...items];
    setItems((prev) => prev.map((it) => ({ ...it, status: 'converting' })));

    await parallelBatchProcess(
      updated,
      async (item) => {
        const processed = await processItem(item, currentSettings);
        setItems((prev) => prev.map((it) => (it.id === item.id ? processed : it)));
        return processed;
      },
      Math.min(navigator.hardwareConcurrency || 4, 6)
    );

    setIsProcessing(false);
  };

  // Inline quality adjustment on single row or card
  const handleItemQualityChange = async (id: string, newQuality: number) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const itemSettings: ConversionSettings = {
      ...(target.customSettings || settings),
      preset: 'custom',
      quality: newQuality,
    };

    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: 'converting' } : it))
    );

    const processed = await processItem(target, itemSettings, target.customAdjustments);
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...processed,
              customSettings: itemSettings,
            }
          : it
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.originalPreviewUrl) {
        URL.revokeObjectURL(target.originalPreviewUrl);
      }
      if (target?.outputUrl) {
        URL.revokeObjectURL(target.outputUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((i) => {
      if (i.originalPreviewUrl) URL.revokeObjectURL(i.originalPreviewUrl);
      if (i.outputUrl) URL.revokeObjectURL(i.outputUrl);
    });
    setItems([]);
  };

  const handleDownloadAll = async () => {
    const completed = items.filter((i) => i.status === 'completed' && i.outputBlob);
    if (completed.length === 0) return;

    if (completed.length === 1) {
      const item = completed[0];
      const filename = formatOutputFileName(
        item.name,
        item.customSettings || settings,
        item.seoMetadata
      );
      triggerDownload(item.outputBlob!, filename);
      return;
    }

    try {
      setIsProcessing(true);
      const zipBlob = await createZipArchive(completed, settings);
      triggerDownload(zipBlob, 'optiwebp-images.zip');
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSelected = async (selectedIds: string[]) => {
    const selected = items.filter(
      (i) => selectedIds.includes(i.id) && i.status === 'completed' && i.outputBlob
    );
    if (selected.length === 0) return;

    if (selected.length === 1) {
      const item = selected[0];
      const filename = formatOutputFileName(
        item.name,
        item.customSettings || settings,
        item.seoMetadata
      );
      triggerDownload(item.outputBlob!, filename);
      return;
    }

    try {
      setIsProcessing(true);
      const zipBlob = await createZipArchive(selected, settings);
      triggerDownload(zipBlob, 'optiwebp-selected.zip');
    } catch (err) {
      console.error('Failed to create ZIP for selection:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSeoBundle = async (item: ConversionItem) => {
    await downloadSeoAssetBundleZip(item, settings);
  };

  // Media Studio Handlers
  const handleOpenMediaStudio = (item: ConversionItem) => {
    setActiveMediaStudioItem(item);
  };

  const handleApplyItemSettings = (
    id: string,
    newSettings: ConversionSettings,
    newAdjustments: ImageAdjustments,
    processedBlob: Blob,
    processedUrl: string,
    width: number,
    height: number,
    savings: number,
    quality: number,
    durationMs: number
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated: ConversionItem = {
          ...it,
          customSettings: newSettings,
          customAdjustments: newAdjustments,
          outputBlob: processedBlob,
          outputUrl: processedUrl,
          outputWidth: width,
          outputHeight: height,
          savingsPercent: savings,
          appliedQuality: quality,
          durationMs,
        };
        const { score } = calculateCoreWebVitalsScore(
          processedBlob.size,
          width,
          height,
          Boolean(it.seoMetadata)
        );
        updated.coreWebVitalsScore = score;
        updated.seoPictureMarkup = generateSeoPictureMarkup(updated, newSettings);
        updated.seoJsonLd = generateImageSchemaJson(updated);
        return updated;
      })
    );
  };

  const handleApplySettingsToAll = async (
    newSettings: ConversionSettings,
    newAdjustments: ImageAdjustments
  ) => {
    setSettings(newSettings);
    setIsProcessing(true);

    const updated = items.map((it) => ({
      ...it,
      customSettings: newSettings,
      customAdjustments: newAdjustments,
      status: 'converting' as const,
    }));
    setItems(updated);

    await parallelBatchProcess(
      updated,
      async (item) => {
        const processed = await processItem(item, newSettings, newAdjustments);
        setItems((prev) => prev.map((it) => (it.id === item.id ? processed : it)));
        return processed;
      },
      Math.min(navigator.hardwareConcurrency || 4, 6)
    );

    setIsProcessing(false);
  };

  // AI SEO Handlers
  const handleOpenAiSeo = (item: ConversionItem) => {
    setActiveAiSeoItem(item);
  };

  const handleUpdateSeoMetadata = (itemId: string, metadata: ImageSeoMetadata) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const updated = { ...it, seoMetadata: metadata };
        const { score } = calculateCoreWebVitalsScore(
          it.outputSize,
          it.outputWidth,
          it.outputHeight,
          true
        );
        updated.coreWebVitalsScore = score;
        updated.seoPictureMarkup = generateSeoPictureMarkup(updated, it.customSettings || settings);
        updated.seoJsonLd = generateImageSchemaJson(updated);
        return updated;
      })
    );
  };

  const handleRenameItem = (itemId: string, newName: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, name: newName } : it))
    );
  };

  const handleGenerateSeo = async (item: ConversionItem) => {
    setIsGeneratingAiSeo(true);
    try {
      const sourceBlob = item.outputBlob || item.file;
      const metadata = await generateImageSeo(sourceBlob, item.name);
      handleUpdateSeoMetadata(item.id, metadata);
    } catch (err) {
      console.error('Failed to generate AI SEO:', err);
    } finally {
      setIsGeneratingAiSeo(false);
    }
  };

  const handleBatchGenerateSeo = async () => {
    const candidates = items.filter((i) => !i.seoMetadata);
    if (candidates.length === 0) return;

    setIsBatchGeneratingSeo(true);
    for (const item of candidates) {
      try {
        const sourceBlob = item.outputBlob || item.file;
        const metadata = await generateImageSeo(sourceBlob, item.name);
        handleUpdateSeoMetadata(item.id, metadata);
      } catch (err) {
        console.error('Failed AI SEO for', item.name, err);
      }
    }
    setIsBatchGeneratingSeo(false);
  };

  // Metrics
  const completedItems = items.filter((i) => i.status === 'completed');
  const completedCount = completedItems.length;
  const totalOriginalBytes = completedItems.reduce((acc, i) => acc + i.originalSize, 0);
  const totalOutputBytes = completedItems.reduce((acc, i) => acc + (i.outputSize || 0), 0);
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalOutputBytes);
  const totalSavingsPercent =
    totalOriginalBytes > 0
      ? Math.round((totalSavedBytes / totalOriginalBytes) * 1000) / 10
      : 0;

  const scrollToConverter = () => {
    document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPlugin = () => {
    document.getElementById('wordpress-plugin')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#090c13] text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
      {/* Header with Mobile Drawer - Full Screen Width */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        hasConvertedItems={completedCount > 0}
        onDownloadAll={handleDownloadAll}
        wallet={wallet}
        onConnectWallet={handleConnectWallet}
        onScrollToConverter={scrollToConverter}
      />

      {/* Hero Section */}
      <section className="w-full border-b border-neutral-200/80 dark:border-neutral-800/80">
        <Hero
          onScrollToConverter={scrollToConverter}
          onScrollToPlugin={scrollToPlugin}
        />
      </section>

      {/* CONVERTER WORKSPACE: Driven Directly for Instant User Engagement (Full Screen Fluid) */}
      <section id="converter" className="w-full py-8 sm:py-12 border-b border-neutral-200/80 dark:border-neutral-800/80 scroll-mt-20">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-6">
          <DropZone onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />

          <SettingsBar
            settings={settings}
            onChangeSettings={setSettings}
            onReconvertAll={() => handleReconvertAll(settings)}
            hasItems={items.length > 0}
            isProcessing={isProcessing}
          />

          <ImageList
            items={items}
            globalSettings={settings}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
            onDownloadAll={handleDownloadAll}
            onDownloadSelected={handleDownloadSelected}
            onDownloadSeoBundle={handleDownloadSeoBundle}
            onInspectItem={(item) => setActiveComparisonItem(item)}
            onOpenMediaStudio={handleOpenMediaStudio}
            onOpenAiSeo={handleOpenAiSeo}
            onBatchGenerateSeo={items.length > 0 ? handleBatchGenerateSeo : undefined}
            onItemQualityChange={handleItemQualityChange}
            isGeneratingAnySeo={isBatchGeneratingSeo}
          />
        </div>
      </section>

      {/* Global Batch Statistics Strip */}
      {completedCount > 0 && (
        <section className="w-full py-6 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-[#11141b]/60">
          <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Total Data Saved"
                value={formatBytes(totalSavedBytes)}
                change={`-${totalSavingsPercent}%`}
                changeType="positive"
                subtitle="Stripped client-side"
              />
              <MetricCard
                label="Payload Reduction"
                value={`${totalSavingsPercent}%`}
                change="Multi-Core Fast"
                changeType="positive"
                subtitle="Zero visual compromise"
              />
              <MetricCard
                label="Images Converted"
                value={completedCount}
                change="100% Local"
                changeType="neutral"
                subtitle="Hardware canvas encoded"
              />
              <MetricCard
                label="Core Web Vitals Elite"
                value={`${items.filter((i) => (i.coreWebVitalsScore || 0) >= 85).length}/${completedCount}`}
                change="Zero CLS Shift"
                changeType="positive"
                subtitle="LCP-optimized responsive"
              />
            </div>
          </div>
        </section>
      )}

      {/* Interactive "How WebP Optimization Works" Deep-Dive Section */}
      <section id="how-it-works" className="w-full py-10 sm:py-14 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-[#0e1117]/40 scroll-mt-20">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <OptimizationExplainerAnimation />
        </div>
      </section>

      {/* Free WordPress Plugin with WebP Toggle & Live Verification */}
      <section className="w-full py-10 sm:py-14 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <WordPressPluginSection />
        </div>
      </section>

      {/* Market Tools Benchmark & Competitor Comparison */}
      <section id="compare" className="w-full py-10 sm:py-14 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/30 dark:bg-[#0c0f16]/30 scroll-mt-20">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <MarketComparisonSection />
        </div>
      </section>

      {/* Image SEO & Core Web Vitals FAQ Guide */}
      <section id="seo-faq" className="w-full py-10 sm:py-14 border-b border-neutral-200/80 dark:border-neutral-800/80 scroll-mt-20">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <SeoFaqSection />
        </div>
      </section>

      {/* Clean Web3 & IPFS Tool Strip */}
      <section id="web3-integration" className="w-full py-10 sm:py-14 border-b border-neutral-200/80 dark:border-neutral-800/80 scroll-mt-20">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <Web3Section
            wallet={wallet}
            onWalletChange={setWallet}
            items={items}
          />
        </div>
      </section>

      {/* Compact Privacy Trust Bar */}
      <section className="w-full py-6 sm:py-8 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <PrivacyBanner />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-[#0c0e12] border-t border-neutral-200/80 dark:border-neutral-800/80">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <Logo size="sm" showText={false} />
                <span className="font-bold text-neutral-900 dark:text-white">OptiWebP</span>
              </div>
              <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-neutral-600 dark:text-neutral-300">
                Engineered with precision by{' '}
                <a
                  href="https://github.com/aialamin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-neutral-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-4"
                >
                  Al Amin Hossain
                </a>{' '}
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 ml-1">
                  Software Engineer
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-neutral-600 dark:text-neutral-400">
              <a href="#converter" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Converter</a>
              <a href="#how-it-works" className="hover:text-neutral-900 dark:hover:text-white transition-colors">How it Works</a>
              <a href="#wordpress-plugin" className="hover:text-neutral-900 dark:hover:text-white transition-colors">WordPress Plugin</a>
              <a href="#compare" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Compare Tools</a>
              <a href="#seo-faq" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Image SEO</a>
              <a
                href="https://github.com/aialamin/optiwebp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub @aialamin</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Comparison Modal */}
      <ComparisonModal
        item={activeComparisonItem}
        onClose={() => setActiveComparisonItem(null)}
        onOpenAiSeo={handleOpenAiSeo}
        onOpenMediaStudio={handleOpenMediaStudio}
      />

      {/* Media Studio Modal */}
      <MediaStudioModal
        item={activeMediaStudioItem}
        globalSettings={settings}
        onClose={() => setActiveMediaStudioItem(null)}
        onApplyItemSettings={handleApplyItemSettings}
        onApplyToAll={handleApplySettingsToAll}
        onDownloadSeoBundle={handleDownloadSeoBundle}
      />

      {/* AI SEO Assistant Modal */}
      <AiSeoModal
        item={activeAiSeoItem}
        onClose={() => setActiveAiSeoItem(null)}
        onUpdateMetadata={handleUpdateSeoMetadata}
        onRenameItem={handleRenameItem}
        onRegenerate={handleGenerateSeo}
        onDownloadSeoBundle={handleDownloadSeoBundle}
        isGenerating={isGeneratingAiSeo}
      />
    </div>
  );
}
