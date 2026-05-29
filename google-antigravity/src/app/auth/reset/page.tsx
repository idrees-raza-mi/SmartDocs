'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase delivers the recovery session via hash fragment; the SDK picks it up automatically.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    // Also catch the case where the listener fires before we attach.
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password.');
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
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Set a new password</h1>
          <p className="text-sm text-white/40 mb-8">Enter and confirm your new password below.</p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
              <WarningCircle size={18} weight="fill" /> {error}
            </div>
          )}

          {done ? (
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg flex flex-col items-center text-center">
              <CheckCircle size={40} weight="fill" className="text-green-400 mb-3" />
              <h3 className="text-white font-bold mb-1">Password updated</h3>
              <p className="text-sm text-white/60">Redirecting to the dashboard…</p>
            </div>
          ) : !ready ? (
            <div className="text-center text-white/60 text-sm py-6">
              Waiting for recovery session… If you opened this page directly, please use the reset link from your email.
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">New password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/40 bg-white/[0.02] text-white placeholder-white/20 text-sm"
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Confirm password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/40 bg-white/[0.02] text-white placeholder-white/20 text-sm"
                  placeholder="Re-enter password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? 'Updating…' : 'Update password'}
                {!loading && <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
