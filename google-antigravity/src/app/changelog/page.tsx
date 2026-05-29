import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export const metadata = { title: 'Changelog — SmartDocs' };

const ENTRIES = [
  {
    date: 'This week',
    title: 'Self-improving knowledge base',
    body: 'Review Queue surfaces unanswered questions. Answer one, and the bot retrains automatically. Confidence scoring + Slack notifications added.',
  },
  {
    date: 'This week',
    title: 'Widget v2',
    body: 'Markdown rendering, source citations, thumbs feedback, follow-up suggestions, lead capture, GDPR consent, and animated typing indicator.',
  },
  {
    date: 'This week',
    title: 'New file formats + sitemap crawler',
    body: 'TXT, Markdown, CSV, JSON, plus drag-and-drop. Pro/Business plans can crawl entire sitemaps.',
  },
  {
    date: 'This week',
    title: 'Theme + profile + audit log',
    body: 'Light/dark theme. Full profile system with avatar, password change, data export, account deletion. Business-tier audit log.',
  },
  {
    date: 'This week',
    title: 'Developer API + webhooks',
    body: 'Programmatic chat via REST API keys. Webhook subscriptions for message events.',
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="h-16 border-b border-white/5 flex items-center px-6">
        <Link href="/"><Logo size="sm" /></Link>
      </nav>
      <article className="max-w-3xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Changelog</h1>
        <p className="text-white/40 mb-12">What&apos;s new in SmartDocs.</p>

        <div className="space-y-8">
          {ENTRIES.map((e, i) => (
            <div key={i} className="border-l-2 border-white/10 pl-6">
              <div className="text-xs uppercase tracking-wider text-white/40 font-bold mb-1">{e.date}</div>
              <h2 className="text-lg font-bold mb-2">{e.title}</h2>
              <p className="text-sm text-white/70 leading-relaxed">{e.body}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
