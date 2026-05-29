'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/lib/toast';
import { Spinner, CheckCircle, Plus, ArrowsClockwise } from '@phosphor-icons/react';

type Question = {
  id: string;
  question: string;
  count: number;
  last_asked_at: string;
  resolved_at: string | null;
};

export default function ReviewQueuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();

  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from('unanswered_questions')
      .select('id, question, count, last_asked_at, resolved_at')
      .eq('chatbot_id', id)
      .is('resolved_at', null)
      .order('count', { ascending: false });
    if (error) toast.error('Failed to load review queue.');
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const save = async (qId: string, q: string) => {
    if (!answer.trim()) {
      toast.error('Type an answer first.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/review/${qId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbotId: id, question: q, answer: answer.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      toast.success('Saved as a knowledge source. Bot will use it on the next chat.');
      setOpenId(null);
      setAnswer('');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={24} className="animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Review Queue</h2>
          <p className="text-sm text-white/40 mt-1">
            Questions your bot couldn&apos;t answer. Answer one and it becomes a knowledge source — your bot improves automatically.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-white transition-colors"
        >
          <ArrowsClockwise size={14} />
          Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-12 text-center">
          <CheckCircle size={40} weight="fill" className="mx-auto text-green-400/40 mb-3" />
          <p className="text-white/60 text-sm">No pending questions. Your bot is handling everything 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q.id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{q.question}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                    <span>Asked {q.count} {q.count === 1 ? 'time' : 'times'}</span>
                    <span>·</span>
                    <span>Last: {new Date(q.last_asked_at).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpenId(openId === q.id ? null : q.id);
                    setAnswer('');
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white text-black hover:bg-gray-200 rounded-lg font-bold transition-colors"
                >
                  <Plus size={12} weight="bold" />
                  Answer
                </button>
              </div>

              {openId === q.id && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <textarea
                    rows={4}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Write the answer your bot should give. Use markdown."
                    className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => save(q.id, q.question)}
                      disabled={saving}
                      className="px-4 py-2 bg-white text-black rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save & retrain'}
                    </button>
                    <button
                      onClick={() => {
                        setOpenId(null);
                        setAnswer('');
                      }}
                      className="px-4 py-2 text-white/50 hover:text-white text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
