'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartBar, ChatCircleDots, Users, GearSix, Lightning, Code, ClipboardText, Question } from '@phosphor-icons/react';
import { Logo } from '@/components/ui/Logo';
import clsx from 'clsx';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: ChartBar, exact: true },
  { name: 'Chatbots', href: '/dashboard/chatbots', icon: ChatCircleDots },
  { name: 'Conversations', href: '/dashboard/conversations', icon: Users },
  { name: 'Review Queue', href: '/dashboard/review', icon: Question },
  { name: 'Developer', href: '/dashboard/developer', icon: Code },
  { name: 'Audit Log', href: '/dashboard/audit', icon: ClipboardText },
  { name: 'Billing', href: '/dashboard/billing', icon: Lightning },
  { name: 'Settings', href: '/dashboard/settings', icon: GearSix },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden sm:flex flex-col w-[240px] bg-[#0a0a0a] border-r border-white/5 shrink-0">
      <div className="h-16 flex items-center px-5 border-b border-white/5">
        <Logo size="sm" />
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon size={18} weight={isActive ? 'fill' : 'regular'} className="shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 text-[10px] text-white/30 uppercase tracking-wider text-center">
        v1.0 · Press <kbd className="px-1 py-0.5 bg-white/10 rounded">?</kbd> for shortcuts
      </div>
    </aside>
  );
};
