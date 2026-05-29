'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChatCircleDots, CheckCircle, ArrowCounterClockwise, Download } from '@phosphor-icons/react';
import type { Conversation, Message } from '@/types/chatbot';

export default function ConversationsTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [updating, setUpdating] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('conversations')
      .select('*')
      .eq('chatbot_id', id)
      .order('started_at', { ascending: false })
      .then(({ data }) => {
        if (data) setConversations(data);
        setLoadingConvs(false);
      });
  }, [id]);

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

  const selectedConv = conversations.find((c) => c.id === selectedId);

  const toggleResolved = async () => {
    if (!selectedConv) return;
    setUpdating(true);
    const next = !selectedConv.resolved;
    const res = await fetch(`/api/conversations/${selectedConv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: next }),
    });
    if (res.ok) {
      setConversations((cs) => cs.map((c) => (c.id === selectedConv.id ? { ...c, resolved: next } : c)));
    }
    setUpdating(false);
  };

  const exportCsv = () => {
    const header = ['session_id', 'started_at', 'message_count', 'resolved'];
    const rows = conversations.map((c) => [
      c.session_id,
      c.started_at,
      String(c.message_count),
      c.resolved ? 'yes' : 'no',
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversations-${id}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-full gap-6">
      <div className="w-1/3 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shrink-0 flex flex-col">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-sm font-bold text-white">History</h3>
          <button
            onClick={exportCsv}
            disabled={conversations.length === 0}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
        <div className="divide-y divide-white/5 overflow-y-auto flex-1">
          {loadingConvs ? (
            <div className="p-8 text-center text-white/40 text-sm">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">No conversations yet.</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedId === conv.id ? 'bg-white/[0.06] border-l-2 border-white' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-white/40">{conv.session_id.slice(0, 10)}...</span>
                  <span className="text-xs text-white/40">{formatDate(conv.started_at)}</span>
                </div>
                <p className="text-sm font-medium text-white/80 truncate">{conv.session_id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/40">{conv.message_count} messages</span>
                  {conv.resolved && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle size={12} weight="fill" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0a0a0a] border border-white/5 rounded-2xl relative overflow-hidden">
        {selectedConv ? (
          <>
            <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="text-xs font-mono text-white/40 truncate">{selectedConv.session_id}</div>
              <button
                onClick={toggleResolved}
                disabled={updating}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors disabled:opacity-50"
              >
                {selectedConv.resolved ? (
                  <><ArrowCounterClockwise size={14} /> Mark Unresolved</>
                ) : (
                  <><CheckCircle size={14} weight="fill" /> Mark Resolved</>
                )}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-white/10 text-white rounded-tr-sm'
                      : 'bg-white/[0.04] border border-white/5 text-white/90 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </>
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
