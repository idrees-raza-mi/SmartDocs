'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, UploadSimple, Code, ArrowRight, CheckCircle, Spinner } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { usePremiumPopup } from '@/hooks/usePremiumPopup';
import { toast } from '@/lib/toast';
import clsx from 'clsx';

export default function NewChatbotWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const [existingCount, setExistingCount] = useState(0);

  const [name, setName] = useState('Support Agent');
  const [welcomeMessage, setWelcomeMessage] = useState("Hi! I'm trained on the full documentation. How can I help?");
  const [accentColor, setAccentColor] = useState('#ffffff');

  // Step-2 source-input state. Tab determines which input is shown + which
  // upload route runs after the chatbot is created.
  type TrainTab = 'url' | 'pdf' | 'text';
  const [trainTab, setTrainTab] = useState<TrainTab>('pdf');
  const [sourceUrl, setSourceUrl] = useState('');
  const [trainFile, setTrainFile] = useState<File | null>(null);
  const [textName, setTextName] = useState('');
  const [textBody, setTextBody] = useState('');

  const router = useRouter();
  const supabase = createClient();
  const { plan, getLimit } = usePlanAccess();
  const { show } = usePremiumPopup();

  // URL ingestion is paid-tier only — same gate as the Sources page.
  const canUseUrlSources = plan === 'starter' || plan === 'pro' || plan === 'business';

  // If the active tab isn't allowed on this plan, snap to PDF.
  useEffect(() => {
    if (!canUseUrlSources && trainTab === 'url') setTrainTab('pdf');
  }, [canUseUrlSources, trainTab]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('organizations').select('id').eq('user_id', user.id).single().then(({ data }) => {
        if (data) {
          setOrgId(data.id);
          supabase.from('chatbots').select('*', { count: 'exact', head: true }).eq('org_id', data.id).then(({ count }) => {
            setExistingCount(count || 0);
          });
        }
      });
    });
  }, []);

  const handleCreate = async () => {
    if (!orgId) return;

    const limit = getLimit('chatbots');
    if (limit !== -1 && existingCount >= limit) {
      show('Creating additional chatbots', 'Starter');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chatbots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          welcome_message: welcomeMessage.trim(),
          accent_color: accentColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create chatbot');
      const chatbot = data.chatbot;
      if (!chatbot) throw new Error('Failed to create chatbot');

      setChatbotId(chatbot.id);
      toast.success(`${chatbot.name} created.`);

      // Ingest the initial source if the user filled one in. We report
      // success / failure via toast so the user knows whether training
      // actually happened.
      const hasSourceInput =
        (trainTab === 'url' && sourceUrl.trim()) ||
        (trainTab === 'pdf' && !!trainFile) ||
        (trainTab === 'text' && textName.trim() && textBody.trim());

      if (hasSourceInput) {
        try {
          let ingestRes: Response;
          if (trainTab === 'url' && canUseUrlSources) {
            ingestRes = await fetch('/api/ingest/url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chatbotId: chatbot.id, url: sourceUrl.trim() }),
            });
          } else if (trainTab === 'pdf' && trainFile) {
            const fd = new FormData();
            fd.append('file', trainFile);
            fd.append('chatbotId', chatbot.id);
            ingestRes = await fetch('/api/ingest/pdf', { method: 'POST', body: fd });
          } else if (trainTab === 'text') {
            ingestRes = await fetch('/api/ingest/text', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chatbotId: chatbot.id, name: textName.trim(), content: textBody }),
            });
          } else {
            ingestRes = new Response(null, { status: 204 });
          }

          if (!ingestRes.ok && ingestRes.status !== 204) {
            const errPayload = await ingestRes.json().catch(() => ({ error: 'Ingest failed' }));
            toast.error(`Source not added: ${errPayload.error || 'Ingest failed'}`);
          } else if (ingestRes.status !== 204) {
            toast.success('Source added — embedding in progress.');
          }
        } catch (ingestErr) {
          const msg = ingestErr instanceof Error ? ingestErr.message : 'Ingest failed';
          toast.error(`Source not added: ${msg}`);
        }
      }

      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create chatbot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-12 flex items-center justify-between relative">
        <div className="absolute left-0 top-5 w-full h-[1px] bg-white/5 -z-10"></div>
        <div className="absolute left-0 top-5 h-[1px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)] -z-10 transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />
        {[
          { num: 1, label: 'Configure', icon: BookOpen },
          { num: 2, label: 'Train', icon: UploadSimple },
          { num: 3, label: 'Deploy', icon: Code }
        ].map(s => {
          const Icon = s.icon;
          const done = step > s.num;
          const active = step === s.num;
          return (
            <div key={s.num} className="flex flex-col items-center gap-3">
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300",
                done ? "bg-white border-white text-black" :
                active ? "bg-black border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" :
                "bg-black border-white/10 text-white/30"
              )}>
                {done ? <CheckCircle size={20} weight="fill" /> : <Icon size={18} weight={active ? "fill" : "regular"} />}
              </div>
              <span className={clsx("text-xs font-bold uppercase tracking-widest",
                active || done ? "text-white" : "text-white/30"
              )}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
          {error}
        </div>
      )}

      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Step 1 */}
        {step === 1 && (
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-10 border-r border-white/5">
              <h2 className="text-2xl font-bold text-white tracking-tight mb-8">Configure your agent</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Agent Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 bg-white/[0.02] text-white placeholder-white/20 text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Welcome Message</label>
                  <textarea rows={3} value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 bg-white/[0.02] text-white placeholder-white/20 text-sm resize-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 w-10 rounded border border-white/10 cursor-pointer bg-transparent" />
                    <span className="text-sm text-white/50">Widget button & header color</span>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex justify-end">
                <button onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] group">
                  Continue <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            {/* Live Preview */}
            <div className="w-full md:w-80 bg-black p-8 flex items-end justify-center">
              <div className="w-full max-w-[240px] bg-[#0a0a0a] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
                <div className="h-12 flex items-center px-4 font-bold text-sm tracking-tight" style={{ backgroundColor: accentColor, color: accentColor === '#ffffff' ? '#000000' : '#ffffff' }}>{name}</div>
                <div className="flex-1 p-4 bg-[#050505] min-h-[150px]">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl rounded-tl-none text-xs text-white/70 w-[85%]">
                    {welcomeMessage}
                  </div>
                </div>
                <div className="p-3 border-t border-white/10 bg-[#050505]">
                  <div className="h-8 bg-white/5 border border-white/10 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="p-10">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Train your agent</h2>
            <p className="text-white/50 mb-10">Connect knowledge sources so your AI knows how to answer.</p>
            
            <div className="border border-white/10 rounded-xl overflow-hidden mb-10 bg-black">
              <div className="flex border-b border-white/10 bg-white/[0.02]">
                {(
                  [
                    { key: 'url' as const, label: 'Website URL', locked: !canUseUrlSources },
                    { key: 'pdf' as const, label: 'Upload PDF', locked: false },
                    { key: 'text' as const, label: 'Raw Text', locked: false },
                  ]
                ).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {
                      if (t.locked) {
                        show('Website URL ingestion', 'Starter');
                        return;
                      }
                      setTrainTab(t.key);
                    }}
                    className={clsx(
                      'flex-1 py-4 text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5',
                      trainTab === t.key
                        ? 'border-b-2 border-white text-white'
                        : t.locked
                          ? 'text-white/30'
                          : 'text-white/40 hover:text-white/70'
                    )}
                  >
                    {t.label}
                    {t.locked && <span className="text-[10px] text-amber-400/80">✦</span>}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {trainTab === 'url' && (
                  <>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-3">URL to Scrape</label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://example.com/docs"
                        className="flex-1 px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 bg-white/[0.02] text-white placeholder-white/20 text-sm transition-all"
                      />
                      <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors shrink-0 disabled:opacity-50"
                      >
                        {loading ? <Spinner className="animate-spin" size={18} /> : 'Sync'}
                      </button>
                    </div>
                    <p className="text-xs text-white/30 mt-3">We&apos;ll scrape the page and all linked sub-pages automatically.</p>
                  </>
                )}

                {trainTab === 'pdf' && (
                  <>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Upload Document</label>
                    <div className="flex gap-3 items-start">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt,.md,.csv,.json"
                        onChange={(e) => setTrainFile(e.target.files?.[0] ?? null)}
                        className="flex-1 text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-white file:text-black hover:file:bg-gray-200 file:cursor-pointer py-3"
                      />
                      <button
                        onClick={handleCreate}
                        disabled={loading || !trainFile}
                        className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors shrink-0 disabled:opacity-50"
                      >
                        {loading ? <Spinner className="animate-spin" size={18} /> : 'Upload'}
                      </button>
                    </div>
                    <p className="text-xs text-white/30 mt-3">PDF, DOCX, TXT, Markdown, CSV, or JSON — up to 25 MB.</p>
                  </>
                )}

                {trainTab === 'text' && (
                  <>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Raw Text Content</label>
                    <input
                      type="text"
                      value={textName}
                      onChange={(e) => setTextName(e.target.value)}
                      placeholder="Source name (e.g. FAQ)"
                      className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 bg-white/[0.02] text-white placeholder-white/20 text-sm transition-all mb-3"
                    />
                    <textarea
                      rows={5}
                      value={textBody}
                      onChange={(e) => setTextBody(e.target.value)}
                      placeholder="Paste raw text content here..."
                      className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 bg-white/[0.02] text-white placeholder-white/20 text-sm transition-all mb-3"
                    />
                    <button
                      onClick={handleCreate}
                      disabled={loading || !textName.trim() || !textBody.trim()}
                      className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {loading ? <Spinner className="animate-spin" size={18} /> : 'Add Text Source'}
                    </button>
                  </>
                )}

                {!canUseUrlSources && trainTab !== 'url' && (
                  <p className="text-xs text-amber-200/70 mt-4 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                    Website URL crawling is part of the Starter plan and above. On Free and Trial, upload a file or paste text.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(1)} className="px-6 py-3 text-white/40 font-bold hover:text-white transition-colors">← Back</button>
              <button onClick={handleCreate} disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-bold hover:bg-white/10 transition-colors group disabled:opacity-50">
                {loading ? <Spinner className="animate-spin" size={18} /> : null}
                {loading ? 'Creating...' : 'Skip for now'} <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && chatbotId && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-white text-black rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              <Code size={40} weight="duotone" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-3">Agent is live. 🎉</h2>
            <p className="text-white/50 mb-10 text-lg max-w-md mx-auto">
              Copy the snippet below and paste it just before the closing <code className="text-white/80 bg-white/10 px-1 rounded">&lt;/body&gt;</code> tag.
            </p>
            
            <div className="bg-black border border-white/10 rounded-xl p-6 text-left overflow-x-auto mb-10 font-mono text-sm shadow-inner">
              <div className="text-white/30 mb-1">{'<!-- DocWise Widget -->'}</div>
              <div className="text-blue-400">{'<script'}</div>
              <div className="pl-4 text-blue-300">{'src='}<span className="text-green-300">{`"${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"`}</span></div>
              <div className="pl-4 text-blue-300">{'data-chatbot-id='}<span className="text-green-300">{`"${chatbotId}"`}</span></div>
              <div className="pl-4 text-blue-300">{'defer'}</div>
              <div className="text-blue-400">{'></script>'}</div>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => {
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                navigator.clipboard.writeText(`<script src="${origin}/widget.js" data-chatbot-id="${chatbotId}" defer></script>`);
                toast.success('Snippet copied to clipboard.');
              }}
                className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-bold hover:bg-white/10 transition-colors">
                Copy Code
              </button>
              <button onClick={() => router.push(`/dashboard/chatbots/${chatbotId}`)}
                className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Open Dashboard →
              </button>
            </div>
          </div>
        )}

        {step === 3 && !chatbotId && (
          <div className="p-12 text-center">
            <Spinner className="animate-spin mx-auto" size={32} />
            <p className="text-white/50 mt-4">Creating your chatbot...</p>
          </div>
        )}
      </div>
    </div>
  );
}
