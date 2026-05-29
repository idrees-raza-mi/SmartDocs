'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { Plus, LinkSimple, FileText, Spinner, Trash, CheckCircle, XCircle, WarningCircle, ArrowsClockwise, Upload } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { usePremiumPopup } from '@/hooks/usePremiumPopup';
import { toast } from '@/lib/toast';
import type { Source } from '@/types/chatbot';
import clsx from 'clsx';

type Tab = 'url' | 'file' | 'text' | 'sitemap';

const ACCEPTED_FILE_TYPES = '.pdf,.docx,.txt,.md,.csv,.json';

export default function SourcesTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('url');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [textName, setTextName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const { plan, getLimit, checkAccess } = usePlanAccess();
  const { show } = usePremiumPopup();

  // URL + Sitemap ingestion is only available on paid plans. Free and trial
  // users can upload files or paste text — this keeps OpenAI embedding spend
  // proportional to plan revenue and prevents abuse by scraping unrelated sites.
  const canUseUrlSources = plan === 'starter' || plan === 'pro' || plan === 'business';

  // If the plan doesn't allow URL/sitemap, snap the active tab to 'file'.
  useEffect(() => {
    if (!canUseUrlSources && (tab === 'url' || tab === 'sitemap')) {
      setTab('file');
    }
  }, [canUseUrlSources, tab]);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from('sources')
      .select('*')
      .eq('chatbot_id', id)
      .order('created_at', { ascending: false });
    if (data) setSources(data);
  }, [id]);

  useEffect(() => {
    refresh().then(() => setLoading(false));
  }, [refresh]);

  // Poll while any source is still processing — gives "live" status feel.
  useEffect(() => {
    const hasProcessing = sources.some((s) => s.status === 'processing' || s.status === 'pending');
    if (!hasProcessing) return;
    const handle = setInterval(refresh, 3000);
    return () => clearInterval(handle);
  }, [sources, refresh]);

  const resetModal = () => {
    setSourceUrl('');
    setSitemapUrl('');
    setTextName('');
    setTextContent('');
    setFiles([]);
    setError(null);
    setTab('url');
    setIsModalOpen(false);
  };

  const handleAddClick = () => {
    const limit = getLimit('sources');
    if (limit !== -1 && sources.length >= limit) {
      show('Adding additional sources', 'Starter');
      return;
    }
    setIsModalOpen(true);
  };

  const ingest = async () => {
    setSyncing(true);
    setError(null);
    try {
      if (tab === 'url') {
        if (!sourceUrl.trim()) throw new Error('Enter a URL.');
        const res = await fetch('/api/ingest/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatbotId: id, url: sourceUrl.trim() }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Ingest failed' }));
          throw new Error(data.error || 'Ingest failed');
        }
      } else if (tab === 'sitemap') {
        if (!checkAccess('scheduledRecrawl' as never).allowed && !checkAccess('knowledgeGap' as never).allowed) {
          // Sitemap is a Pro feature
          show('Sitemap crawling', 'Pro');
          throw new Error('Sitemap crawling requires the Pro plan.');
        }
        if (!sitemapUrl.trim()) throw new Error('Enter a sitemap URL.');
        const res = await fetch('/api/ingest/sitemap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatbotId: id, sitemapUrl: sitemapUrl.trim() }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Ingest failed' }));
          throw new Error(data.error || 'Ingest failed');
        }
        toast.success(`Queued ${(await res.json()).queued} URLs for processing.`);
      } else if (tab === 'file') {
        if (files.length === 0) throw new Error('Select at least one file.');
        for (const file of files) {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('chatbotId', id);
          const res = await fetch('/api/ingest/pdf', { method: 'POST', body: fd });
          if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'Ingest failed' }));
            throw new Error(`${file.name}: ${data.error || 'Ingest failed'}`);
          }
        }
      } else {
        if (!textName.trim() || !textContent.trim()) throw new Error('Enter a name and content.');
        const res = await fetch('/api/ingest/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatbotId: id, name: textName.trim(), content: textContent }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Ingest failed' }));
          throw new Error(data.error || 'Ingest failed');
        }
      }

      toast.success('Source added. Processing started.');
      await refresh();
      resetModal();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ingest failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (sourceId: string, name: string) => {
    if (!confirm(`Delete source "${name}" and all its chunks? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/sources/${sourceId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setSources((s) => s.filter((x) => x.id !== sourceId));
      toast.success('Source deleted.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleResync = async (sourceId: string) => {
    try {
      const res = await fetch(`/api/sources/${sourceId}/resync`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Resync failed' }));
        throw new Error(data.error || 'Resync failed');
      }
      toast.success('Resync started.');
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Resync failed');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      /\.(pdf|docx|txt|md|csv|json)$/i.test(f.name)
    );
    if (dropped.length === 0) {
      setError('Unsupported file type. Use PDF, DOCX, TXT, MD, CSV, or JSON.');
      return;
    }
    setFiles((prev) => [...prev, ...dropped]);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const typeBadge = (type: string) => {
    const map: Record<string, { bg: string; text: string; border: string; icon: typeof LinkSimple }> = {
      url: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: LinkSimple },
      sitemap: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', icon: LinkSimple },
      pdf: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: FileText },
      docx: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', icon: FileText },
      txt: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', icon: FileText },
      md: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: FileText },
      csv: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: FileText },
      json: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', icon: FileText },
      text: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', icon: FileText },
    };
    const cfg = map[type] || map.text;
    const Icon = cfg.icon;
    return (
      <div className={`w-8 h-8 rounded ${cfg.bg} ${cfg.text} flex items-center justify-center border ${cfg.border}`}>
        <Icon size={16} weight="bold" />
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Knowledge Sources</h2>
          <p className="text-sm text-white/40 mt-1">Train your chatbot on docs, URLs, files, and raw text.</p>
        </div>
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
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="py-3 px-6">
                    <div className="h-8 bg-white/5 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : sources.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <FileText size={40} className="mx-auto text-white/10 mb-3" />
                  <p className="text-white/40 text-sm">No sources yet.</p>
                  <p className="text-white/30 text-xs mt-1">Add your first source to start training the chatbot.</p>
                </td>
              </tr>
            ) : (
              sources.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">{typeBadge(s.type)}</td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-white truncate max-w-[260px]" title={s.name}>{s.name}</div>
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
                    <div className="inline-flex items-center gap-1">
                      {(s.type === 'url' || s.type === 'sitemap') && s.status === 'ready' && (
                        <button
                          onClick={() => handleResync(s.id)}
                          className="text-white/30 hover:text-blue-400 p-1.5 rounded transition-colors"
                          title="Re-sync source"
                        >
                          <ArrowsClockwise size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        className="text-white/30 hover:text-red-400 p-1.5 rounded transition-colors"
                        title="Delete source"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={resetModal}>
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h3 className="text-lg font-bold text-white tracking-tight">Add Source</h3>
              <button onClick={resetModal} className="text-white/40 hover:text-white text-xl">&times;</button>
            </div>
            <div className="p-6">
              <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
                {(canUseUrlSources
                  ? (['url', 'file', 'text', 'sitemap'] as Tab[])
                  : (['file', 'text'] as Tab[])
                ).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(null); }}
                    className={clsx(
                      'flex-1 pb-2 text-sm transition-colors whitespace-nowrap px-3',
                      tab === t ? 'border-b-2 border-white text-white font-bold' : 'text-white/40 hover:text-white font-medium'
                    )}
                  >
                    {t === 'url' ? 'URL' : t === 'file' ? 'File Upload' : t === 'text' ? 'Raw Text' : 'Sitemap'}
                  </button>
                ))}
              </div>

              {!canUseUrlSources && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200">
                  URL and Sitemap ingestion are part of the Starter plan and above. On Free and Trial, upload files or paste raw text.
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                  <WarningCircle size={18} weight="fill" /> {error}
                </div>
              )}

              {tab === 'url' && (
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] text-white rounded-lg mb-4 focus:outline-none focus:border-white/30 text-sm"
                />
              )}

              {tab === 'sitemap' && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={sitemapUrl}
                    onChange={(e) => setSitemapUrl(e.target.value)}
                    placeholder="https://example.com/sitemap.xml"
                    className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
                  />
                  <p className="text-xs text-white/40 mt-2">Pro plan — crawl up to 200 URLs. Business plan — up to 2,000.</p>
                </div>
              )}

              {tab === 'file' && (
                <div className="mb-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={clsx(
                      'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                      dragOver ? 'border-white/40 bg-white/5' : 'border-white/10 hover:border-white/20'
                    )}
                    onClick={() => document.getElementById('dw-file-input')?.click()}
                  >
                    <Upload size={32} className="mx-auto text-white/40 mb-2" />
                    <p className="text-sm text-white/70">Drag and drop files here, or <span className="underline">browse</span></p>
                    <p className="text-xs text-white/40 mt-2">PDF, DOCX, TXT, MD, CSV, JSON — up to 25MB each</p>
                    <input
                      id="dw-file-input"
                      type="file"
                      multiple
                      accept={ACCEPTED_FILE_TYPES}
                      className="hidden"
                      onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                    />
                  </div>
                  {files.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-white/5 px-3 py-2 rounded">
                          <span className="text-white/80 truncate">{f.name}</span>
                          <button
                            onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                            className="text-white/40 hover:text-red-400"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'text' && (
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    value={textName}
                    onChange={(e) => setTextName(e.target.value)}
                    placeholder="Source name (e.g. FAQ)"
                    className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
                  />
                  <textarea
                    rows={6}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Paste raw text content here..."
                    className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
                  />
                </div>
              )}

              <button
                onClick={ingest}
                disabled={syncing}
                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {syncing && <Spinner className="animate-spin" />}
                {syncing ? 'Processing...' : 'Add Source'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
