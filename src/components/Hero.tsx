import { ArrowDown, Download, Zap } from 'lucide-react';
import { Badge } from './untitledui/Badge';
import { ShinyText } from './animations/ShinyText';

interface HeroProps {
  onScrollToConverter: () => void;
  onScrollToPlugin: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToConverter,
  onScrollToPlugin,
}) => {
  return (
    <section className="w-full pt-8 sm:pt-14 pb-8 text-center">
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6">
        {/* Brand & WordPress Feature Badge */}
        <div className="inline-flex items-center mb-5">
          <Badge variant="brand" size="md" dot>
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
              Every WordPress Feature Built-In
            </span>
            <span className="mx-2 text-emerald-400">·</span>
            <ShinyText speed={5} className="font-semibold text-emerald-700 dark:text-emerald-300">
              Next-Gen WebP Engine
            </ShinyText>
          </Badge>
        </div>

        {/* Hero Title */}
        <h1 className="typespace-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 dark:text-white mb-4 tracking-tight text-balance">
          High-Fidelity{' '}
          <ShinyText speed={6} className="bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600 dark:from-emerald-400 dark:via-cyan-300 dark:to-emerald-400">
            WebP Converter
          </ShinyText>{' '}
          & Speed Optimizer
        </h1>

        {/* Concise Hero Description (User requested less text) */}
        <p className="typespace-subhead text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto mb-8 leading-relaxed text-balance">
          Lossless visual fidelity. 100% private in-browser compression with an official free WordPress plugin.
        </p>

        {/* Action Buttons - Modern, Simple, Clean */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
          <button
            type="button"
            onClick={onScrollToConverter}
            className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-sm hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer select-none"
          >
            <Zap className="w-4 h-4 text-white shrink-0" />
            <span>Convert Images Now</span>
            <ArrowDown className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform duration-200 ease-out shrink-0" />
          </button>

          <button
            type="button"
            onClick={onScrollToPlugin}
            className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-850 dark:hover:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-700 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 rounded-xl shadow-xs hover:shadow-sm active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer select-none"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200 ease-out shrink-0" />
            <span>Free WordPress Plugin</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>100% In-Browser Privacy</span>
          </div>
          <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Multi-Core Parallel Encoding</span>
          </div>
          <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>WordPress Plugin Included Free</span>
          </div>
        </div>
      </div>
    </section>
  );
};
