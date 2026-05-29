import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function userOwnsConversation(userId: string, conversationId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('conversations')
    .select('id, chatbots!inner(organizations!inner(user_id))')
    .eq('id', conversationId)
    .single();
  if (!data) return false;
  const chat = data.chatbots as { organizations?: { user_id?: string } | { user_id?: string }[] } | { organizations?: { user_id?: string } | { user_id?: string }[] }[] | null;
  const chatObj = Array.isArray(chat) ? chat[0] : chat;
  const orgs = chatObj?.organizations;
  const orgObj = Array.isArray(orgs) ? orgs[0] : orgs;
  return orgObj?.user_id === userId;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (typeof body.resolved !== 'boolean') {
    return NextResponse.json({ error: 'resolved must be boolean' }, { status: 400 });
  }

  if (!(await userOwnsConversation(user.id, id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from('conversations')
    .update({ resolved: body.resolved })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
