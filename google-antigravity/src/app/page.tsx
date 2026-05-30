import { Logo } from '@/components/ui/Logo';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/landing/Footer';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { Comparison } from '@/components/landing/Comparison';
import { FAQ } from '@/components/landing/FAQ';
import Script from 'next/script';
import Link from 'next/link';

// Read at build time. When NEXT_PUBLIC_DEMO_CHATBOT_ID is set, the DocWise
// widget loads on the landing page itself so visitors can interrogate the
// product before signing up. Powerful conversion lever.
const DEMO_BOT_ID = process.env.NEXT_PUBLIC_DEMO_CHATBOT_ID;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-white/20 selection:text-white">
      <nav className="fixed top-0 left-0 right-0 h-20 bg-black/60 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6 sm:px-12">
        <Link href="/"><Logo size="sm" /></Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm font-medium text-white/60 hover:text-white transition-colors">How it works</Link>
          <Link href="#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Pricing</Link>
          <Link href="/docs" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Docs</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="hidden sm:block text-sm font-medium text-white/60 hover:text-white transition-colors">Log in</Link>
          <Link href="/auth/signup" className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-gray-200 transition-all active:scale-95">
            Get started free
          </Link>
        </div>
      </nav>
      <main>
        <Hero />
        <TrustStrip />
        <div id="how-it-works"><HowItWorks /></div>
        <div id="features"><Features /></div>
        <Comparison />
        <Testimonials />
        <PricingSection />
        <div id="faq"><FAQ /></div>
      </main>
      <Footer />

      {DEMO_BOT_ID && (
        <Script
          src="/widget.js"
          data-chatbot-id={DEMO_BOT_ID}
          strategy="lazyOnload"
        />
      )}
    </div>
  );
}
