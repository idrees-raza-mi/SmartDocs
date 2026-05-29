'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/lib/toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Spinner, WarningCircle, Upload, Trash, Download, Camera } from '@phosphor-icons/react';

type State = {
  loading: boolean;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  initials: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<State>({
    loading: true,
    email: '',
    fullName: '',
    avatarUrl: null,
    initials: '?',
  });
  const [pendingName, setPendingName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }
        const { data: pf } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();

        const name = pf?.full_name ?? user.user_metadata?.company_name ?? '';
        const initials = (name || user.email || '?')
          .split(/\s+|@/)
          .filter(Boolean)
          .slice(0, 2)
          .map((s: string) => s[0].toUpperCase())
          .join('');

        setState({
          loading: false,
          email: user.email ?? '',
          fullName: name,
          avatarUrl: pf?.avatar_url ?? null,
          initials,
        });
        setPendingName(name);
        setNewEmail(user.email ?? '');
      } catch {
        toast.error('Failed to load profile.');
        setState((s) => ({ ...s, loading: false }));
      }
    })();
  }, []);

  const saveName = async () => {
    setSaving('name');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: pendingName.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      setState((s) => ({ ...s, fullName: pendingName.trim() }));
      toast.success('Name updated.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save name');
    } finally {
      setSaving(null);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar must be under 2MB.');
      return;
    }
    setSaving('avatar');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
      const { url } = await res.json();
      setState((s) => ({ ...s, avatarUrl: url }));
      toast.success('Avatar updated.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setSaving(null);
    }
  };

  const changeEmail = async () => {
    setSaving('email');
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      toast.success('Confirmation email sent. Check both inboxes.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update email');
    } finally {
      setSaving(null);
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!currentPassword) {
      toast.error('Enter your current password.');
      return;
    }
    setSaving('password');
    try {
      // Re-auth: sign in again with current password to verify identity.
      const { error: signinErr } = await supabase.auth.signInWithPassword({
        email: state.email,
        password: currentPassword,
      });
      if (signinErr) throw new Error('Current password is incorrect.');

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update password');
    } finally {
      setSaving(null);
    }
  };

  const exportData = async () => {
    setSaving('export');
    try {
      const res = await fetch('/api/profile/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartdocs-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setSaving(null);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== state.email) {
      toast.error('Type your email exactly to confirm.');
      return;
    }
    setSaving('delete');
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
      await supabase.auth.signOut();
      router.push('/');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete account');
      setSaving(null);
    }
  };

  if (state.loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex justify-center">
        <Spinner size={28} className="animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>
        <p className="text-sm text-white/40 mt-1">Manage your account, preferences, and personal data.</p>
      </div>

      {/* Avatar */}
      <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-4">Profile photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {state.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={state.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-white/10" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/10 flex items-center justify-center text-2xl font-bold text-white">
                {state.initials}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg"
              title="Change avatar"
            >
              <Camera size={14} weight="bold" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAvatarUpload(f);
              }}
            />
          </div>
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={saving === 'avatar'}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
            >
              {saving === 'avatar' ? <Spinner className="animate-spin" /> : <Upload size={14} />}
              Upload photo
            </button>
            <p className="text-xs text-white/40 mt-2">PNG, JPG or WebP, max 2MB.</p>
          </div>
        </div>
      </section>

      {/* Name */}
      <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-4">Display name</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={pendingName}
            onChange={(e) => setPendingName(e.target.value)}
            className="flex-1 px-4 py-2 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
            placeholder="Your name"
          />
          <button
            onClick={saveName}
            disabled={saving === 'name' || pendingName === state.fullName}
            className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving === 'name' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </section>

      {/* Theme */}
      <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-4">Theme</h2>
        <ThemeToggle variant="segmented" />
        <p className="text-xs text-white/40 mt-3">Choose how the dashboard looks. System matches your OS.</p>
      </section>

      {/* Email */}
      <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-4">Email address</h2>
        <div className="flex gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 px-4 py-2 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
          />
          <button
            onClick={changeEmail}
            disabled={saving === 'email' || newEmail === state.email}
            className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving === 'email' ? 'Sending…' : 'Change email'}
          </button>
        </div>
        <p className="text-xs text-white/40 mt-2">We&apos;ll send a confirmation link to both the old and new address.</p>
      </section>

      {/* Password */}
      <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-4">Password</h2>
        <div className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="w-full px-4 py-2 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min. 8 chars)"
            className="w-full px-4 py-2 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-2 border border-white/10 bg-white/[0.02] text-white rounded-lg focus:outline-none focus:border-white/30 text-sm"
          />
          <button
            onClick={changePassword}
            disabled={saving === 'password'}
            className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving === 'password' ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </section>

      {/* Data export */}
      <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white mb-1">Export your data</h2>
          <p className="text-sm text-white/50">Download a JSON archive of your chatbots, sources, and conversations.</p>
        </div>
        <button
          onClick={exportData}
          disabled={saving === 'export'}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
        >
          {saving === 'export' ? <Spinner className="animate-spin" /> : <Download size={14} />}
          Export
        </button>
      </section>

      {/* Delete */}
      <section className="border border-red-500/30 rounded-2xl p-6 bg-red-500/5">
        <h2 className="font-bold text-red-400 mb-1 flex items-center gap-2">
          <WarningCircle size={20} weight="fill" /> Delete account
        </h2>
        <p className="text-sm text-red-300/70 mb-4">
          Permanently deletes your account, organization, chatbots, sources, and conversations. This cannot be undone.
          Type your email <span className="font-mono text-red-300">{state.email}</span> to confirm.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={state.email}
            className="flex-1 px-4 py-2 border border-red-500/30 bg-red-500/5 text-white rounded-lg focus:outline-none focus:border-red-500/60 text-sm"
          />
          <button
            onClick={deleteAccount}
            disabled={deleteConfirm !== state.email || saving === 'delete'}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving === 'delete' ? <Spinner className="animate-spin" /> : <Trash size={14} />}
            Delete account
          </button>
        </div>
      </section>
    </div>
  );
}
