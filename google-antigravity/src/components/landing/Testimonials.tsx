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
    <section className="py-32 px-6 sm:px-12 bg-black border-b border-white/5 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="py-4">
            <div className="text-5xl font-bold text-white tracking-tighter mb-2">2M+</div>
            <div className="text-white/40 font-medium uppercase tracking-wider text-xs">Messages Handled</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="py-4">
            <div className="text-5xl font-bold text-white tracking-tighter mb-2">500+</div>
            <div className="text-white/40 font-medium uppercase tracking-wider text-xs">Businesses Trusted</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="py-4">
            <div className="text-5xl font-bold text-white tracking-tighter mb-2">98%</div>
            <div className="text-white/40 font-medium uppercase tracking-wider text-xs">Satisfaction Rate</div>
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
              className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/10 relative hover:border-white/20 transition-colors"
            >
              <div className="text-6xl text-white/5 absolute top-4 right-6 font-serif">"</div>
              <p className="text-white/80 text-lg mb-10 relative z-10 leading-relaxed font-medium tracking-tight">"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-white/10" />
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-white/40">{t.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
