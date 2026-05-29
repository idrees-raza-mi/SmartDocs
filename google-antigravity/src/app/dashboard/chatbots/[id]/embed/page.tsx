'use client';

import { Copy, Check, WarningCircle, Spinner } from '@phosphor-icons/react';
import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';

type EmbedConfig = {
  id: string;
  name: string;
  accent_color: string;
  welcome_message: string;
  allowed_domains: string[] | null;
};

export default function EmbedTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [config, setConfig] = useState<EmbedConfig | null>(null);
  const [domainsText, setDomainsText] = useState('');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    supabase
      .from('chatbots')
      .select('id, name, accent_color, welcome_message, allowed_domains')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setError('Failed to load chatbot.');
        else {
          setConfig(data);
          setDomainsText((data.allowed_domains || []).join('\n'));
        }
        setLoading(false);
      });
  }, [id]);

  const snippet = `<script\n  src="${origin}/widget.js"\n  data-chatbot-id="${id}"\n  defer\n></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const update = (patch: Partial<EmbedConfig>) =>
    setConfig((c) => (c ? { ...c, ...patch } : c));

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      const allowed_domains = domainsText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch(`/api/chatbots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accent_color: config.accent_color,
          allowed_domains: allowed_domains.length ? allowed_domains : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSavedMessage('Saved widget settings');
      setTimeout(() => setSavedMessage(null), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="animate-spin text-white/40" size={24} />
      </div>
    );
  }
  if (!config) {
    return <div className="text-red-400 text-sm">{error || 'Chatbot not found.'}</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-8">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
            <WarningCircle size={18} weight="fill" /> {error}
          </div>
        )}
        {savedMessage && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400 text-sm">
            <Check size={18} weight="bold" /> {savedMessage}
          </div>
        )}

        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-2">Embed Code</h3>
          <p className="text-sm text-white/50 mb-6">
            Paste this snippet just before the closing <code>&lt;/body&gt;</code> tag of your website.
          </p>

          <div className="relative">
            <div className="bg-black border border-white/10 rounded-xl p-4 text-left overflow-x-auto font-mono text-sm text-white/80">
              <pre><code>{snippet}</code></pre>
            </div>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-6">Widget Settings</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.accent_color}
                  onChange={(e) => update({ accent_color: e.target.value })}
                  className="h-10 w-10 rounded border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config.accent_color}
                  onChange={(e) => update({ accent_color: e.target.value })}
                  className="px-3 py-2 border border-white/10 bg-white/[0.02] text-white rounded-lg text-sm w-28 uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Allowed Domains</label>
              <textarea
                rows={3}
                value={domainsText}
                onChange={(e) => setDomainsText(e.target.value)}
                placeholder="example.com&#10;app.example.com"
                className="w-full px-4 py-2 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
              />
              <p className="text-xs text-white/40 mt-1">
                Leave blank to allow on any domain. Put each domain on a new line. Subdomains are matched automatically.
              </p>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:w-[400px]">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-sm h-[600px] relative overflow-hidden flex flex-col">
          <div className="h-12 bg-white/[0.02] border-b border-white/5 flex items-center px-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/70"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400/70"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/70"></div>
            </div>
          </div>
          <div className="p-8 flex-1 opacity-40 select-none">
            <div className="h-4 bg-white/10 w-1/3 rounded mb-8"></div>
            <div className="h-8 bg-white/10 w-3/4 rounded mb-4"></div>
            <div className="h-4 bg-white/10 w-full rounded mb-2"></div>
            <div className="h-4 bg-white/10 w-5/6 rounded mb-2"></div>
          </div>

          <div className="absolute bottom-6 right-6 flex flex-col items-end gap-4 shadow-2xl">
            <div className="w-[320px] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl overflow-hidden flex flex-col">
              <div
                className="h-14 px-4 flex items-center font-semibold"
                style={{ backgroundColor: config.accent_color, color: pickFg(config.accent_color) }}
              >
                {config.name}
              </div>
              <div className="p-4 bg-black min-h-[200px]">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl rounded-tl-none text-sm w-[85%] text-white/90">
                  {config.welcome_message}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function pickFg(bg: string): string {
  try {
    const c = bg.replace('#', '');
    const h = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#000000' : '#ffffff';
  } catch {
    return '#ffffff';
  }
}
