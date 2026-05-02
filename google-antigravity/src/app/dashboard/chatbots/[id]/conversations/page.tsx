'use client';

import { useState } from 'react';

export default function ConversationsTab() {
  const [selectedConv, setSelectedConv] = useState<string | null>('1');

  const conversations = [
    { id: '1', session: 'sd_a8f9d...', preview: 'How do I reset my password?', messages: 4, time: '10 min ago' },
    { id: '2', session: 'sd_k3j1l...', preview: 'What are your pricing tiers?', messages: 2, time: '2 hours ago' },
    { id: '3', session: 'sd_z9x8c...', preview: 'I need to talk to a human.', messages: 6, time: 'Yesterday' },
  ];

  return (
    <div className="flex h-full gap-6 bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
      <div className="w-1/3 border-r border-[var(--border)] overflow-y-auto">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-semibold text-[var(--text-primary)]">History</h3>
          <button className="text-xs text-[var(--brand)] font-medium">Export CSV</button>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className={`p-4 cursor-pointer transition-colors ${selectedConv === conv.id ? 'bg-[var(--brand-light)] border-l-2 border-[var(--brand)]' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono text-[var(--text-muted)]">{conv.session}</span>
                <span className="text-xs text-[var(--text-secondary)]">{conv.time}</span>
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{conv.preview}</p>
              <span className="text-xs text-[var(--text-muted)]">{conv.messages} messages</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/20 relative">
        {selectedConv ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex justify-end">
              <div className="bg-gray-200 dark:bg-gray-700 text-[var(--text-primary)] px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                How do I reset my password?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white dark:bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%] text-sm shadow-sm">
                To reset your password, click the "Forgot Password" link on the login page. An email will be sent to your registered email address with instructions.
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Sources Used</span>
                  <div className="text-xs text-[var(--text-secondary)] bg-gray-50 dark:bg-gray-800 p-2 rounded border border-[var(--border)] cursor-pointer truncate">
                    [Account Management FAQs]: To reset your...
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">
            Select a conversation to view details
          </div>
        )}
      </div>
    </div>
  );
}
