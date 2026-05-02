import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/landing/Footer';
import { Robot } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-[var(--brand-light)] selection:text-[var(--brand)]">
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-[var(--border)] z-50 flex items-center justify-between px-6 sm:px-12 transition-all">
        <Link href="/" className="flex items-center gap-2 text-[var(--brand)] font-bold text-2xl tracking-tight">
          <Robot size={32} weight="bold" />
          SmartDocs
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">How it works</Link>
          <Link href="#features" className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Log in</Link>
          <Link href="/auth/signup" className="px-5 py-2.5 bg-[var(--brand)] text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-[var(--brand-hover)] hover:shadow-indigo-500/40 transition-all active:scale-95">
            Get started free
          </Link>
        </div>
      </nav>

      <main className="pt-20">
        <Hero />
        <div id="how-it-works"><HowItWorks /></div>
        <div id="features"><Features /></div>
        <Testimonials />
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}
