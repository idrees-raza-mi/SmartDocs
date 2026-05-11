'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChartBar, ChatCircleDots, Users, GearSix, Lightning, SignOut } from '@phosphor-icons/react';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import clsx from 'clsx';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: ChartBar },
  { name: 'Chatbots', href: '/dashboard/chatbots', icon: ChatCircleDots },
  { name: 'Conversations', href: '/dashboard/conversations', icon: Users },
  { name: 'Billing', href: '/dashboard/billing', icon: Lightning },
  { name: 'Settings', href: '/dashboard/settings', icon: GearSix },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <aside className="hidden sm:flex flex-col w-[240px] bg-[#0a0a0a] border-r border-white/5 shrink-0">
      <div className="h-16 flex items-center px-5 border-b border-white/5">
        <Logo size="sm" />
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} weight={isActive ? "fill" : "regular"} className="shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2.5 text-white/40 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 text-sm font-medium">
          <SignOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
