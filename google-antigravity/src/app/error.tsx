'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { WarningCircle } from '@phosphor-icons/react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app:error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-red-500/30 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <WarningCircle size={24} weight="fill" className="text-red-400" />
          <h1 className="text-xl font-bold tracking-tight">Something went wrong</h1>
        </div>
        <p className="text-sm text-white/60 mb-6">
          An unexpected error happened. We&apos;ve logged it. You can try again, or head back to the dashboard.
        </p>
        {error.digest && (
          <div className="text-xs font-mono text-white/30 mb-6">Reference: {error.digest}</div>
        )}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm font-bold transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
