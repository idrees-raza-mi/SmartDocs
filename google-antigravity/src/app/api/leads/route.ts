import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'edge';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { chatbotId, sessionId, email, name } = await req.json();
    if (!chatbotId || !sessionId || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
    }

    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('chatbot_id', chatbotId)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404, headers: corsHeaders });
    }

    await supabaseAdmin
      .from('conversations')
      .update({ lead_email: email, lead_name: name ?? null })
      .eq('id', conv.id);

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Lead capture failed';
    return NextResponse.json({ error: m }, { status: 500, headers: corsHeaders });
  }
}
