'use client';

import { usePathname } from 'next/navigation';

export const TopBar = () => {
  const pathname = usePathname();
  
  const getTitle = () => {
    if (pathname === '/dashboard') return 'Overview';
    const segments = pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (last === 'new') return 'Create Chatbot';
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  return (
    <header className="h-16 bg-white dark:bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0">
      <h1 className="text-xl font-semibold text-[var(--text-primary)]">
        {getTitle()}
      </h1>
      
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 bg-[var(--brand-light)] text-[var(--brand)] text-xs font-bold uppercase tracking-wider rounded-full">
          Pro Plan
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300"></div>
      </div>
    </header>
  );
};
