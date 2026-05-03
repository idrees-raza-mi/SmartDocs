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
  const [collapsed] = useState(false);

  return (
    <aside className={clsx(
      "hidden sm:flex flex-col bg-[#0a0a0a] border-r border-white/5 transition-all duration-300",
      collapsed ? "w-[64px]" : "w-[240px]"
    )}>
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <Robot size={28} weight="duotone" className="text-white shrink-0" />
        {!collapsed && <span className="ml-3 font-bold text-lg text-white tracking-tight truncate">SmartDocs</span>}
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group text-sm font-medium",
                isActive 
                  ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={20} weight={isActive ? "fill" : "regular"} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <button className="flex items-center gap-3 w-full px-3 py-2 text-white/50 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 text-sm font-medium">
          <SignOut size={20} weight="regular" className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
