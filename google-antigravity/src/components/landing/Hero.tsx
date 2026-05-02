'use client';

import { Lightning, Robot, ChatCircleDots } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export const Hero = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative pt-32 pb-32 px-6 sm:px-12 flex flex-col items-center text-center overflow-hidden min-h-[90vh] justify-center">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-[var(--background)]">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-1000"></div>
        <div className="absolute top-40 -right-40 w-96 h-96 rounded-full bg-purple-500/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-1000 delay-500"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-[var(--border)] shadow-sm text-sm font-semibold mb-8 backdrop-blur-md"
      >
        <Lightning size={16} weight="fill" className="text-[var(--brand)]" />
        <span className="text-[var(--text-secondary)]">Trusted by <span className="text-[var(--text-primary)]">500+</span> businesses</span>
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-[56px] sm:text-[72px] leading-[1.05] font-extrabold text-[var(--text-primary)] max-w-4xl tracking-tighter mb-8"
      >
        Your docs. Your AI. <br className="hidden sm:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-purple-600">Embedded in 5 minutes.</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-[20px] text-[var(--text-secondary)] max-w-2xl mb-12 font-medium leading-relaxed"
      >
        SmartDocs trains a chatbot on your documentation and embeds it on your website. Customers get instant answers. You stop repeating yourself.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto"
      >
        <Link href="/auth/signup" className="px-8 py-4 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white rounded-xl font-bold transition-all active:scale-95 shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 text-lg">
          Start for free <span className="font-normal">→</span>
        </Link>
        <button className="px-8 py-4 bg-white dark:bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-bold transition-all active:scale-95 shadow-sm text-lg">
          See live demo
        </button>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[14px] text-[var(--text-muted)] font-medium"
      >
        No credit card required · Setup in 5 minutes · Cancel anytime
      </motion.p>

      {mounted && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
          className="mt-20 w-full max-w-3xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10"></div>
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl border border-[var(--border)] border-b-0 overflow-hidden flex flex-col relative mx-auto w-full sm:w-3/4 max-w-lg h-[400px]">
            <div className="h-16 bg-[var(--brand)] text-white flex items-center px-6 gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Robot size={24} weight="fill" />
              </div>
              <div>
                <div className="font-bold">SmartDocs Support</div>
                <div className="text-xs text-indigo-200 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div> Online
                </div>
              </div>
            </div>
            
            <div className="p-6 flex-1 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="self-start max-w-[80%] bg-white dark:bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl rounded-tl-sm text-[var(--text-primary)] shadow-sm font-medium"
              >
                Hi there! 👋 I'm trained on all our documentation. How can I help you today?
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.5 }}
                className="self-end max-w-[80%] bg-[var(--brand)] text-white p-4 rounded-2xl rounded-tr-sm shadow-md font-medium"
              >
                How do I embed the widget?
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4 }}
                className="self-start max-w-[80%] bg-white dark:bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl rounded-tl-sm text-[var(--text-primary)] shadow-sm font-medium"
              >
                It's very easy! Just copy the single script tag provided in your dashboard and paste it right before the closing <code>&lt;/body&gt;</code> tag on your website.
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
};
