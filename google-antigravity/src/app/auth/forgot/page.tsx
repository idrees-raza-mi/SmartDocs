'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/reset`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[400px]">
        <div className="flex justify-center mb-10">
          <Link href="/"><Logo size="md" /></Link>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Reset your password</h1>
          <p className="text-sm text-white/40 mb-8">We&apos;ll email you a link to set a new password.</p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
              <WarningCircle size={18} weight="fill" /> {error}
            </div>
          )}

          {sent ? (
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg flex flex-col items-center text-center">
              <CheckCircle size={40} weight="fill" className="text-green-400 mb-3" />
              <h3 className="text-white font-bold mb-1">Check your inbox</h3>
              <p className="text-sm text-white/60">If an account exists for {email}, a reset link is on the way.</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/40 bg-white/[0.02] text-white placeholder-white/20 text-sm"
                  placeholder="name@company.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send reset link'}
                {!loading && <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-white/40">
            <Link href="/auth/login" className="text-white hover:underline">← Back to sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
