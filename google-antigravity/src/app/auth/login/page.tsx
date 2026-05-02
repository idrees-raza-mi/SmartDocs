'use client';

import Link from 'next/link';
import { Robot } from '@phosphor-icons/react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 text-[var(--brand)] font-bold text-xl mb-8">
        <Robot size={32} weight="bold" />
        SmartDocs
      </Link>

      <div className="w-full max-w-md bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">Welcome back</h1>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-8">Sign in to manage your chatbots.</p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email address</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-transparent"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-transparent"
              placeholder="••••••••"
            />
          </div>
          <button className="w-full py-2.5 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand-hover)] transition-colors mt-2">
            Sign in
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Don't have an account? <Link href="/auth/signup" className="text-[var(--brand)] hover:underline font-medium">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
