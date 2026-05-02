'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Globe, ClockCounterClockwise, ChartBar, Translate, UserCirclePlus } from '@phosphor-icons/react';

const features = [
  {
    title: 'Answers from YOUR docs only',
    description: 'No hallucinations. The AI only answers using the context you provide, and clearly cites its sources for every response.',
    icon: ShieldCheck,
  },
  {
    title: 'Works on any website',
    description: 'Whether you use Shopify, WordPress, Webflow, or raw HTML, our shadow-DOM widget integrates perfectly without breaking your styles.',
    icon: Globe,
  },
  {
    title: 'Full conversation history',
    description: 'See every question your customers are asking. Read full transcripts to understand what your users truly care about.',
    icon: ClockCounterClockwise,
  },
  {
    title: 'Unanswered questions dashboard',
    description: 'Instantly know exactly what your documentation is missing. Fill content gaps to continually improve the AI.',
    icon: ChartBar,
  },
  {
    title: 'Multi-language support',
    description: 'Automatically responds in the language the user types in, translating your documentation context on the fly.',
    icon: Translate,
  },
  {
    title: 'Human escalation',
    description: 'Smoothly hands off to human agents when the bot isn\'t sure, collecting customer emails for follow-up.',
    icon: UserCirclePlus,
  }
];

export const Features = () => {
  return (
    <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block mb-4 px-3 py-1 rounded-full bg-[var(--brand-light)] text-[var(--brand)] text-sm font-bold uppercase tracking-wider"
        >
          Everything you need
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-6 tracking-tight"
        >
          Professional support, automated.
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto"
        >
          We've built all the features you need to deliver an enterprise-grade AI chat experience to your users, right out of the box.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[var(--brand-light)] group-hover:text-[var(--brand)] transition-all duration-300">
                <Icon size={28} weight="duotone" className="text-[var(--text-secondary)] group-hover:text-[var(--brand)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
