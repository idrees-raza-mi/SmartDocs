'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlass, Microphone, Camera } from '@phosphor-icons/react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { useGravityStore } from '@/hooks/useGravityStore';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const enableAntigravity = useGravityStore((state) => state.enableAntigravity);

  useEffect(() => {
    if (query.toLowerCase() === 'antigravity') {
      enableAntigravity();
      setQuery('');
    }
  }, [query, enableAntigravity]);

  return (
    <div className="flex justify-center w-full max-w-[584px] mx-auto px-4 sm:px-0">
      <div 
        className={`flex items-center w-full h-[44px] sm:h-[48px] rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-4 transition-all duration-200
          ${isFocused ? 'border-transparent shadow-[0_1px_6px_rgba(32,33,36,0.28)] dark:shadow-[0_1px_6px_rgba(255,255,255,0.1)]' : 'hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] dark:hover:shadow-[0_1px_6px_rgba(255,255,255,0.1)]'}`}
      >
        <MotionWrapper id="search-icon-left" type="search" className="flex items-center text-[var(--text-secondary)]">
          <MagnifyingGlass size={20} weight="bold" />
        </MotionWrapper>
        
        <MotionWrapper id="search-input" type="search" className="flex-1 mx-2 h-full flex items-center">
          <input
            type="text"
            className="w-full bg-transparent outline-none text-[16px] text-[var(--text-primary)] font-product-sans font-normal"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label="Google Search"
            placeholder="Search Google or type a URL"
          />
        </MotionWrapper>

        <MotionWrapper id="search-icons-right" type="search" className="flex items-center gap-2 pr-[12px]">
          <button aria-label="Search by voice" className="text-[#4285F4]">
            <Microphone size={20} weight="fill" />
          </button>
          <button aria-label="Search by image" className="text-[#4285F4]">
            <Camera size={20} weight="fill" />
          </button>
        </MotionWrapper>
      </div>
    </div>
  );
};
