import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-7xl font-bold tracking-tighter mb-4">404</div>
        <p className="text-white/60 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-white text-black rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
