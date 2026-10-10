import React from 'react';
import { Sparkles, Layers, Activity, FileCheck, Globe } from 'lucide-react';

export const WebpGuide: React.FC = () => {
  return (
    <section id="why-webp" className="w-full my-8">
      <div className="bg-white dark:bg-[#11141b] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 transition-colors">
        <div className="max-w-3xl mb-8">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
            Why Modern Websites Standardize on WebP
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Developed by Google, the WebP container delivers advanced lossy and lossless compression designed specifically to accelerate web page loading speeds without visible quality degradation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800">
            <div className="text-emerald-600 dark:text-emerald-400 mb-2 font-mono text-2xl font-bold tabular-nums">
              26–34%
            </div>
            <h5 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
              Smaller Than JPEG
            </h5>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Produces identical structural similarity (SSIM) index scores at roughly one-third lower byte weight.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800">
            <div className="text-emerald-600 dark:text-emerald-400 mb-2 font-mono text-2xl font-bold tabular-nums">
              3× Lighter
            </div>
            <h5 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
              Alpha Transparency
            </h5>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Supports 8-bit alpha channels at a fraction of the weight of 24/32-bit PNG, ideal for icons & logos.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800">
            <div className="text-emerald-600 dark:text-emerald-400 mb-2 font-mono text-2xl font-bold tabular-nums">
              +15–40 pts
            </div>
            <h5 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
              LCP & PageSpeed
            </h5>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Drastically improves Largest Contentful Paint (LCP), directly boosting SEO search rankings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800">
            <div className="text-emerald-600 dark:text-emerald-400 mb-2 font-mono text-2xl font-bold tabular-nums">
              97.2%
            </div>
            <h5 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
              Global Browser Support
            </h5>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Supported out of the box in Chrome, Safari (macOS & iOS), Firefox, Edge, Android, and Opera.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
