'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { Logo } from '@/components/ui/Logo';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'starter';
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Trial-abuse check: if this email previously had an account, surface
      // a clear message and require the user to start on a paid plan.
      const precheckRes = await fetch('/api/auth/signup-precheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (precheckRes.ok) {
        const precheck = await precheckRes.json();
        if (precheck.allowed === false) {
          throw new Error(
            precheck.message ||
              'This email is not eligible for a free trial. Please choose a paid plan to continue.'
          );
        }
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
            selected_plan: selectedPlan,
          }
        }
      });

      if (signUpError) throw signUpError;

      // Send welcome email in background
      if (signUpData?.session?.access_token) {
        fetch('/api/emails/welcome', {
          headers: { 'Authorization': `Bearer ${signUpData.session.access_token}` },
        }).catch(() => {});
      }
      
      setSuccess(true);
      router.push('/dashboard/chatbots/new');

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row selection:bg-white/20 selection:text-white">
      
      {/* Left Panel */}
      <div className="hidden md:flex flex-1 flex-col justify-center px-12 lg:px-24 relative h-screen bg-[#050505] border-r border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.05)_0%,transparent_60%)]"></div>
        
        <Link href="/" className="absolute top-8 left-12 lg:left-24 z-10">
          <Logo size="sm" />
        </Link>

        <div className="relative z-10 max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white tracking-tighter mb-6 leading-tight"
          >
            Turn your knowledge base into a wise AI agent.
          </motion.h2>
          
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-5 mb-12"
          >
            {[
              'Train AI on your docs, URLs, or PDFs instantly.',
              'Embed anywhere with a single script tag.',
              'Strict grounding — no hallucinations, ever.',
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-4 text-white/60">
                <CheckCircle weight="fill" className="text-white shrink-0" size={22} />
                <span className="font-medium text-lg tracking-tight">{text}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex -space-x-3"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <img key={i} className="w-10 h-10 rounded-full border-2 border-[#050505]" src={`https://i.pravatar.cc/100?img=${i * 3}`} alt="User" />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-[#050505] bg-white/10 flex items-center justify-center text-xs text-white font-bold">
              +1k
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-white/30 mt-4 font-medium">
            Trusted by 1,000+ businesses worldwide.
          </motion.p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <Link href="/" className="md:hidden mb-10">
          <Logo size="md" />
        </Link>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Create your account</h1>
            <p className="text-sm text-white/40 mb-8">No credit card required. Cancel anytime.</p>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                <WarningCircle size={18} weight="fill" />
                {error}
              </div>
            )}

            {success ? (
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg flex flex-col items-center text-center">
                <CheckCircle size={48} weight="fill" className="text-green-400 mb-4" />
                <h3 className="text-white font-bold text-lg mb-1">Account Created!</h3>
                <p className="text-sm text-white/60">Taking you to the dashboard...</p>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSignup}>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/40 focus:border-white/40 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm"
                    placeholder="Acme Inc."
                  />
                </div>
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
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/40 focus:border-white/40 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors mt-2 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create free account'}
                  {!loading && <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            )}

            <p className="mt-5 text-center text-xs text-white/30 leading-relaxed">
              By creating an account you agree to our{' '}
              <Link href="#" className="text-white/50 hover:text-white underline">Terms</Link> and{' '}
              <Link href="#" className="text-white/50 hover:text-white underline">Privacy Policy</Link>.
            </p>

            <div className="mt-6 text-center text-sm text-white/40">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-white font-semibold hover:underline transition-colors ml-1">Sign in</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
