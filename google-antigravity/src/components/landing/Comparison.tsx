'use client';

import { Check, X } from '@phosphor-icons/react';

const ROWS = [
  { feature: 'Strict source-grounded answers (no hallucinations)', us: true, chatbase: 'partial', intercom: false },
  { feature: 'Markdown + source citations in widget', us: true, chatbase: false, intercom: true },
  { feature: 'Auto-retrain from unanswered questions', us: true, chatbase: false, intercom: false },
  { feature: 'Confidence score per answer', us: true, chatbase: false, intercom: false },
  { feature: 'Sitemap crawler', us: true, chatbase: true, intercom: true },
  { feature: 'GDPR consent + EU hosting', us: true, chatbase: false, intercom: true },
  { feature: 'Pay only when you use it (no seat fees)', us: true, chatbase: true, intercom: false },
  { feature: 'Starts at', us: '$29/mo', chatbase: '$49/mo', intercom: '$74/seat' },
];

function cell(v: boolean | string) {
  if (v === true) return <Check size={18} weight="bold" className="text-green-400 mx-auto" />;
  if (v === false) return <X size={18} weight="bold" className="text-white/30 mx-auto" />;
  if (v === 'partial') return <span className="text-amber-300 text-xs font-bold">Partial</span>;
  return <span className="text-white text-sm font-medium">{v}</span>;
}

export const Comparison = () => {
  return (
    <section className="relative py-20 px-6 sm:px-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-center mb-3">
          How SmartDocs compares
        </h2>
        <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">
          We built SmartDocs because existing chatbots either hallucinated, charged per seat, or hid behind a sales call.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0a0a0a]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Feature</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-white">SmartDocs</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-white/50">Chatbase</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-white/50">Intercom Fin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ROWS.map((r) => (
                <tr key={r.feature} className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 text-sm text-white/80">{r.feature}</td>
                  <td className="py-4 px-6 text-center">{cell(r.us)}</td>
                  <td className="py-4 px-6 text-center">{cell(r.chatbase)}</td>
                  <td className="py-4 px-6 text-center">{cell(r.intercom)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
