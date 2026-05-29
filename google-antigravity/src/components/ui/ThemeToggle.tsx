'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Desktop } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

type Variant = 'icon' | 'segmented';

export function ThemeToggle({ variant = 'icon' }: { variant?: Variant }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes hydrates on the client; render a placeholder on the server.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" aria-hidden />;

  if (variant === 'segmented') {
    const opts: Array<{ k: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }> = [
      { k: 'light', icon: <Sun size={14} weight="bold" />, label: 'Light' },
      { k: 'dark', icon: <Moon size={14} weight="bold" />, label: 'Dark' },
      { k: 'system', icon: <Desktop size={14} weight="bold" />, label: 'System' },
    ];
    return (
      <div className="inline-flex items-center rounded-lg border border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 p-0.5">
        {opts.map((o) => (
          <button
            key={o.k}
            onClick={() => setTheme(o.k)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              theme === o.k
                ? 'bg-white text-black shadow-sm'
                : 'text-white/60 hover:text-white'
            )}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    );
  }

  const next = resolvedTheme === 'dark' ? 'light' : 'dark';
  return (
    <button
      onClick={() => setTheme(next)}
      className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {resolvedTheme === 'dark' ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
    </button>
  );
}
