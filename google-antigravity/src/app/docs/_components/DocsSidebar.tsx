'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const SECTIONS: Array<{ title: string; items: Array<{ href: string; label: string }> }> = [
  {
    title: 'Getting started',
    items: [
      { href: '/docs', label: 'Introduction' },
      { href: '/docs/quickstart', label: 'Quickstart' },
      { href: '/docs/concepts', label: 'How it works' },
    ],
  },
  {
    title: 'Knowledge sources',
    items: [
      { href: '/docs/sources/urls', label: 'URLs & sitemaps' },
      { href: '/docs/sources/files', label: 'Files (PDF, DOCX, …)' },
      { href: '/docs/sources/text', label: 'Raw text' },
      { href: '/docs/sources/sync', label: 'Auto re-sync' },
    ],
  },
  {
    title: 'Widget',
    items: [
      { href: '/docs/widget/embed', label: 'Embed snippet' },
      { href: '/docs/widget/customize', label: 'Customize appearance' },
      { href: '/docs/widget/lead-capture', label: 'Lead capture' },
      { href: '/docs/widget/security', label: 'Domain allowlist' },
    ],
  },
  {
    title: 'Improving your bot',
    items: [
      { href: '/docs/review-queue', label: 'Review queue' },
      { href: '/docs/confidence', label: 'Confidence scoring' },
      { href: '/docs/analytics', label: 'Analytics' },
      { href: '/docs/notifications', label: 'Slack notifications' },
    ],
  },
  {
    title: 'Developer',
    items: [
      { href: '/docs/api/overview', label: 'API overview' },
      { href: '/docs/api/chat', label: 'POST /v1/chat' },
      { href: '/docs/api/keys', label: 'API keys' },
      { href: '/docs/api/webhooks', label: 'Webhooks' },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/docs/billing', label: 'Plans & billing' },
      { href: '/docs/privacy', label: 'Privacy & data' },
      { href: '/docs/troubleshooting', label: 'Troubleshooting' },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-white/5 py-10 pr-6">
      <nav className="space-y-7">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        'block px-3 py-1.5 text-sm rounded-md transition-colors',
                        active
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-white/55 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
