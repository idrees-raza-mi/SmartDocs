'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CaretDown, SignOut, User, CreditCard, Gear, MagnifyingGlass } from '@phosphor-icons/react';
import clsx from 'clsx';

type Profile = {
  fullName: string | null;
  avatarUrl: string | null;
  email: string;
  initials: string;
};

export const TopBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [plan, setPlan] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState<string>('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: org }, { data: pf }] = await Promise.all([
        supabase.from('organizations').select('plan, trial_ends_at').eq('user_id', user.id).single(),
        supabase.from('profiles').select('full_name, avatar_url').eq('user_id', user.id).maybeSingle(),
      ]);

      if (org) {
        setPlan(org.plan);
        if (org.plan === 'trial' && org.trial_ends_at) {
          const diff = Math.ceil((new Date(org.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          setDaysLeft(diff > 0 ? `${diff}d left` : 'Expired');
        }
      }

      const name = pf?.full_name ?? user.user_metadata?.company_name ?? null;
      const initials = (name || user.email || '?')
        .split(/\s+|@/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s: string) => s[0].toUpperCase())
        .join('');

      setProfile({
        fullName: name,
        avatarUrl: pf?.avatar_url ?? null,
        email: user.email ?? '',
        initials,
      });
    })();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  const getTitle = () => {
    if (pathname === '/dashboard') return 'Overview';
    if (pathname.startsWith('/dashboard/profile')) return 'Account';
    const segments = pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (last === 'new') return 'Create Chatbot';
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const planName = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : '';
  const isTrial = plan === 'trial';

  return (
    <header className="h-16 bg-[var(--background)] border-b border-white/5 flex items-center justify-between px-6 sm:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors"
          onClick={() => {
            const ev = new CustomEvent('dw:open-search');
            window.dispatchEvent(ev);
          }}
          aria-label="Open search"
        >
          <MagnifyingGlass size={14} />
          <span>Search</span>
          <kbd className="hidden lg:inline-block ml-2 px-1.5 py-0.5 text-[10px] bg-white/10 rounded font-mono">/</kbd>
        </button>

        <ThemeToggle />

        <Link
          href="/dashboard/billing"
          className={clsx(
            'px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border transition-colors',
            isTrial
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              : 'bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20'
          )}
        >
          {isTrial ? `Trial${daysLeft ? ` · ${daysLeft}` : ''}` : planName}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 hover:bg-white/5 rounded-lg p-1 pr-2 transition-colors"
            aria-label="Profile menu"
          >
            <Avatar profile={profile} />
            <CaretDown size={12} className="text-white/40" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-3 border-b border-white/5">
                <div className="text-sm font-bold text-white truncate">{profile?.fullName || 'Account'}</div>
                <div className="text-xs text-white/40 truncate">{profile?.email}</div>
              </div>
              <div className="py-1">
                <DropdownLink href="/dashboard/profile" icon={<User size={14} />} label="Profile" />
                <DropdownLink href="/dashboard/billing" icon={<CreditCard size={14} />} label="Billing & Plan" />
                <DropdownLink href="/dashboard/settings" icon={<Gear size={14} />} label="Settings" />
              </div>
              <div className="py-1 border-t border-white/5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <SignOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

function Avatar({ profile }: { profile: Profile | null }) {
  if (profile?.avatarUrl) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center text-[11px] font-bold text-white">
      {profile?.initials || '?'}
    </div>
  );
}

function DropdownLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
