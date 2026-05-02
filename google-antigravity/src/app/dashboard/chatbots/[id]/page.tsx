'use client';

import { useState } from 'react';
import { Plus, LinkSimple, UploadSimple, FileText, Spinner, Trash, CheckCircle, XCircle } from '@phosphor-icons/react';
import clsx from 'clsx';

export default function SourcesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockSources = [
    { id: '1', type: 'url', name: 'https://example.com/docs/getting-started', status: 'ready', chunks: 24, date: '2 hours ago' },
    { id: '2', type: 'pdf', name: 'company_policies_2023.pdf', status: 'processing', chunks: 0, date: 'Just now' },
    { id: '3', type: 'text', name: 'Refund Policy FAQs', status: 'error', chunks: 0, date: '1 day ago' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Knowledge Sources</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} weight="bold" />
          Add Source
        </button>
      </div>

      <div className="bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-gray-50 dark:bg-gray-800/50">
              <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Chunks</th>
              <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Added</th>
              <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {mockSources.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                <td className="py-3 px-4">
                  {s.type === 'url' && <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><LinkSimple size={16} weight="bold" /></div>}
                  {s.type === 'pdf' && <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><FileText size={16} weight="bold" /></div>}
                  {s.type === 'text' && <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><FileText size={16} weight="bold" /></div>}
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-xs">{s.name}</div>
                </td>
                <td className="py-3 px-4">
                  {s.status === 'ready' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"><CheckCircle weight="fill"/> Ready</span>}
                  {s.status === 'processing' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"><Spinner className="animate-spin"/> Processing</span>}
                  {s.status === 'error' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"><XCircle weight="fill"/> Error</span>}
                </td>
                <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{s.chunks}</td>
                <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{s.date}</td>
                <td className="py-3 px-4 text-right">
                  <button className="text-[var(--text-muted)] hover:text-[var(--error)] p-1 rounded transition-colors">
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[var(--surface)] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border)]">
              <h3 className="text-lg font-bold">Add Source</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">&times;</button>
            </div>
            <div className="p-6">
              <div className="flex border-b border-[var(--border)] mb-6">
                <button className="flex-1 pb-2 border-b-2 border-[var(--brand)] text-[var(--brand)] font-medium text-sm">URL</button>
                <button className="flex-1 pb-2 text-[var(--text-secondary)] font-medium text-sm">File Upload</button>
                <button className="flex-1 pb-2 text-[var(--text-secondary)] font-medium text-sm">Raw Text</button>
              </div>
              <input type="text" placeholder="https://..." className="w-full px-4 py-2 border border-[var(--border)] rounded-lg mb-4" />
              <button className="w-full py-2 bg-[var(--brand)] text-white font-medium rounded-lg">Fetch & Train</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
