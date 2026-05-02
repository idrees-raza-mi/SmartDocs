'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { MotionWrapper } from './MotionWrapper';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <MotionWrapper 
      id="theme-toggle" 
      type="nav"
      as="button"
      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <Sun size={20} weight="bold" className="text-[var(--text-secondary)]" />
      ) : (
        <Moon size={20} weight="bold" className="text-[var(--text-secondary)]" />
      )}
    </MotionWrapper>
  );
};
