'use client';

import { useEffect, useState } from 'react';
import { subscribe, dismiss, type ToastItem } from '@/lib/toast';
import { CheckCircle, WarningCircle, Info, XCircle } from '@phosphor-icons/react';
import clsx from 'clsx';

const icons = {
  success: <CheckCircle size={18} weight="fill" />,
  error: <XCircle size={18} weight="fill" />,
  warning: <WarningCircle size={18} weight="fill" />,
  info: <Info size={18} weight="fill" />,
};

const tones = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  error: 'bg-red-500/10 border-red-500/30 text-red-300',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => subscribe(setToasts), []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={clsx(
            'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg max-w-sm animate-in slide-in-from-right-2 fade-in duration-200',
            tones[t.variant]
          )}
        >
          <div className="mt-0.5">{icons[t.variant]}</div>
          <div className="text-sm font-medium flex-1">{t.message}</div>
          <button
            onClick={() => dismiss(t.id)}
            className="opacity-50 hover:opacity-100 transition-opacity text-current"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
