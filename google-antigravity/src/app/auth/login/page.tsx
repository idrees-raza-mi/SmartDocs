'use client';

import Link from 'next/link';
import { ArrowRight, WarningCircle } from '@phosphor-icons/react';
import { Logo } from '@/components/ui/Logo';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-white/20 selection:text-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[400px]">
        <div className="flex justify-center mb-10">
          <Link href="/"><Logo size="md" /></Link>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-sm text-white/40 mb-8">Sign in to your DocWise account.</p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
              <WarningCircle size={18} weight="fill" />
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Email address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/40 focus:border-white/40 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm" 
                placeholder="name@company.com" 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">Password</label>
                <Link href="/auth/forgot" className="text-xs text-white/40 hover:text-white transition-colors">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/40 focus:border-white/40 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm" 
                placeholder="••••••••" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors mt-2 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-white/40">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-white font-semibold hover:underline transition-colors ml-1">Create one free</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
