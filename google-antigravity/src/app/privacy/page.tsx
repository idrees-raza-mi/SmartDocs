import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export const metadata = { title: 'Privacy Policy — SmartDocs' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="h-16 border-b border-white/5 flex items-center px-6">
        <Link href="/"><Logo size="sm" /></Link>
      </nav>
      <article className="max-w-3xl mx-auto py-16 px-6 prose prose-invert prose-headings:tracking-tight prose-headings:text-white prose-p:text-white/70">
        <h1>Privacy Policy</h1>
        <p className="text-white/40">Last updated: today</p>

        <h2>What we collect</h2>
        <ul>
          <li>Your account email and the name you provide</li>
          <li>Knowledge content you upload (documents, URLs, text)</li>
          <li>Conversations between visitors and your chatbots</li>
          <li>Basic technical metadata (IP, user agent) for security</li>
        </ul>

        <h2>What we don&apos;t do</h2>
        <ul>
          <li>We never train language models on your content</li>
          <li>We never sell your data</li>
          <li>We never read your conversations except to debug at your request</li>
        </ul>

        <h2>Subprocessors</h2>
        <p>Supabase (data storage), OpenAI (LLM inference), Stripe (billing), Resend (email), Vercel (hosting).</p>

        <h2>Your rights</h2>
        <p>You can export or delete all your data at any time from <Link href="/dashboard/profile" className="text-white underline">/dashboard/profile</Link>. GDPR and CCPA requests are honored within 30 days.</p>

        <h2>Contact</h2>
        <p>Privacy questions: <a href="mailto:privacy@smartdocs.ai" className="text-white underline">privacy@smartdocs.ai</a></p>
      </article>
    </div>
  );
}
