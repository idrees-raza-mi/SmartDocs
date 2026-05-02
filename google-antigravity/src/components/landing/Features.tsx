'use client';

import { motion } from 'framer-motion';
import { Database, Lightning, Lock, ChartBar, Code, Globe } from '@phosphor-icons/react';

const features = [
  {
    icon: Database,
    title: 'Vector Search Engine',
    desc: 'Powered by pgvector and OpenAI embeddings. Semantic search that understands intent, not just keywords.'
  },
  {
    icon: Lightning,
    title: 'Edge Streaming',
    desc: 'Responses are streamed instantly from the edge. Zero latency. Fluid user experience.'
  },
  {
    icon: Lock,
    title: 'Strict Grounding',
    desc: 'Configured to never hallucinate. If the answer isn\'t in your docs, the AI explicitly states it and routes to a human.'
  },
  {
    icon: Code,
    title: 'Headless Widget',
    desc: 'Vanilla JS, Shadow DOM wrapped widget. Drops into React, Vue, WordPress, or Webflow perfectly.'
  },
  {
    icon: ChartBar,
    title: 'Deep Analytics',
    desc: 'Track unhandled queries. Identify exactly what documentation you are missing.'
  },
  {
    icon: Globe,
    title: 'Auto-Translation',
    desc: 'Upload English docs, get support in 50+ languages automatically. No manual translation required.'
  }
];

export const Features = () => {
  return (
    <section className="py-32 px-6 sm:px-12 max-w-7xl mx-auto border-b border-white/5">
      <div className="mb-20">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Built for engineers. <br className="hidden sm:block" /><span className="text-white/40">Designed for scale.</span></h2>
        <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
          We abstracted away the complexity of building RAG pipelines. Focus on your product while we handle the vector math.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div 
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group"
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-6 group-hover:border-white/20 transition-colors">
                <Icon size={24} className="text-white/80" weight="duotone" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{f.title}</h3>
              <p className="text-white/50 leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
