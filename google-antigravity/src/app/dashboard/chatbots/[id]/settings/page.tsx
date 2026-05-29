'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { WarningCircle, CheckCircle, Spinner } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import { usePlanAccess } from '@/hooks/usePlanAccess';

type ChatbotSettings = {
  id: string;
  name: string;
  welcome_message: string;
  placeholder_text: string;
  system_prompt: string | null;
  show_branding: boolean;
};

export default function SettingsTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const { checkAccess } = usePlanAccess();
  const canRemoveBranding = checkAccess('customBranding').allowed;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatbot, setChatbot] = useState<ChatbotSettings | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase
      .from('chatbots')
      .select('id, name, welcome_message, placeholder_text, system_prompt, show_branding')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setError('Failed to load chatbot.');
        else setChatbot(data);
        setLoading(false);
      });
  }, [id]);

  const update = (patch: Partial<ChatbotSettings>) => {
    setChatbot((c) => (c ? { ...c, ...patch } : c));
  };

  const save = async (fields: Partial<ChatbotSettings>, successMsg: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/chatbots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSavedMessage(successMsg);
      setTimeout(() => setSavedMessage(null), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!chatbot || deleteInput.trim() !== chatbot.name) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/chatbots/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      router.push('/dashboard/chatbots');
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="animate-spin text-white/40" size={24} />
      </div>
    );
  }

  if (!chatbot) {
    return <div className="text-red-400 text-sm">{error || 'Chatbot not found.'}</div>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
          <WarningCircle size={18} weight="fill" /> {error}
        </div>
      )}
      {savedMessage && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400 text-sm">
          <CheckCircle size={18} weight="fill" /> {savedMessage}
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-6">General</h3>
        <div className="space-y-6">
          <Field
            label="Chatbot Name"
            value={chatbot.name}
            onChange={(v) => update({ name: v })}
          />
          <Field
            label="Welcome Message"
            value={chatbot.welcome_message}
            onChange={(v) => update({ welcome_message: v })}
          />
          <Field
            label="Input Placeholder"
            value={chatbot.placeholder_text}
            onChange={(v) => update({ placeholder_text: v })}
          />
          <button
            disabled={saving}
            onClick={() =>
              save(
                {
                  name: chatbot.name,
                  welcome_message: chatbot.welcome_message,
                  placeholder_text: chatbot.placeholder_text,
                },
                'Saved general settings'
              )
            }
            className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-6">AI Personality</h3>
        <label className="block text-sm font-medium text-white/60 mb-2">
          System Prompt Instructions
        </label>
        <textarea
          rows={4}
          value={chatbot.system_prompt ?? ''}
          onChange={(e) => update({ system_prompt: e.target.value })}
          placeholder="E.g. You are a cheerful customer support rep. Always use emojis."
          className="w-full px-4 py-2 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm mb-4"
        />
        <button
          disabled={saving}
          onClick={() => save({ system_prompt: chatbot.system_prompt }, 'Updated AI personality')}
          className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Update AI'}
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white mb-1 flex items-center gap-2">
            Remove Branding {!canRemoveBranding && <span className="text-amber-500/80 text-xs">✦</span>}
          </h3>
          <p className="text-sm text-white/50">Hide the &quot;Powered by DocWise&quot; badge on your widget.</p>
        </div>
        {canRemoveBranding ? (
          <button
            onClick={() =>
              save({ show_branding: !chatbot.show_branding }, chatbot.show_branding ? 'Branding hidden' : 'Branding shown')
                .then(() => update({ show_branding: !chatbot.show_branding }))
            }
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-colors"
          >
            {chatbot.show_branding ? 'Hide Branding' : 'Show Branding'}
          </button>
        ) : (
          <span className="px-4 py-2 bg-white/5 text-white/40 rounded-lg text-sm font-medium">Pro Plan Required</span>
        )}
      </div>

      <div className="border border-red-500/30 rounded-2xl p-6 bg-red-500/5">
        <h3 className="font-bold text-red-400 mb-1 flex items-center gap-2">
          <WarningCircle size={20} weight="fill" /> Danger Zone
        </h3>
        <p className="text-sm text-red-300/80 mb-4">
          Deleting this chatbot will permanently remove all of its sources, chunks, and conversation history. This action cannot be undone.
        </p>
        <button
          onClick={() => setDeleteOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
        >
          Delete Chatbot
        </button>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Delete chatbot?</h3>
            <p className="text-sm text-white/60 mb-4">
              This will permanently delete <span className="text-white font-semibold">{chatbot.name}</span> and all of its data.
              Type the chatbot name to confirm.
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder={chatbot.name}
              className="w-full px-4 py-2 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-red-500/40 text-sm mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteInput('');
                }}
                className="px-4 py-2 text-white/60 hover:text-white text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteInput.trim() !== chatbot.name || deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting…' : 'Delete forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
      />
    </div>
  );
}
