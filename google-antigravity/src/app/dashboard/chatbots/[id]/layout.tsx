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
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Customer Support Bot</h1>
      </div>

      <div className="border-b border-[var(--border)] mb-6 overflow-x-auto shrink-0">
        <nav className="flex space-x-8 min-w-max px-1">
          {tabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={clsx(
                  "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap",
                  isActive
                    ? "border-[var(--brand)] text-[var(--brand)]"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]"
                )}
              >
                <Icon size={18} weight={isActive ? "fill" : "regular"} />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
