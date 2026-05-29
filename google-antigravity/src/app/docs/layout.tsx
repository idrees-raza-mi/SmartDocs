import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { DocsSidebar } from './_components/DocsSidebar';

export const metadata = {
  title: 'Documentation — DocWise',
  description: 'Complete guide to building, embedding, and managing AI chatbots with DocWise.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/"><Logo size="sm" /></Link>
          <span className="text-xs text-white/30 font-mono uppercase tracking-wider">Docs</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Home</Link>
          <Link href="/pricing" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Pricing</Link>
          <Link href="/auth/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Log in</Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Start free
          </Link>
        </div>
      </nav>

      <div className="pt-16 max-w-7xl mx-auto flex">
        <DocsSidebar />
        <main className="flex-1 min-w-0 px-6 sm:px-10 py-10 lg:py-12">
          <div className="max-w-3xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
