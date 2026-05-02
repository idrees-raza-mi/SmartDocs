'use client';

import { TopNav } from '@/components/Nav/TopNav';
import { GoogleLogo } from '@/components/Logo/GoogleLogo';
import { SearchBar } from '@/components/Search/SearchBar';
import { SearchButtons } from '@/components/Search/SearchButtons';
import { LanguageSelector } from '@/components/Search/LanguageSelector';
import { BottomFooter } from '@/components/Footer/BottomFooter';
import { AntigravityOverlay } from '@/components/Antigravity/AntigravityOverlay';
import { EasterEggTrigger } from '@/components/Antigravity/EasterEggTrigger';
import { useAntigravity } from '@/components/Search/useAntigravity';

export const HomeContent = () => {
  useAntigravity();

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-transparent">
      <TopNav />
      
      <div className="flex-1 flex flex-col items-center pt-[120px]">
        <GoogleLogo />
        <SearchBar />
        <SearchButtons />
        <LanguageSelector />
      </div>

      <BottomFooter />
      
      <AntigravityOverlay />
      <EasterEggTrigger />
    </main>
  );
};
