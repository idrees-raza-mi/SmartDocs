'use client';

import { motion } from 'framer-motion';
import { UploadSimple, Robot, Code } from '@phosphor-icons/react';

const steps = [
  {
    icon: UploadSimple,
    title: 'Add your content',
    description: 'Upload PDFs, paste URLs, or write FAQs directly. We support almost any format of documentation.',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
  },
  {
    icon: Robot,
    title: 'AI trains instantly',
    description: 'We chunk, embed, and index your content in under 60 seconds using state-of-the-art vector processing.',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
  },
  {
    icon: Code,
    title: 'Embed one script tag',
    description: 'Copy one line of code. Paste it on any website. Done. Your chatbot is instantly live and ready to help.',
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-6 sm:px-12 bg-gray-50 dark:bg-[#111827]/50 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4"
          >
            How it works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[var(--text-secondary)]"
          >
            From documentation to a fully conversational AI in three simple steps.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-24 h-24 rounded-3xl ${step.color} flex items-center justify-center shadow-lg transform group-hover:-translate-y-2 transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10 rotate-3 group-hover:rotate-0`}>
                    <Icon size={48} weight="duotone" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--brand)] text-white font-bold flex items-center justify-center shadow-md border-2 border-white dark:border-[var(--background)]">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{step.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
