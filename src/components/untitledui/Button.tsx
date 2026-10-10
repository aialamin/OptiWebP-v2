import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'brand' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  iconLeading,
  iconTrailing,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-colors cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2.5 gap-2',
    lg: 'text-sm px-5 py-3 gap-2.5',
    xl: 'text-base px-6 py-3.5 gap-3',
  };

  const variantStyles = {
    primary:
      'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 shadow-xs border border-transparent',
    secondary:
      'bg-white dark:bg-[#161a24] text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-[#1e2330] shadow-xs',
    tertiary:
      'bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white border border-transparent',
    brand:
      'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-neutral-950 dark:hover:bg-emerald-400 shadow-xs border border-transparent',
    destructive:
      'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400 shadow-xs border border-transparent',
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.01 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        iconLeading && <span className="shrink-0">{iconLeading}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconTrailing && <span className="shrink-0">{iconTrailing}</span>}
    </motion.button>
  );
};
