import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let chatbots: unknown = [];
    let sources: unknown = [];
    let conversations: unknown = [];
    let messages: unknown = [];

    if (org) {
      const { data: bots } = await supabaseAdmin.from('chatbots').select('*').eq('org_id', org.id);
      chatbots = bots ?? [];
      const ids = (bots ?? []).map((b) => b.id);
      if (ids.length > 0) {
        const [{ data: s }, { data: c }] = await Promise.all([
          supabaseAdmin.from('sources').select('*').in('chatbot_id', ids),
          supabaseAdmin.from('conversations').select('*').in('chatbot_id', ids),
        ]);
        sources = s ?? [];
        conversations = c ?? [];
        const convIds = (c ?? []).map((x) => x.id);
        if (convIds.length > 0) {
          const { data: m } = await supabaseAdmin.from('messages').select('*').in('conversation_id', convIds);
          messages = m ?? [];
        }
      }
    }

    const archive = {
      exportedAt: new Date().toISOString(),
      user: { id: user.id, email: user.email },
      organization: org,
      chatbots,
      sources,
      conversations,
      messages,
    };

    return new Response(JSON.stringify(archive, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="smartdocs-export.json"',
      },
    });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
