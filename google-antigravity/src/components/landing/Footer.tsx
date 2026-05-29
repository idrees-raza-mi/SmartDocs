import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <Link href="/"><Logo size="sm" className="mb-5" /></Link>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed mt-4">
            Train an AI on your docs in 5 minutes. Embed it on your site with one line of code. Give your customers instant wisdom.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-widest">Product</h4>
          <ul className="space-y-4">
            <li><Link href="/#features" className="text-white/50 hover:text-white transition-colors text-sm">Features</Link></li>
            <li><Link href="/pricing" className="text-white/50 hover:text-white transition-colors text-sm">Pricing</Link></li>
            <li><Link href="/docs" className="text-white/50 hover:text-white transition-colors text-sm">Documentation</Link></li>
            <li><Link href="/changelog" className="text-white/50 hover:text-white transition-colors text-sm">Changelog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-widest">Company</h4>
          <ul className="space-y-4">
            <li><Link href="/#faq" className="text-white/50 hover:text-white transition-colors text-sm">FAQ</Link></li>
            <li><a href="mailto:hello@docwise.ai" className="text-white/50 hover:text-white transition-colors text-sm">Contact</a></li>
            <li><a href="https://github.com" className="text-white/50 hover:text-white transition-colors text-sm" target="_blank" rel="noopener">GitHub</a></li>
            <li><Link href="/api/health" className="text-white/50 hover:text-white transition-colors text-sm">Status</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-widest">Legal</h4>
          <ul className="space-y-4">
            <li><Link href="/privacy" className="text-white/50 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-white/50 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-white/30">
        <div>© {new Date().getFullYear()} DocWise AI. All rights reserved.</div>
        <div className="mt-4 md:mt-0">Wisdom, automated.</div>
      </div>
    </footer>
  );
};
