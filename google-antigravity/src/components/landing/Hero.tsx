'use client';

import { Lightning, Robot, ChatCircleDots } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export const Hero = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative pt-40 pb-32 px-6 sm:px-12 flex flex-col items-center text-center overflow-hidden min-h-screen justify-center border-b border-[var(--border)]">
      <div className="absolute inset-0 w-full h-full bg-black -z-20"></div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-12 backdrop-blur-md text-white/70"
      >
        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        SmartDocs 2.0 is now live
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
        className="text-[60px] sm:text-[96px] leading-[1.0] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 max-w-5xl tracking-tighter mb-8"
      >
        Automate your support. <br className="hidden sm:block" />
        Zero configuration.
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        className="text-[20px] text-white/50 max-w-2xl mb-12 font-medium leading-relaxed"
      >
        Upload your knowledge base. Get a hyper-intelligent AI agent in seconds. Embed it anywhere with one line of code.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto"
      >
        <Link href="/auth/signup" className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-lg font-bold transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 text-lg">
          Start building free <span className="font-normal text-gray-500">→</span>
        </Link>
        <button className="px-8 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-lg font-bold transition-all text-lg backdrop-blur-sm">
          View Documentation
        </button>
      </motion.div>

      {mounted && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl relative perspective-1000"
        >
          <div className="absolute inset-x-20 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-sm"></div>
          <div className="absolute inset-x-20 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"></div>
          
          <div className="bg-[#0a0a0a] rounded-t-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col mx-auto w-full h-[450px] transform-gpu" style={{ transform: "rotateX(10deg) scale(0.95)" }}>
            
            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-white/[0.02]">
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="ml-4 px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/40 font-mono">dashboard.smartdocs.ai</div>
            </div>
            
            <div className="flex-1 flex">
              <div className="w-64 border-r border-white/5 bg-white/[0.01] p-4 flex flex-col gap-2">
                <div className="h-8 bg-white/5 rounded-md w-full animate-pulse"></div>
                <div className="h-8 bg-white/5 rounded-md w-3/4 animate-pulse"></div>
                <div className="h-8 bg-white/5 rounded-md w-5/6 animate-pulse"></div>
              </div>
              <div className="flex-1 p-8 flex flex-col gap-6">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <div>
                    <div className="text-xl text-white font-semibold mb-1">Knowledge Sources</div>
                    <div className="text-sm text-white/40">Sync your external data</div>
                  </div>
                  <div className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-md">Add Source</div>
                </div>
                
                <div className="border border-white/10 rounded-lg bg-white/[0.02] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-white/50 font-bold text-xs">PDF</div>
                    <div>
                      <div className="text-white text-sm font-medium">company_handbook.pdf</div>
                      <div className="text-white/40 text-xs">Indexed • 422 chunks</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">Active</div>
                </div>
                
                <div className="border border-white/10 rounded-lg bg-white/[0.02] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-white/50 font-bold text-xs">URL</div>
                    <div>
                      <div className="text-white text-sm font-medium">https://api.stripe.com/docs</div>
                      <div className="text-white/40 text-xs">Syncing...</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20 animate-pulse">Processing</div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
};
