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
    <header className="h-16 bg-[#000000] border-b border-white/5 flex items-center justify-between px-8 shrink-0">
      <h1 className="text-xl font-bold text-white tracking-tight">
        {getTitle()}
      </h1>
      
      <div className="flex items-center gap-6">
        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider rounded-full">
          Pro Plan
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
          <img src="https://i.pravatar.cc/100?img=33" alt="User" />
        </div>
      </div>
    </header>
  );
};
