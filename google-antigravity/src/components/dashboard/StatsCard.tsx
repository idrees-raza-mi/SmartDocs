'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: ReactNode;
}

export const StatsCard = ({ title, value, trend, icon }: StatsCardProps) => {
  return (
    <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-sm hover:border-white/10 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/50 tracking-wide">{title}</h3>
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-4xl font-bold text-white tracking-tighter">{value}</div>
        {trend !== undefined && (
          <div className={clsx(
            "flex items-center text-xs font-bold px-2 py-1 rounded",
            trend > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  );
};
