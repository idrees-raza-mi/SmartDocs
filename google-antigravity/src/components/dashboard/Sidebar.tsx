'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartBar, ChatCircleDots, Users, GearSix, Lightning, SignOut, Robot } from '@phosphor-icons/react';
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={clsx(
      "hidden sm:flex flex-col bg-white dark:bg-[var(--surface)] border-r border-[var(--border)] transition-all duration-300",
      collapsed ? "w-[64px]" : "w-[240px]"
    )}>
      <div className="h-16 flex items-center px-4 border-b border-[var(--border)]">
        <Robot size={28} weight="bold" className="text-[var(--brand)] shrink-0" />
        {!collapsed && <span className="ml-2 font-bold text-lg text-[var(--text-primary)] truncate">SmartDocs</span>}
      </div>

      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                isActive 
                  ? "bg-[var(--brand)] text-white" 
                  : "text-[var(--text-secondary)] hover:bg-[var(--brand-light)] hover:text-[var(--brand)] dark:hover:bg-white/5"
              )}
            >
              <Icon size={20} weight={isActive ? "fill" : "bold"} className="shrink-0" />
              {!collapsed && <span className="font-medium text-sm truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--border)]">
        <button className="flex items-center gap-3 w-full px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10">
          <SignOut size={20} weight="bold" className="shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
