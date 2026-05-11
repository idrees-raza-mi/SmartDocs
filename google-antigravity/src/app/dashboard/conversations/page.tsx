'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChatCircleDots, Spinner } from '@phosphor-icons/react';
import type { Conversation } from '@/types/chatbot';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<(Conversation & { chatbot_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!org) { setLoading(false); return; }

      const { data: chatbots } = await supabase
        .from('chatbots')
        .select('id, name')
        .eq('org_id', org.id);

      if (!chatbots || chatbots.length === 0) { setLoading(false); return; }

      const chatbotMap = Object.fromEntries(chatbots.map(b => [b.id, b.name]));
      const chatbotIds = chatbots.map(b => b.id);

      const { data } = await supabase
        .from('conversations')
        .select('*')
        .in('chatbot_id', chatbotIds)
        .order('started_at', { ascending: false })
        .limit(100);

      if (data) {
        setConversations(data.map(c => ({ ...c, chatbot_name: chatbotMap[c.chatbot_id] })));
      }
      setLoading(false);
    })();
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">All Conversations</h1>
        <p className="text-sm text-white/40 mt-1">View conversations across all your chatbots.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40"><Spinner className="animate-spin mx-auto" size={24} /></div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            <ChatCircleDots size={40} className="mx-auto mb-3 text-white/20" />
            <p className="text-sm">No conversations yet.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Chatbot</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Session</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Messages</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {conversations.map(conv => (
                <tr key={conv.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 text-sm text-white/80">{conv.chatbot_name || 'Unknown'}</td>
                  <td className="py-4 px-6 text-sm font-mono text-white/60">{conv.session_id.slice(0, 12)}...</td>
                  <td className="py-4 px-6 text-sm text-white/60">{conv.message_count}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${
                      conv.resolved
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {conv.resolved ? 'Resolved' : 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-white/60">{formatDate(conv.started_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
