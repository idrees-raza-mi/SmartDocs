import { PricingSection } from '@/components/landing/PricingSection';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black">
      <nav className="h-20 bg-black/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sm:px-12">
        <Link href="/"><Logo size="sm" /></Link>
        <div className="flex items-center gap-6">
          <Link href="/auth/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Sign in</Link>
          <Link href="/auth/signup" className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Get started
          </Link>
        </div>
      </nav>
      <main>
        <PricingSection />
      </main>
    </div>
  );
}
