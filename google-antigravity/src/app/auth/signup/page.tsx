'use client';

import Link from 'next/link';
import { Robot, ArrowRight, CheckCircle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row items-center justify-center p-4 md:p-0 selection:bg-white/20 selection:text-white">
      
      <div className="hidden md:flex flex-1 flex-col justify-center px-12 lg:px-24 xl:px-32 relative h-screen bg-[#050505] border-r border-white/5 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-full w-full bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03)_0%,transparent_50%)]"></div>
        <Link href="/" className="absolute top-8 left-12 lg:left-24 flex items-center gap-2 text-white font-bold text-2xl tracking-tight z-10 hover:opacity-80 transition-opacity">
          <Robot size={32} weight="duotone" />
          SmartDocs
        </Link>

        <div className="relative z-10 max-w-md">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white tracking-tighter mb-6 leading-tight"
          >
            Start automating your customer support today.
          </motion.h2>
          
          <motion.ul 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-6 mb-12"
          >
            {[
              'Train AI on your knowledge base instantly.',
              'Embed on any website with one line of code.',
              'Strict grounding—no hallucinations ever.',
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-4 text-white/60">
                <CheckCircle weight="fill" className="text-green-500 shrink-0 text-xl" />
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
              <img key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] relative z-10" src={`https://i.pravatar.cc/100?img=${i}`} alt="User" />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-[#050505] bg-white/5 flex items-center justify-center text-xs text-white font-bold relative z-0">
              +1k
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-white/40 mt-4 font-medium">
            Join over 1,000+ businesses saving time.
          </motion.p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-md md:max-w-none relative overflow-hidden">
        <Link href="/" className="md:hidden flex items-center gap-2 text-white font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity mb-8">
          <Robot size={32} weight="duotone" />
          SmartDocs
        </Link>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10 md:hidden"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Create an account</h1>
            <p className="text-sm text-white/50 mb-8">No credit card required. Cancel anytime.</p>

            <form className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Company Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm"
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Email address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
              <button className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors mt-4 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Create account <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-white/40">
              Already have an account? <Link href="/auth/login" className="text-white font-semibold hover:underline ml-1">Sign in</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
