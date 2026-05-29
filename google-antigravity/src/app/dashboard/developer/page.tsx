'use client';

import { useEffect, useState } from 'react';
import { Spinner, Plus, Trash, Key, Copy, Check } from '@phosphor-icons/react';
import { toast } from '@/lib/toast';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import Link from 'next/link';

type KeySummary = {
  id: string;
  name: string;
  prefix: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
};

export default function DeveloperPage() {
  const { plan, loading: planLoading } = usePlanAccess();
  const [keys, setKeys] = useState<KeySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/developer/keys');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status !== 403) toast.error(data.error || 'Failed to load keys');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setKeys(data.keys);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!planLoading) load();
  }, [planLoading]);

  const create = async () => {
    const name = prompt('Name this key (e.g. "Production server"):');
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const data = await res.json();
      setNewKey(data.key);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm('Revoke this key? Any service using it will stop working.')) return;
    try {
      const res = await fetch(`/api/developer/keys/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success('Key revoked.');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Revoke failed');
    }
  };

  if (planLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={24} className="animate-spin text-white/40" />
      </div>
    );
  }

  if (plan !== 'business') {
    return (
      <div className="max-w-2xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-2xl p-10 text-center">
        <Key size={36} className="mx-auto text-amber-400/60 mb-3" />
        <h2 className="text-xl font-bold text-white tracking-tight mb-2">Developer API</h2>
        <p className="text-sm text-white/60 mb-6">REST API access, webhooks, and the TypeScript SDK are on the Business plan.</p>
        <Link
          href="/dashboard/billing"
          className="inline-block px-6 py-2 bg-white text-black rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
        >
          Upgrade to Business
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Developer</h1>
          <p className="text-sm text-white/40 mt-1">Manage API keys and webhook subscriptions.</p>
        </div>
        <button
          onClick={create}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {creating ? <Spinner className="animate-spin" /> : <Plus size={14} weight="bold" />}
          New API key
        </button>
      </div>

      {newKey && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
          <h3 className="font-bold text-amber-200 mb-2">Copy your key — it won&apos;t be shown again</h3>
          <div className="flex gap-2 items-center bg-black border border-white/10 rounded-lg p-3 font-mono text-xs text-white break-all">
            <span className="flex-1">{newKey}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newKey);
                toast.success('Key copied.');
              }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs flex items-center gap-1"
            >
              <Copy size={12} /> Copy
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 text-xs text-amber-300/70 hover:text-amber-200"
          >
            I&apos;ve copied it
          </button>
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="py-3 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Name</th>
              <th className="py-3 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Prefix</th>
              <th className="py-3 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Created</th>
              <th className="py-3 px-6 text-xs font-bold text-white/40 uppercase tracking-wider">Last used</th>
              <th className="py-3 px-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-white/40">No keys yet.</td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className={k.revoked_at ? 'opacity-50' : ''}>
                  <td className="py-3 px-6 text-sm text-white">{k.name}</td>
                  <td className="py-3 px-6 text-xs font-mono text-white/60">{k.prefix}…</td>
                  <td className="py-3 px-6 text-xs text-white/40">{new Date(k.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-xs text-white/40">
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : 'Never'}
                  </td>
                  <td className="py-3 px-6 text-right">
                    {!k.revoked_at && (
                      <button
                        onClick={() => revoke(k.id)}
                        className="text-white/30 hover:text-red-400 p-1.5 rounded"
                        title="Revoke"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                    {k.revoked_at && (
                      <span className="text-xs text-red-400/60">Revoked</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-2">Quick start</h2>
        <p className="text-sm text-white/50 mb-4">Send a message via the REST API:</p>
        <pre className="bg-black border border-white/10 rounded-lg p-4 text-xs text-white/80 overflow-x-auto"><code>{`curl -X POST https://YOUR-APP.com/api/v1/chat \\
  -H "Authorization: Bearer dw_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"chatbotId":"<UUID>","message":"Hello","sessionId":"<id>"}'`}</code></pre>
      </div>
    </div>
  );
}
