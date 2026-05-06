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
            <li><Link href="#features" className="text-white/50 hover:text-white transition-colors text-sm">Features</Link></li>
            <li><Link href="/pricing" className="text-white/50 hover:text-white transition-colors text-sm">Pricing</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Changelog</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Roadmap</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-widest">Company</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">About</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Blog</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Careers</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-widest">Legal</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">DPA</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-white/30">
        <div>© {new Date().getFullYear()} DocWise AI Inc. All rights reserved.</div>
        <div className="mt-4 md:mt-0">Wisdom, automated.</div>
      </div>
    </footer>
  );
};
