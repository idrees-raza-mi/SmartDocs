import { PricingSection } from '@/components/landing/PricingSection';
import { Robot } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="h-16 bg-white/80 backdrop-blur-md border-b border-[var(--border)] flex items-center justify-between px-6 sm:px-12">
        <Link href="/" className="flex items-center gap-2 text-[var(--brand)] font-bold text-xl">
          <Robot size={28} weight="bold" />
          SmartDocs
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/auth/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Sign in</Link>
        </div>
      </nav>
      <main>
        <PricingSection />
      </main>
    </div>
  );
}
