import React from 'react';

interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number;
  speed?: number;
}

/**
 * React Bits Pro - ShinyText
 * Silky smooth hardware-accelerated text shimmer sweep with zero layout thrashing.
 */
export const ShinyText: React.FC<ShinyTextProps> = ({
  children,
  className = '',
  speed = 4,
}) => {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-emerald-600 to-neutral-900 dark:from-neutral-200 dark:via-emerald-400 dark:to-neutral-200 shiny-text-animation ${className}`}
      style={{
        animationDuration: `${speed}s`,
      }}
    >
      {children}
    </span>
  );
};
