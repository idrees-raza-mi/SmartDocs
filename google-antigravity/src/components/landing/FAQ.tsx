'use client';

import { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import clsx from 'clsx';

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'Does the chatbot hallucinate?',
    a: 'No. We use strict retrieval-augmented generation — the bot can only answer from the documents you upload. If the answer is not in your sources, it says so and offers to connect the user with a human.',
  },
  {
    q: 'Which file formats do you support?',
    a: 'PDF, DOCX, TXT, Markdown, CSV, JSON, and any public URL. Pro plans can crawl entire sitemaps and refresh them automatically.',
  },
  {
    q: 'Can I embed the widget on multiple websites?',
    a: 'Yes. Use the Allowed Domains setting to restrict which sites can use a chatbot. Business plan customers can use custom domains.',
  },
  {
    q: 'How fast does the bot respond?',
    a: 'Most responses start streaming within 600ms. We use GPT-4o-mini with edge-runtime endpoints and a globally-distributed Postgres + pgvector backend.',
  },
  {
    q: 'Do you offer a free trial?',
    a: 'Yes — 7 days, no credit card required, up to 1 chatbot and 50 messages. You can keep your chatbot data when you upgrade.',
  },
  {
    q: 'Where is my data stored?',
    a: 'On Supabase (US or EU region of your choice). We never train language models on your content. Your knowledge base stays yours.',
  },
  {
    q: 'How do I cancel?',
    a: 'One click in the billing settings. We don\'t hide the cancel button.',
  },
  {
    q: 'Do you have an API?',
    a: 'Yes — REST API with API keys and webhooks on the Business plan. A TypeScript SDK is available on npm.',
  },
];

export const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-20 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-center mb-3">
          Frequently asked
        </h2>
        <p className="text-white/50 text-center mb-12">Don&apos;t see your question? <a href="mailto:hello@docwise.ai" className="text-white hover:underline">Email us</a>.</p>

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-white">{item.q}</span>
                  <CaretDown
                    size={16}
                    weight="bold"
                    className={clsx('text-white/40 transition-transform shrink-0', isOpen && 'rotate-180')}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-white/60 leading-relaxed">{item.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
