import React, { useState } from 'react';
import {
  Check,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Coins,
  Search,
} from 'lucide-react';
import { Badge } from './untitledui/Badge';
import { Button } from './untitledui/Button';
import { SpotlightCard } from './animations/SpotlightCard';
import { ShinyText } from './animations/ShinyText';

interface Competitor {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  location: string;
  limits: string;
  pricing: string;
  batch: string;
  preview: string;
  wordpress: string;
  aiSeo: string;
  web3: string;
  pros: string[];
  cons: string[];
}

const COMPETITORS: Competitor[] = [
  {
    id: 'optiwebp',
    name: 'OptiWebP',
    tagline: 'Client-side hardware converter & WordPress plugin',
    badge: 'Our Solution',
    location: '100% In-Browser (Local)',
    limits: 'Unlimited / No Caps',
    pricing: '100% Free Forever',
    batch: 'Multi-Core Off-Thread Parallel',
    preview: 'Side-by-Side Interactive Split',
    wordpress: 'Free Plugin & Server Snippet Included',
    aiSeo: 'Built-in Gemini Alt Text & Title Generator',
    web3: 'IPFS CID & SHA-256 Content Hash',
    pros: [
      'Zero server uploads — 100% private & GDPR compliant',
      'Batch converts hundreds of images without queue slowdown',
      'Free WordPress plugin with zero monthly credit caps',
      'Google Gemini AI formulated alt-tags & SEO file naming',
    ],
    cons: [],
  },
  {
    id: 'squoosh',
    name: 'Squoosh (Google)',
    tagline: 'Web app by Google Chrome Labs',
    badge: 'Open Source',
    location: 'In-Browser (Local)',
    limits: 'Unlimited',
    pricing: 'Free (Open Source)',
    batch: '1 image at a time (No batch)',
    preview: 'Side-by-Side Split Slider',
    wordpress: 'None (Manual only)',
    aiSeo: 'None',
    web3: 'None',
    pros: ['Excellent granular codec control', 'Zero server uploads for single images'],
    cons: [
      'No batch processing in the web interface',
      'No CMS or WordPress automation',
      'No SEO metadata or alt-tag suggestions',
    ],
  },
  {
    id: 'tinypng',
    name: 'TinyPNG / Tinify',
    tagline: 'Popular cloud compression service',
    badge: 'Cloud Service',
    location: 'Cloud Servers (Upload required)',
    limits: '500 compressions/month free',
    pricing: '$0.009/image after 500 (~$39+/yr)',
    batch: 'Max 20 files per drop (Web)',
    preview: 'Static download only',
    wordpress: 'Plugin available (Credit based)',
    aiSeo: 'None',
    web3: 'None',
    pros: ['Simple drag-and-drop web UI', 'Established WordPress plugin'],
    cons: [
      'Images uploaded to external cloud servers',
      'WordPress plugin consumes 5-10 credits per image for thumbnails',
      'No live quality split-comparison preview',
      'Expensive subscriptions for medium/large media libraries',
    ],
  },
  {
    id: 'shortpixel',
    name: 'ShortPixel',
    tagline: 'Cloud image optimization & CDN',
    badge: 'SaaS Tool',
    location: 'Cloud Servers (Upload required)',
    limits: '100 images/month free',
    pricing: 'From $9.99/month (~$120/yr)',
    batch: 'Online web tool limited',
    preview: 'Basic preview mode',
    wordpress: 'Plugin available (API key required)',
    aiSeo: 'Paid add-on only',
    web3: 'None',
    pros: ['Supports AVIF and WebP', 'Good WordPress integration'],
    cons: [
      'Strict 100 images/month free limit',
      'Requires cloud API key configuration',
      'High recurring monthly subscription fees',
      'Images leave your local machine',
    ],
  },
  {
    id: 'imagify',
    name: 'Imagify (WP Rocket)',
    tagline: 'WordPress-focused image optimizer',
    badge: 'WP Focused',
    location: 'Cloud Servers (Upload required)',
    limits: '20 MB / month free (~200 imgs)',
    pricing: 'From $5.99 to $9.99/mo',
    batch: 'WP media library bulk',
    preview: 'No visual split slider',
    wordpress: 'Plugin available (Account needed)',
    aiSeo: 'None',
    web3: 'None',
    pros: ['Seamless WP Rocket caching integration', 'Automated backup of originals'],
    cons: [
      'Very restrictive 20MB monthly free tier',
      'Requires account creation and cloud token',
      'No Web3 / IPFS or cryptographic hashing',
      'No standalone fast client-side web converter',
    ],
  },
];

export const MarketComparisonSection: React.FC = () => {
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>('tinypng');
  const [siteImagesEstimate, setSiteImagesEstimate] = useState<number>(350);

  // Core Web Vitals and Cost Savings Math
  const avgImageSizeMb = 1.8; // avg original MB
  const webpAvgReduction = 0.72; // 72% reduction
  const totalOriginalGb = (siteImagesEstimate * avgImageSizeMb) / 1024;
  const totalOptimizedGb = totalOriginalGb * (1 - webpAvgReduction);
  const bandwidthSavedGb = totalOriginalGb - totalOptimizedGb;
  const lcpImprovementMs = Math.round(Math.min(1800, siteImagesEstimate * 3.2 + 450));
  const competitorAnnualCost = siteImagesEstimate > 100 ? (siteImagesEstimate > 500 ? 118 : 60) : 0;

  const currentCompetitor =
    COMPETITORS.find((c) => c.id === selectedCompetitorId) || COMPETITORS[2];
  const optiwebp = COMPETITORS[0];

  return (
    <section id="compare" className="w-full scroll-mt-20">
      <div className="w-full max-w-[1720px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center mb-3">
            <Badge variant="brand" size="md" dot>
              <span>Market Benchmark</span>
              <span className="mx-1 text-emerald-400">·</span>
              <ShinyText speed={5} className="font-semibold text-emerald-700 dark:text-emerald-300">
                Feature & Performance Breakdown
              </ShinyText>
            </Badge>
          </div>

          <h2 className="typespace-heading text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white mb-3">
            How OptiWebP Outperforms Market Tools
          </h2>
          <p className="typespace-subhead text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
            See how client-side multi-threading beats legacy cloud image compressors on privacy,
            batch performance, and recurring subscription fees.
          </p>
        </div>

        {/* Competitor Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mr-2">
            Compare OptiWebP with:
          </span>
          {COMPETITORS.filter((c) => c.id !== 'optiwebp').map((comp) => {
            const isSelected = selectedCompetitorId === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => setSelectedCompetitorId(comp.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer border active:scale-95 ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-xs'
                    : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {comp.name}
              </button>
            );
          })}
        </div>

        {/* Head-to-Head Comparison Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* OptiWebP (Our Solution) */}
          <SpotlightCard className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0f131a] border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {optiwebp.name}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {optiwebp.tagline}
                </p>
              </div>

              <div className="text-right">
                <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-base sm:text-lg">
                  $0 Free
                </div>
                <div className="text-[10px] font-mono text-neutral-400">Unlimited Usage</div>
              </div>
            </div>

            {/* Feature Spec List */}
            <div className="space-y-2.5 text-xs border-y border-neutral-100 dark:border-neutral-800/80 py-4 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Processing Engine</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {optiwebp.location}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Batch Processing</span>
                <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  {optiwebp.batch}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Quality Inspection</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {optiwebp.preview}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">WordPress Optimization</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Plugin + Rewrite Included
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">AI Image SEO (Gemini)</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Alt Text & SEO Title Included
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Web3 & Decentralized</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  IPFS CID & SHA-256 Hashes
                </span>
              </div>
            </div>

            {/* Key Advantages */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Key Advantages
              </span>
              <ul className="space-y-1.5">
                {optiwebp.pros.map((pro, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SpotlightCard>

          {/* Competitor Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-neutral-50/80 dark:bg-[#11141b] border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {currentCompetitor.name}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {currentCompetitor.badge}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {currentCompetitor.tagline}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-neutral-900 dark:text-white font-extrabold text-base sm:text-lg">
                    {currentCompetitor.pricing}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {currentCompetitor.limits}
                  </div>
                </div>
              </div>

              {/* Feature Spec List */}
              <div className="space-y-2.5 text-xs border-y border-neutral-200/80 dark:border-neutral-800/80 py-4 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Processing Engine</span>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {currentCompetitor.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Batch Processing</span>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {currentCompetitor.batch}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Quality Inspection</span>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {currentCompetitor.preview}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">WordPress Optimization</span>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {currentCompetitor.wordpress}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">AI Image SEO</span>
                  <span className="font-semibold text-neutral-500 dark:text-neutral-400">
                    {currentCompetitor.aiSeo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Web3 & Decentralized</span>
                  <span className="font-semibold text-neutral-500 dark:text-neutral-400">
                    {currentCompetitor.web3}
                  </span>
                </div>
              </div>

              {/* Limitations List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Documented Limitations
                </span>
                <ul className="space-y-1.5">
                  {currentCompetitor.cons.map((con, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400"
                    >
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 text-xs text-neutral-500 dark:text-neutral-400">
              * Based on publicly published 2025/2026 free tier quotas and SaaS pricing matrices.
            </div>
          </div>
        </div>

        {/* Interactive Core Web Vitals & Cost Savings Impact Calculator */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#10131a] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  Interactive Core Web Vitals & Savings Estimator
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
                Slide to estimate your media library size and see projected LCP speedup, bandwidth
                slashes, and annual subscription costs saved with OptiWebP.
              </p>
            </div>

            {/* Slider Control */}
            <div className="w-full lg:w-72 bg-neutral-50 dark:bg-[#161a24] p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-600 dark:text-neutral-400">
                  Media Library Size:
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {siteImagesEstimate} images
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="2000"
                step="20"
                value={siteImagesEstimate}
                onChange={(e) => setSiteImagesEstimate(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>20 imgs</span>
                <span>500 imgs</span>
                <span>2,000 imgs</span>
              </div>
            </div>
          </div>

          {/* Metric Projection Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#131620] border border-neutral-200/80 dark:border-neutral-800/80">
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 block mb-1">
                Bandwidth Stripped
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {bandwidthSavedGb.toFixed(1)} GB
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 block">
                72% average byte saving
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#131620] border border-neutral-200/80 dark:border-neutral-800/80">
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 block mb-1">
                LCP Load Acceleration
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                -{lcpImprovementMs} ms
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 block">
                Faster Largest Contentful Paint
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#131620] border border-neutral-200/80 dark:border-neutral-800/80">
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 block mb-1">
                SaaS Subscription Saved
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ${competitorAnnualCost}/yr
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 block">
                vs TinyPNG / ShortPixel paid plans
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#131620] border border-neutral-200/80 dark:border-neutral-800/80">
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 block mb-1">
                Data Privacy Exposure
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                0 Files Sent
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 block">
                100% processed on your CPU/GPU
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
