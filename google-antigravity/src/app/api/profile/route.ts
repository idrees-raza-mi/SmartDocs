import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit';
import { emailFingerprint } from '@/lib/email-fingerprint';

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const update: { full_name?: string; theme?: 'light' | 'dark' | 'system' } = {};
    if (typeof body.full_name === 'string') update.full_name = body.full_name.slice(0, 100);
    if (body.theme === 'light' || body.theme === 'dark' || body.theme === 'system') update.theme = body.theme;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({ user_id: user.id, ...update, updated_at: new Date().toISOString() });

    if (error) throw error;

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (org) {
      await logAudit({
        orgId: org.id,
        userId: user.id,
        action: 'profile.update',
        entityType: 'profile',
        entityId: user.id,
        metadata: update,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Cascade everything owned by this user.
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (org) {
      const { data: bots } = await supabaseAdmin
        .from('chatbots')
        .select('id')
        .eq('org_id', org.id);

      const chatbotIds = (bots ?? []).map((b) => b.id);

      if (chatbotIds.length > 0) {
        const { data: convs } = await supabaseAdmin
          .from('conversations')
          .select('id')
          .in('chatbot_id', chatbotIds);
        const convIds = (convs ?? []).map((c) => c.id);
        if (convIds.length > 0) {
          await supabaseAdmin.from('messages').delete().in('conversation_id', convIds);
        }
        await supabaseAdmin.from('conversations').delete().in('chatbot_id', chatbotIds);
        await supabaseAdmin.from('chunks').delete().in('chatbot_id', chatbotIds);
        await supabaseAdmin.from('sources').delete().in('chatbot_id', chatbotIds);
        await supabaseAdmin.from('chatbots').delete().eq('org_id', org.id);
      }

      await supabaseAdmin.from('audit_log').delete().eq('org_id', org.id);
      await supabaseAdmin.from('api_keys').delete().eq('org_id', org.id);
      await supabaseAdmin.from('webhook_subscriptions').delete().eq('org_id', org.id);
      await supabaseAdmin.from('organizations').delete().eq('id', org.id);
    }

    await supabaseAdmin.from('profiles').delete().eq('user_id', user.id);

    // Trial-abuse prevention: record a one-way fingerprint of this email
    // BEFORE deleting the auth user, so the same person can't re-register
    // for unlimited 7-day trials by repeatedly deleting their account.
    if (user.email) {
      const fingerprint = emailFingerprint(user.email);
      await supabaseAdmin
        .from('trial_blocklist')
        .upsert(
          { email_hash: fingerprint, reason: 'previous_account_deleted' },
          { onConflict: 'email_hash' }
        );
    }

    await supabaseAdmin.auth.admin.deleteUser(user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
