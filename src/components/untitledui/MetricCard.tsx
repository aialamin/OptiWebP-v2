import React from 'react';
import { Badge } from './Badge';
import { SpotlightCard } from '../animations/SpotlightCard';

export interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon,
  className = '',
}) => {
  return (
    <SpotlightCard
      spotlightColor="rgba(16, 185, 129, 0.08)"
      className={`p-5 bg-white dark:bg-[#11141b] rounded-2xl border border-neutral-200 dark:border-neutral-800 transition-colors shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
        {icon && <span className="text-neutral-400 dark:text-neutral-500">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2.5">
        <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white tabular-nums">
          {value}
        </div>
        {change && (
          <Badge
            size="sm"
            variant={changeType === 'positive' ? 'success' : changeType === 'negative' ? 'error' : 'gray'}
          >
            {change}
          </Badge>
        )}
      </div>

      {subtitle && (
        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1.5 truncate">
          {subtitle}
        </div>
      )}
    </SpotlightCard>
  );
};
