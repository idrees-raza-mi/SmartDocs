'use client';

import { useState, useEffect } from 'react';
import { Plus, LinkSimple, FileText, Spinner, Trash, CheckCircle, XCircle } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { usePremiumPopup } from '@/hooks/usePremiumPopup';
import type { Source } from '@/types/chatbot';

export default function SourcesTab({ params }: { params: { id: string } }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');
  const [syncing, setSyncing] = useState(false);

  const supabase = createClient();
  const { getLimit } = usePlanAccess();
  const { show } = usePremiumPopup();

  useEffect(() => {
    supabase
      .from('sources')
      .select('*')
      .eq('chatbot_id', params.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSources(data);
        setLoading(false);
      });
  }, [params.id]);

  const handleAddClick = () => {
    const limit = getLimit('sources');
    if (limit !== -1 && sources.length >= limit) {
      show('Adding additional sources', 'Starter');
      return;
    }
    setIsModalOpen(true);
  };

  const handleFetchAndTrain = async () => {
    if (!sourceUrl.trim()) return;
    setSyncing(true);

    try {
      const res = await fetch('/api/ingest/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbotId: params.id, url: sourceUrl.trim() }),
      });

      if (!res.ok) throw new Error('Failed to ingest');

      const { data: newSources } = await supabase
        .from('sources')
        .select('*')
        .eq('chatbot_id', params.id)
        .order('created_at', { ascending: false });

      if (newSources) setSources(newSources);
      setIsModalOpen(false);
      setSourceUrl('');
    } catch {
      // silent fail
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Knowledge Sources</h2>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          <Plus size={16} weight="bold" />
          Add Source
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Type</th>
              <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Name</th>
              <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Chunks</th>
              <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Added</th>
              <th className="py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-white/40 text-sm">Loading sources...</td></tr>
            ) : sources.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-white/40 text-sm">No sources yet. Add your first source to train the chatbot.</td></tr>
            ) : (
              sources.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    {s.type === 'url' && <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20"><LinkSimple size={16} weight="bold" /></div>}
                    {s.type === 'pdf' && <div className="w-8 h-8 rounded bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20"><FileText size={16} weight="bold" /></div>}
                    {s.type === 'text' && <div className="w-8 h-8 rounded bg-gray-500/10 text-gray-400 flex items-center justify-center border border-gray-500/20"><FileText size={16} weight="bold" /></div>}
                    {s.type === 'docx' && <div className="w-8 h-8 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20"><FileText size={16} weight="bold" /></div>}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">{s.name}</div>
                  </td>
                  <td className="py-4 px-6">
                    {s.status === 'ready' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle weight="fill"/> Ready</span>}
                    {s.status === 'processing' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Spinner className="animate-spin"/> Processing</span>}
                    {s.status === 'error' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"><XCircle weight="fill"/> Error</span>}
                    {s.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">Pending</span>}
                  </td>
                  <td className="py-4 px-6 text-sm text-white/60">{s.chunk_count}</td>
                  <td className="py-4 px-6 text-sm text-white/60">{formatDate(s.created_at)}</td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-white/30 hover:text-red-400 p-1 rounded transition-colors">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h3 className="text-lg font-bold text-white tracking-tight">Add Source</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">&times;</button>
            </div>
            <div className="p-6">
              <div className="flex border-b border-white/10 mb-6">
                <button className="flex-1 pb-2 border-b-2 border-white text-white font-bold text-sm">URL</button>
                <button className="flex-1 pb-2 text-white/40 hover:text-white font-medium text-sm transition-colors">File Upload</button>
                <button className="flex-1 pb-2 text-white/40 hover:text-white font-medium text-sm transition-colors">Raw Text</button>
              </div>
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] text-white rounded-lg mb-4 focus:outline-none focus:border-white/30 text-sm"
              />
              <button
                onClick={handleFetchAndTrain}
                disabled={syncing || !sourceUrl.trim()}
                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : 'Fetch & Train'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
