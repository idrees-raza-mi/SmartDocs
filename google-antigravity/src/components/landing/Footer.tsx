import { Robot } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#111827] border-t border-[var(--border)] pt-16 pb-8 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-[var(--brand)] font-bold text-2xl mb-4">
            <Robot size={32} weight="bold" />
            SmartDocs
          </Link>
          <p className="text-[var(--text-secondary)] text-sm max-w-xs leading-relaxed">
            Train an AI on your docs in 5 minutes. Embed it on your site with one line of code. Never answer the same support question twice.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-[var(--text-primary)] mb-4">Product</h4>
          <ul className="space-y-3">
            <li><Link href="#features" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">Features</Link></li>
            <li><Link href="/pricing" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">Pricing</Link></li>
            <li><Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">Showcase</Link></li>
            <li><Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">Changelog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-[var(--text-primary)] mb-4">Company</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">About</Link></li>
            <li><Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">Blog</Link></li>
            <li><Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">Careers</Link></li>
            <li><Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-[var(--text-primary)] mb-4">Legal</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">Privacy Policy</Link></li>
            <li><Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">Terms of Service</Link></li>
            <li><Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">Cookie Policy</Link></li>
            <li><Link href="#" className="text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors text-sm">DPA</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
        <div>© {new Date().getFullYear()} SmartDocs AI. All rights reserved.</div>
        <div className="mt-4 md:mt-0 flex items-center gap-1">
          Built with <span className="text-red-500">❤️</span> for small businesses.
        </div>
      </div>
    </footer>
  );
};
