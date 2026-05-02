'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "SmartDocs replaced our $300/mo Intercom setup in 5 minutes. It handles 80% of our support volume flawlessly.",
    name: "Sarah Jenkins",
    company: "Founder, SaaSFlow",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    quote: "We run a small Shopify store and were drowning in 'Where is my order?' emails. This bot trained on our FAQ page solved it entirely.",
    name: "David Chen",
    company: "Owner, Elevate Gear",
    avatar: "https://i.pravatar.cc/150?img=11"
  },
  {
    quote: "The ability to see exactly what questions the AI couldn't answer is a game changer for updating our documentation.",
    name: "Elena Rodriguez",
    company: "Head of Product, MetaDev",
    avatar: "https://i.pravatar.cc/150?img=5"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 px-6 sm:px-12 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900/30 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-center divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="py-4">
            <div className="text-4xl font-extrabold text-[var(--text-primary)] mb-2">2M+</div>
            <div className="text-[var(--text-secondary)] font-medium uppercase tracking-wider text-sm">Messages Handled</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="py-4">
            <div className="text-4xl font-extrabold text-[var(--text-primary)] mb-2">500+</div>
            <div className="text-[var(--text-secondary)] font-medium uppercase tracking-wider text-sm">Businesses Trusted</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="py-4">
            <div className="text-4xl font-extrabold text-[var(--text-primary)] mb-2">98%</div>
            <div className="text-[var(--text-secondary)] font-medium uppercase tracking-wider text-sm">Satisfaction Rate</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-[var(--surface)] p-8 rounded-2xl shadow-md border border-[var(--border)] relative"
            >
              <div className="text-4xl text-[var(--brand-light)] dark:text-gray-700 absolute top-6 right-8 font-serif">"</div>
              <p className="text-[var(--text-primary)] text-lg mb-8 relative z-10 leading-relaxed font-medium">"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full ring-2 ring-[var(--brand-light)]" />
                <div>
                  <div className="font-bold text-[var(--text-primary)]">{t.name}</div>
                  <div className="text-sm text-[var(--text-secondary)]">{t.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
