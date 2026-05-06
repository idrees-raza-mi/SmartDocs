import { Logo } from '@/components/ui/Logo';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/landing/Footer';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-white/20 selection:text-white">
      <nav className="fixed top-0 left-0 right-0 h-20 bg-black/60 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6 sm:px-12">
        <Link href="/"><Logo size="sm" /></Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm font-medium text-white/60 hover:text-white transition-colors">How it works</Link>
          <Link href="#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Pricing</Link>
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
        <div id="how-it-works"><HowItWorks /></div>
        <div id="features"><Features /></div>
        <Testimonials />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
