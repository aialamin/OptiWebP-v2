import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCode,
  Sparkles,
  Zap,
  Globe2,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Gauge,
} from 'lucide-react';
import { Badge } from './untitledui/Badge';
import { SpotlightCard } from './animations/SpotlightCard';
import { ShinyText } from './animations/ShinyText';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'seo' | 'performance' | 'privacy' | 'wordpress';
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'why-google-loves-webp',
    category: 'seo',
    question: 'Why does Google recommend WebP for SEO and Core Web Vitals?',
    answer:
      'Google Lighthouse and PageSpeed Insights explicitly flag "Serve images in next-gen formats" when PNG or JPEG images are detected. WebP images are 26% to 34% smaller than JPEG at identical structural similarity (SSIM). Lighter images directly accelerate Largest Contentful Paint (LCP) by up to 1.8 seconds, a critical ranking factor in Google Search mobile indexation.',
  },
  {
    id: 'how-optiwebp-compares',
    category: 'performance',
    question: 'How is OptiWebP different from TinyPNG and Squoosh?',
    answer:
      'While TinyPNG and ShortPixel upload your private images to cloud servers and charge monthly credit subscriptions, OptiWebP runs 100% locally in your browser using HTML5 Canvas & WebAssembly APIs. Unlike Squoosh (which only converts one file at a time), OptiWebP batch-processes hundreds of files concurrently off-thread with createImageBitmap, includes a free WordPress plugin, and generates AI alt-text with Google Gemini.',
  },
  {
    id: 'are-images-private',
    category: 'privacy',
    question: 'Are my images ever uploaded to a remote server or third-party cloud?',
    answer:
      'No. Your images never leave your device. All decoding, compression, and WebP encoding happen entirely in client-side memory on your CPU and GPU. There are no tracking scripts, no file uploads, and no cloud queues. This makes OptiWebP safe for confidential corporate media, NDA brand assets, medical scans, and personal photos.',
  },
  {
    id: 'ai-seo-alt-text',
    category: 'seo',
    question: 'How does the AI Image SEO Assistant boost Google Image Search traffic?',
    answer:
      'Search crawlers cannot visually interpret image pixels directly; they rely on semantic Alt Text, descriptive file names, and contextual captions. OptiWebP integrates Google Gemini to inspect your visual assets and automatically formulate accessibility-compliant alt attributes, SEO-focused titles, and hyphenated crawl-friendly file names (e.g. "modern-minimalist-living-room.webp").',
  },
  {
    id: 'how-to-use-wordpress-plugin',
    category: 'wordpress',
    question: 'How does the free OptiWebP WordPress plugin work without API keys?',
    answer:
      'Traditional WordPress image plugins (like Smush or TinyPNG) require registering for paid API keys and routing photos through external servers. The OptiWebP plugin is a free, self-contained PHP helper that integrates with WordPress upload hooks or outputs clean HTML5 <picture> fallbacks with automated WebP conversion on upload, without monthly quotas or subscription fees.',
  },
  {
    id: 'browser-compatibility',
    category: 'performance',
    question: 'What is the browser support for WebP images in 2025 and 2026?',
    answer:
      'WebP is supported by 97.2%+ of all browsers worldwide, including Apple Safari (iOS & macOS), Google Chrome, Mozilla Firefox, Microsoft Edge, Opera, and Android Chromium. For legacy browsers, OptiWebP provides an automated <picture> tag embed snippet that gracefully falls back to PNG or JPEG.',
  },
];

export const SeoFaqSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('why-google-loves-webp');
  const [activeCategory, setActiveCategory] = useState<'all' | 'seo' | 'performance' | 'privacy' | 'wordpress'>('all');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const filteredFaqs =
    activeCategory === 'all'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  const responsivePictureSnippet = `<!-- Google Recommended Next-Gen Responsive Picture Tag -->
<picture>
  <source srcset="hero-banner.webp" type="image/webp">
  <img 
    src="hero-banner.jpg" 
    alt="Detailed description for accessibility & SEO"
    title="Optimized Keyword Title"
    width="1200" 
    height="630" 
    loading="lazy" 
    decoding="async"
  />
</picture>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(responsivePictureSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <section id="seo-faq" className="w-full scroll-mt-20">
      <div className="w-full max-w-[1720px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center mb-3">
            <Badge variant="brand" size="md" dot>
              <span>SEO & Core Web Vitals</span>
              <span className="mx-1 text-emerald-400">·</span>
              <ShinyText speed={5} className="font-semibold text-emerald-700 dark:text-emerald-300">
                Search Engine Optimization Guide
              </ShinyText>
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-3">
            Master Image SEO & Google Search Rankings
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Fast-loading images directly impact search rankings, bounce rates, and organic click-throughs.
            Follow Google&apos;s technical standards for maximum SEO impact.
          </p>
        </div>

        {/* 3 Pillars of Image SEO Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpotlightCard className="p-6 rounded-2xl bg-white dark:bg-[#0f131a] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              1. Core Web Vitals & LCP
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Google uses Largest Contentful Paint (LCP) as a direct search ranking signal. Replacing bulky 3MB hero images with 250KB WebP files ensures sub-2.5s LCP on mobile 4G networks.
            </p>
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Target: LCP &lt; 2.5 seconds
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 rounded-2xl bg-white dark:bg-[#0f131a] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              2. Semantic Alt Text & Naming
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Google Image Search drives up to 20% of organic web visits. Use hyphenated keywords in filenames (not <code className="text-neutral-800 dark:text-neutral-200">IMG_2901.jpg</code>) and clear, descriptive alt attributes with OptiWebP&apos;s AI assistant.
            </p>
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
              WCAG &amp; ADA Compliant
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 rounded-2xl bg-white dark:bg-[#0f131a] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
              3. Responsive HTML5 &lt;picture&gt;
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Always declare explicit <code className="text-neutral-800 dark:text-neutral-200">width</code> and <code className="text-neutral-800 dark:text-neutral-200">height</code> to prevent Cumulative Layout Shift (CLS), and enable native <code className="text-neutral-800 dark:text-neutral-200">loading=&quot;lazy&quot;</code> to save mobile bandwidth.
            </p>
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
              Zero Cumulative Layout Shift
            </div>
          </SpotlightCard>
        </div>

        {/* Code Snippet Box for Google Best Practice */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0f1218] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                Google Recommended HTML5 WebP Markup
              </h4>
            </div>
            <button
              onClick={handleCopySnippet}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer self-start sm:self-auto"
            >
              {copiedSnippet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code Snippet</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-neutral-50 dark:bg-[#090b0f] border border-neutral-200/80 dark:border-neutral-800 rounded-xl text-xs font-mono text-neutral-800 dark:text-neutral-200 overflow-x-auto leading-relaxed">
            {responsivePictureSnippet}
          </pre>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Frequently Asked Questions (FAQ)
              </h3>
            </div>

            {/* Category filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'seo', label: 'SEO & Ranking' },
                { id: 'performance', label: 'Performance' },
                { id: 'privacy', label: 'Privacy' },
                { id: 'wordpress', label: 'WordPress' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="py-4">
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {faq.question}
                    </span>
                    <span className="p-1 rounded-md text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors shrink-0">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed animate-in fade-in duration-150 pr-8">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
