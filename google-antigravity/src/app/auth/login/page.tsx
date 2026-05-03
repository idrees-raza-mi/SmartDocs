'use client';

import Link from 'next/link';
import { Robot, ArrowRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-white/20 selection:text-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px]"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity">
            <Robot size={32} weight="duotone" />
            SmartDocs
          </Link>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-sm text-white/50 mb-8">Sign in to your account to manage your chatbots.</p>

          <form className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Email address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">Password</label>
                <Link href="#" className="text-xs text-white/40 hover:text-white transition-colors">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 bg-white/[0.02] text-white placeholder-white/20 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
            <button className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors mt-4 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Sign in <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-white/40">
            Don't have an account? <Link href="/auth/signup" className="text-white font-semibold hover:underline ml-1">Sign up</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
