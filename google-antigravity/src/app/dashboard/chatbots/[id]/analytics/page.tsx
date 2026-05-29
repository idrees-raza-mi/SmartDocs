'use client';

import { useState, useEffect, use } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@phosphor-icons/react';
import type { Message } from '@/types/chatbot';

type AnalyticsData = {
  totalMessages: number;
  escalationRate: string;
  unansweredCount: number;
  last7Days: { name: string; messages: number }[];
  topTopics: { name: string; count: number }[];
  topUnanswered: [string, number][];
};

export default function AnalyticsTab({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 16 passes route params as a Promise to client components.
  // use() unwraps it; accessing params.id directly would yield undefined
  // and filter every Supabase query to zero rows.
  const { id: chatbotId } = use(params);

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();

      // 1. Fetch this chatbot's conversation IDs first. RLS allows the
      //    owner (and only the owner) to read them. Embedded resource
      //    filters like `conversations!inner(chatbot_id)` on messages are
      //    fragile when both sides have RLS; explicit two-step is reliable.
      const { data: convs, error: convErr } = await supabase
        .from('conversations')
        .select('id')
        .eq('chatbot_id', chatbotId);

      if (convErr) {
        console.error('[analytics] conversation fetch failed:', convErr);
      }

      const convIds = (convs ?? []).map((c) => c.id);

      if (convIds.length === 0) {
        if (!cancelled) {
          setData({
            totalMessages: 0,
            escalationRate: '0',
            unansweredCount: 0,
            last7Days: Array.from({ length: 7 }, (_, i) => {
              const d = new Date(Date.now() - (6 - i) * 86400000);
              return { name: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3), messages: 0 };
            }),
            topTopics: [],
            topUnanswered: [],
          });
          setLoading(false);
        }
        return;
      }

      // 2. Now fetch all messages for those conversations in the window.
      const { data: msgs, error: msgErr } = await supabase
        .from('messages')
        .select('id, conversation_id, role, content, was_escalated, created_at')
        .in('conversation_id', convIds)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: true });

      if (msgErr) {
        console.error('[analytics] message fetch failed:', msgErr);
      }

      const messages = (msgs ?? []) as unknown as Message[];

      // Total = assistant replies (a "message" from the bot's POV)
      const assistantMsgs = messages.filter((m) => m.role === 'assistant');
      const userMsgs = messages.filter((m) => m.role === 'user');
      const escalatedAssistant = assistantMsgs.filter((m) => m.was_escalated);
      const totalMessages = assistantMsgs.length;
      const escalationRate =
        totalMessages > 0
          ? ((escalatedAssistant.length / totalMessages) * 100).toFixed(1)
          : '0';

      // 7-day rollup of assistant message activity
      const now = Date.now();
      const last7Days: { name: string; messages: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
        const count = assistantMsgs.filter(
          (m) => new Date(m.created_at).toDateString() === d.toDateString()
        ).length;
        last7Days.push({ name: label, messages: count });
      }

      // Top topics = first 5 words of each user message, clustered
      const topicCounts: Record<string, number> = {};
      for (const m of userMsgs) {
        const words = m.content.trim().split(/\s+/).slice(0, 5).join(' ');
        if (!words) continue;
        topicCounts[words] = (topicCounts[words] ?? 0) + 1;
      }
      const topTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({
          name: name.length > 30 ? name.slice(0, 30) + '...' : name,
          count,
        }));

      // Top unanswered questions:
      // was_escalated is set on the ASSISTANT message, but the actual
      // question is the USER message that came right before it. We pair
      // them by conversation + position to find the original question.
      const byConv: Record<string, Message[]> = {};
      for (const m of messages) {
        (byConv[m.conversation_id] ||= []).push(m);
      }
      const unansweredQuestionCounts: Record<string, number> = {};
      for (const list of Object.values(byConv)) {
        for (let i = 1; i < list.length; i++) {
          if (list[i].role === 'assistant' && list[i].was_escalated && list[i - 1].role === 'user') {
            const key = list[i - 1].content.trim().slice(0, 80);
            if (!key) continue;
            unansweredQuestionCounts[key] = (unansweredQuestionCounts[key] ?? 0) + 1;
          }
        }
      }
      const topUnanswered = Object.entries(unansweredQuestionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) as [string, number][];

      if (!cancelled) {
        setData({
          totalMessages,
          escalationRate,
          unansweredCount: escalatedAssistant.length,
          last7Days,
          topTopics,
          topUnanswered,
        });
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatbotId]);

  if (loading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="animate-spin text-white/40" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
          <div className="text-sm text-white/40 mb-1">Total Messages (30d)</div>
          <div className="text-3xl font-bold text-white">{data.totalMessages}</div>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
          <div className="text-sm text-white/40 mb-1">Escalation Rate</div>
          <div className="text-3xl font-bold text-white">{data.escalationRate}%</div>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
          <div className="text-sm text-white/40 mb-1">Unanswered</div>
          <div className="text-3xl font-bold text-white">{data.unansweredCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold text-white mb-6">Messages per day</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                />
                <Line type="monotone" dataKey="messages" stroke="#fff" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold text-white mb-6">Top Topics</h3>
          <div className="h-64">
            {data.topTopics.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/30 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topTopics} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="count" fill="rgba(255,255,255,0.6)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-4">Questions your bot couldn&apos;t answer</h3>
        {data.topUnanswered.length === 0 ? (
          <div className="text-white/30 text-sm">No unanswered questions in the last 30 days.</div>
        ) : (
          <div className="space-y-3">
            {data.topUnanswered.map(([q, count]) => (
              <div key={q} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg border border-white/5">
                <span className="text-sm font-medium text-white/80 truncate mr-4">{q}</span>
                <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded shrink-0">Asked {count} {count === 1 ? 'time' : 'times'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
