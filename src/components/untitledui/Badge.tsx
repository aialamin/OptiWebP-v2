import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'brand' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  dot = false,
  className = '',
  icon,
}) => {
  const variantStyles = {
    gray: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
    brand: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60',
    error: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60',
  };

  const dotStyles = {
    gray: 'bg-neutral-400 dark:bg-neutral-500',
    brand: 'bg-emerald-500 dark:bg-emerald-400',
    success: 'bg-emerald-500 dark:bg-emerald-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
    error: 'bg-rose-500 dark:bg-rose-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] py-0.5 px-2 gap-1.5',
    md: 'text-xs py-1 px-2.5 gap-1.5',
    lg: 'text-sm py-1.5 px-3 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-normal select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
