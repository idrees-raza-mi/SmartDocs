'use client';

import { motion } from 'framer-motion';

export const HowItWorks = () => {
  return (
    <section className="py-32 px-6 sm:px-12 bg-[#050505] relative border-b border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Three steps to automation.</h2>
            <p className="text-xl text-white/50 mb-12">No complicated pipelines. We handle the chunking, embedding, and storage.</p>
            
            <div className="space-y-8">
              {[
                { step: '01', title: 'Connect Data', desc: 'Sync your website URLs, PDF manuals, or paste raw text. We securely process and encrypt everything.' },
                { step: '02', title: 'Vector Generation', desc: 'Our engine chunks your text and generates dense vectors using OpenAI embeddings.' },
                { step: '03', title: 'Deploy Widget', desc: 'Inject our lightweight script onto your frontend. Your users get instant, accurate answers.' }
              ].map((s, i) => (
                <motion.div 
                  key={s.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="flex gap-6"
                >
                  <div className="text-2xl font-mono text-white/20 font-bold mt-1">{s.step}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-white/50 leading-relaxed text-sm">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-[#0a0a0a] rounded-2xl border border-white/10 p-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                <span className="ml-2 text-xs font-mono text-white/30">index.html</span>
              </div>
              <div className="font-mono text-sm leading-loose overflow-x-auto text-white/80">
                <div className="text-white/30">{`<!DOCTYPE html>`}</div>
                <div className="text-white/30">{`<html>`}</div>
                <div className="text-white/30 pl-4">{`<head>`}</div>
                <div className="text-white/30 pl-8">{`<title>My Website</title>`}</div>
                <div className="text-white/30 pl-4">{`</head>`}</div>
                <div className="text-white/30 pl-4">{`<body>`}</div>
                <div className="text-white/30 pl-8">{`<!-- Main Content -->`}</div>
                <div className="text-white/30 pl-8">{`<h1>Welcome to our store</h1>`}</div>
                <br/>
                <div className="text-white/50 pl-8">{`<!-- DocWise Widget -->`}</div>
                <div className="pl-8 text-blue-400">{`<script`}</div>
                <div className="pl-12 text-blue-300">{`src=`}<span className="text-green-300">"https://app.docwise.ai/widget.js"</span></div>
                <div className="pl-12 text-blue-300">{`data-chatbot-id=`}<span className="text-green-300">"org_a8f9d2..."</span></div>
                <div className="pl-12 text-blue-300">{`defer`}</div>
                <div className="pl-8 text-blue-400">{`></script>`}</div>
                <br/>
                <div className="text-white/30 pl-4">{`</body>`}</div>
                <div className="text-white/30">{`</html>`}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
