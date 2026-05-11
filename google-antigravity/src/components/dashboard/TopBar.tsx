'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export const TopBar = () => {
  const pathname = usePathname();
  const [plan, setPlan] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState<string>('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('organizations').select('plan, trial_ends_at').eq('user_id', user.id).single().then(({ data }) => {
        if (data) {
          setPlan(data.plan);
          if (data.plan === 'trial' && data.trial_ends_at) {
            const diff = Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            setDaysLeft(diff > 0 ? `${diff}d left` : 'Expired');
          }
        }
      });
    });
  }, []);

  const getTitle = () => {
    if (pathname === '/dashboard') return 'Overview';
    const segments = pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (last === 'new') return 'Create Chatbot';
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  const planName = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : '';
  const isTrial = plan === 'trial';

  return (
    <header className="h-16 bg-[#000000] border-b border-white/5 flex items-center justify-between px-8 shrink-0">
      <h1 className="text-xl font-bold text-white tracking-tight">
        {getTitle()}
      </h1>
      
      <div className="flex items-center gap-6">
        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider rounded-full">
          {isTrial ? `Trial${daysLeft ? ` (${daysLeft})` : ''}` : planName}
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
          <img src="https://i.pravatar.cc/100?img=33" alt="User" />
        </div>
      </div>
    </header>
  );
};
