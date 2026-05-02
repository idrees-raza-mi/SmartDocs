'use client';

import { useGravityStore } from '@/hooks/useGravityStore';
import { Lightning } from '@phosphor-icons/react';

export const EasterEggTrigger = () => {
  const enableAntigravity = useGravityStore((state) => state.enableAntigravity);

  return (
    <button
      onClick={() => enableAntigravity()}
      className="fixed bottom-2 right-2 z-50 opacity-15 hover:opacity-100 transition-opacity p-2"
      aria-label="Toggle Antigravity"
    >
      <Lightning size={14} weight="bold" className="text-black dark:text-white" />
    </button>
  );
};
