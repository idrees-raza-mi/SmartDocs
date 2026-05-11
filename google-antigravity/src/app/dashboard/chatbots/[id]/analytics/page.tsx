'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@phosphor-icons/react';
import type { Message } from '@/types/chatbot';

export default function AnalyticsTab({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{
    totalMessages: number;
    escalationRate: string;
    unansweredCount: number;
    last7Days: { name: string; messages: number }[];
    topTopics: { name: string; count: number }[];
    topUnanswered: [string, number][];
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
    supabase
      .from('messages')
      .select('*, conversations!inner(chatbot_id)')
      .eq('conversations.chatbot_id', params.id)
      .gte('created_at', cutoff)
      .order('created_at', { ascending: true })
      .then(({ data: msgs }) => {
        const messages = (msgs || []) as unknown as Message[];
        const totalMessages = messages.length;
        const escalatedMsgs = messages.filter(m => m.was_escalated);
        const escalationRate = totalMessages > 0 ? ((escalatedMsgs.length / totalMessages) * 100).toFixed(1) : '0';

        const now = Date.now();
        const last7Days: { name: string; messages: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now - i * 86400000);
          const label = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
          const count = messages.filter(m => new Date(m.created_at).toDateString() === d.toDateString()).length;
          last7Days.push({ name: label, messages: count });
        }

        const userMessages = messages.filter(m => m.role === 'user');
        const topicCounts: Record<string, number> = {};
        userMessages.forEach(m => {
          const words = m.content.split(' ').slice(0, 5).join(' ');
          topicCounts[words] = (topicCounts[words] || 0) + 1;
        });
        const topTopics = Object.entries(topicCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name: name.length > 30 ? name.slice(0, 30) + '...' : name, count }));

        const escalatedUserMsgs = escalatedMsgs.filter(m => m.role === 'user');
        const questionCounts: Record<string, number> = {};
        escalatedUserMsgs.forEach(m => {
          const key = m.content.slice(0, 60);
          questionCounts[key] = (questionCounts[key] || 0) + 1;
        });
        const topUnanswered = Object.entries(questionCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        setData({ totalMessages, escalationRate, unansweredCount: escalatedMsgs.length, last7Days, topTopics, topUnanswered });
      });
  }, [params.id]);

  if (!data) return <div className="flex justify-center py-20"><Spinner className="animate-spin text-white/40" size={24} /></div>;

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
                <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded shrink-0">Asked {count} times</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
