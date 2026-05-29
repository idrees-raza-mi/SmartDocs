import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export const metadata = { title: 'Terms of Service — DocWise' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="h-16 border-b border-white/5 flex items-center px-6">
        <Link href="/"><Logo size="sm" /></Link>
      </nav>
      <article className="max-w-3xl mx-auto py-16 px-6 prose prose-invert prose-headings:tracking-tight prose-headings:text-white prose-p:text-white/70">
        <h1>Terms of Service</h1>
        <p className="text-white/40">Last updated: today</p>

        <h2>Acceptable use</h2>
        <p>You agree not to use DocWise to host content that is illegal, harmful, deceptive, or violates intellectual property rights.</p>

        <h2>Your data</h2>
        <p>You retain full ownership of all knowledge content you upload. We obtain a limited license to store and serve it as needed to provide the service.</p>

        <h2>Service availability</h2>
        <p>We aim for 99.9% uptime. Business-plan customers receive an explicit SLA. We may schedule maintenance with prior notice.</p>

        <h2>Billing</h2>
        <p>Subscriptions are billed monthly or annually in advance. You can cancel anytime; service continues through the end of your billing period.</p>

        <h2>Termination</h2>
        <p>We may suspend or terminate accounts for breach of these terms. You can terminate yours at any time and export your data.</p>

        <h2>Contact</h2>
        <p>Legal: <a href="mailto:legal@docwise.ai" className="text-white underline">legal@docwise.ai</a></p>
      </article>
    </div>
  );
}
