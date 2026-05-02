import { Robot } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-2xl mb-4 tracking-tight">
            <Robot size={32} weight="duotone" />
            SmartDocs
          </Link>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">
            Train an AI on your docs in 5 minutes. Embed it on your site with one line of code. Support at scale.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-white mb-6">Product</h4>
          <ul className="space-y-4">
            <li><Link href="#features" className="text-white/50 hover:text-white transition-colors text-sm">Features</Link></li>
            <li><Link href="/pricing" className="text-white/50 hover:text-white transition-colors text-sm">Pricing</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Showcase</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Changelog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6">Company</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">About</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Blog</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Careers</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6">Legal</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
            <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">DPA</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-white/30">
        <div>© {new Date().getFullYear()} SmartDocs AI Inc. All rights reserved.</div>
        <div className="mt-4 md:mt-0 flex items-center gap-1">
          Designed in California.
        </div>
      </div>
    </footer>
  );
};
