'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Spinner, CheckCircle } from '@phosphor-icons/react';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');

        const { data: org } = await supabase
          .from('organizations')
          .select('name')
          .eq('user_id', user.id)
          .single();

        if (org) setName(org.name);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('organizations')
        .update({ name })
        .eq('user_id', user.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner className="animate-spin text-white/40" size={24} /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-sm text-white/40 mt-1">Manage your organization settings.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-white">Organization</h3>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Organization Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
          <input
            type="text"
            value={email}
            disabled
            className="w-full px-4 py-2.5 border border-white/10 bg-white/[0.02] text-white/40 rounded-lg text-sm cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? <><CheckCircle size={16} weight="bold" /> Saved</> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
