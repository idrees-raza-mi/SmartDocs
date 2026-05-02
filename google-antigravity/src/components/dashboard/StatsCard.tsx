'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';
import { ArrowRight } from '@phosphor-icons/react';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: ReactNode;
}

export const StatsCard = ({ title, value, trend, icon }: StatsCardProps) => {
  return (
    <div className="bg-white dark:bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm hover:-translate-y-1 transition-transform duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
        <div className="text-[var(--text-muted)]">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-[var(--text-primary)]">{value}</div>
        {trend !== undefined && (
          <div className={clsx(
            "flex items-center text-xs font-medium",
            trend > 0 ? "text-[var(--success)]" : "text-[var(--error)]"
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  );
};
