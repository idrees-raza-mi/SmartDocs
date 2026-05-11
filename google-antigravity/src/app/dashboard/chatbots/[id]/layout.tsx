'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { FileText, Users, ChartLineUp, Code, GearSix } from '@phosphor-icons/react';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { usePremiumPopup } from '@/hooks/usePremiumPopup';

export default function ChatbotDetailLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const pathname = usePathname();
  const baseUrl = `/dashboard/chatbots/${params.id}`;
  const { checkAccess } = usePlanAccess();
  const { show } = usePremiumPopup();

  const tabs = [
    { name: 'Sources', href: baseUrl, icon: FileText, exact: true, premium: false },
    { name: 'Conversations', href: `${baseUrl}/conversations`, icon: Users, premium: true, feature: 'conversations' },
    { name: 'Analytics', href: `${baseUrl}/analytics`, icon: ChartLineUp, premium: true, feature: 'analytics' },
    { name: 'Embed', href: `${baseUrl}/embed`, icon: Code, premium: false },
    { name: 'Settings', href: `${baseUrl}/settings`, icon: GearSix, premium: false },
  ];

  const handleClick = (e: React.MouseEvent, tab: (typeof tabs)[0]) => {
    if (tab.premium && tab.feature) {
      const access = checkAccess(tab.feature as 'analytics')
      if (!access.allowed) {
        e.preventDefault()
        show(tab.name, access.requiredPlan)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="mb-2 pb-2 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Customer Support Bot</h1>
        <p className="text-sm text-white/40 mt-1">Manage sources, view conversations, and configure your AI agent.</p>
      </div>

      <div className="border-b border-white/5 mb-6 overflow-x-auto shrink-0">
        <nav className="flex space-x-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            const access = tab.premium && tab.feature ? checkAccess(tab.feature as 'analytics') : { allowed: true };
            return (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={(e) => handleClick(e, tab)}
                className={clsx(
                  "flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap",
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-white/40 hover:text-white/70 hover:border-white/20"
                )}
              >
                <Icon size={16} weight={isActive ? "fill" : "regular"} />
                {tab.name}
                {!access.allowed && (
                  <span className="text-xs text-amber-600/80">✦</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {children}
      </div>
    </div>
  );
}
