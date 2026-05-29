'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Spinner, Question, ArrowRight, CheckCircle } from '@phosphor-icons/react';

type Row = {
  chatbot_id: string;
  chatbot_name: string;
  unanswered: number;
};

export default function ReviewOverviewPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data: bots } = await supabase.from('chatbots').select('id, name');
        if (!bots) { setLoading(false); return; }

        const counts: Row[] = [];
        for (const b of bots) {
          const { count } = await supabase
            .from('unanswered_questions')
            .select('id', { count: 'exact', head: true })
            .eq('chatbot_id', b.id)
            .is('resolved_at', null);
          counts.push({ chatbot_id: b.id, chatbot_name: b.name, unanswered: count ?? 0 });
        }
        counts.sort((a, b) => b.unanswered - a.unanswered);
        setRows(counts);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={24} className="animate-spin text-white/40" />
      </div>
    );
  }

  const total = rows.reduce((a, r) => a + r.unanswered, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Review Queue</h1>
        <p className="text-sm text-white/40 mt-1">
          Questions your bots couldn&apos;t answer. Answer one and it becomes a knowledge source.
        </p>
      </div>

      {total === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-12 text-center">
          <CheckCircle size={40} weight="fill" className="mx-auto text-green-400/40 mb-3" />
          <p className="text-white/60 text-sm">Nothing to review. Your bots are handling every question 🎉</p>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-3 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Chatbot</th>
                <th className="py-3 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Unanswered</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.chatbot_id}>
                  <td className="py-4 px-6 text-sm font-medium text-white">{r.chatbot_name}</td>
                  <td className="py-4 px-6">
                    {r.unanswered === 0 ? (
                      <span className="text-xs text-white/40">None</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Question weight="fill" /> {r.unanswered}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/dashboard/chatbots/${r.chatbot_id}/review`}
                      className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
                    >
                      Review <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
