import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';

type ChatbotUpdate = Database['public']['Tables']['chatbots']['Update'];

const ALLOWED_FIELDS = [
  'name',
  'welcome_message',
  'placeholder_text',
  'system_prompt',
  'accent_color',
  'allowed_domains',
  'show_branding',
  'is_active',
  'widget_position',
  'lead_capture_mode',
  'gdpr_consent',
  'suggested_questions',
  'slack_webhook_url',
  'notify_on_escalation',
] as const;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const update: ChatbotUpdate = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) (update as Record<string, unknown>)[key] = body[key];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  if ('show_branding' in update) {
    const { data: org } = await supabaseAdmin
      .from('chatbots')
      .select('organizations(plan)')
      .eq('id', id)
      .single();
    const o = org?.organizations as { plan?: string } | { plan?: string }[] | null | undefined;
    const plan = Array.isArray(o) ? o[0]?.plan : o?.plan;
    if (update.show_branding === false && plan !== 'pro' && plan !== 'business') {
      return NextResponse.json({ error: 'Removing branding requires the Pro plan.' }, { status: 403 });
    }
  }

  const { data: owned } = await supabaseAdmin
    .from('chatbots')
    .select('id, organizations!inner(user_id)')
    .eq('id', id)
    .single();
  const ownerOrg = owned?.organizations as { user_id?: string } | { user_id?: string }[] | null | undefined;
  const ownerId = Array.isArray(ownerOrg) ? ownerOrg[0]?.user_id : ownerOrg?.user_id;
  if (!owned || ownerId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from('chatbots')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ chatbot: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin.rpc('delete_chatbot_cascade', {
    p_chatbot_id: id,
    p_user_id: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
