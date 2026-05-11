'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChatCircleDots } from '@phosphor-icons/react';
import type { Conversation, Message } from '@/types/chatbot';

export default function ConversationsTab({ params }: { params: { id: string } }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('conversations')
      .select('*')
      .eq('chatbot_id', params.id)
      .order('started_at', { ascending: false })
      .then(({ data }) => {
        if (data) setConversations(data);
        setLoadingConvs(false);
      });
  }, [params.id]);

  useEffect(() => {
    if (!selectedId) return;
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selectedId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data);
      });
  }, [selectedId]);

  const selectedConv = conversations.find(c => c.id === selectedId);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-full gap-6">
      <div className="w-1/3 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-sm font-bold text-white">History</h3>
          <button className="text-xs text-white/40 hover:text-white transition-colors">Export CSV</button>
        </div>
        <div className="divide-y divide-white/5 overflow-y-auto" style={{ maxHeight: 'calc(100% - 49px)' }}>
          {loadingConvs ? (
            <div className="p-8 text-center text-white/40 text-sm">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">No conversations yet.</div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedId === conv.id
                    ? 'bg-white/[0.06] border-l-2 border-white'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-white/40">{conv.session_id.slice(0, 10)}...</span>
                  <span className="text-xs text-white/40">{formatDate(conv.started_at)}</span>
                </div>
                <p className="text-sm font-medium text-white/80 truncate">{conv.session_id}</p>
                <span className="text-xs text-white/40">{conv.message_count} messages</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0a0a0a] border border-white/5 rounded-2xl relative">
        {selectedConv ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm ${
                  msg.role === 'user'
                    ? 'bg-white/10 text-white rounded-tr-sm'
                    : 'bg-white/[0.04] border border-white/5 text-white/90 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/40 gap-3">
            <ChatCircleDots size={40} className="text-white/20" />
            <span className="text-sm">Select a conversation to view details</span>
          </div>
        )}
      </div>
    </div>
  );
}
