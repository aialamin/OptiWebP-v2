import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      {/* Precision Geometric Emblem */}
      <div className={`relative ${iconDimensions} rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-200 flex items-center justify-center p-1.5 shadow-xs transition-transform group-hover:scale-105`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Hexagonal aperture outline */}
          <polygon
            points="16,3 28,10 28,22 16,29 4,22 4,10"
            className="stroke-emerald-500 dark:stroke-emerald-600"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Internal facets */}
          <polygon
            points="16,3 28,10 16,16"
            className="fill-emerald-400/20 dark:fill-emerald-600/30"
          />
          <polygon
            points="28,10 28,22 16,16"
            className="fill-emerald-500/30 dark:fill-emerald-700/40"
          />
          <polygon
            points="28,22 16,29 16,16"
            className="fill-emerald-400/20 dark:fill-emerald-600/30"
          />
          <polygon
            points="16,29 4,22 16,16"
            className="fill-emerald-500/40 dark:fill-emerald-700/50"
          />
          {/* Stylized 'W' central focal vector */}
          <path
            d="M9 12 L13 21 L16 14 L19 21 L23 12"
            className="stroke-white dark:stroke-neutral-900"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-neutral-900 dark:text-white ${textSizes}`}>
              OptiWebP
            </span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              v2.4
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono tracking-tight mt-0.5">
            WEB3 · LOSSLESS & SPEED
          </span>
        </div>
      )}
    </div>
  );
};
