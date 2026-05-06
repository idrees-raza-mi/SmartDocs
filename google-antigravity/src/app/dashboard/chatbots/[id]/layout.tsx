'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { FileText, Users, ChartLineUp, Code, GearSix } from '@phosphor-icons/react';

export default function ChatbotDetailLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const pathname = usePathname();
  const baseUrl = `/dashboard/chatbots/${params.id}`;

  const tabs = [
    { name: 'Sources', href: baseUrl, icon: FileText, exact: true },
    { name: 'Conversations', href: `${baseUrl}/conversations`, icon: Users },
    { name: 'Analytics', href: `${baseUrl}/analytics`, icon: ChartLineUp },
    { name: 'Embed', href: `${baseUrl}/embed`, icon: Code },
    { name: 'Settings', href: `${baseUrl}/settings`, icon: GearSix },
  ];

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
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={clsx(
                  "flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap",
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-white/40 hover:text-white/70 hover:border-white/20"
                )}
              >
                <Icon size={16} weight={isActive ? "fill" : "regular"} />
                {tab.name}
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
