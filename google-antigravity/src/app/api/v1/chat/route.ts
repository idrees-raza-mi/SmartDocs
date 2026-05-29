import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hashApiKey } from '@/lib/api-keys';

// Public REST API. Same shape as the widget endpoint but authenticated by
// API key — meant for headless integrations. Returns JSON, not a stream.
// Runs on Node.js because the API-key hash helper uses Node's crypto module;
// this route is a thin wrapper around the (edge) /api/chat endpoint, so the
// latency hit is negligible.

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization');
    const m = auth?.match(/^Bearer\s+(dw_live_[\w-]+)$/i);
    if (!m) return NextResponse.json({ error: 'Missing or malformed API key' }, { status: 401 });

    const keyHash = hashApiKey(m[1]);
    const { data: key } = await supabaseAdmin
      .from('api_keys')
      .select('id, org_id, revoked_at')
      .eq('key_hash', keyHash)
      .maybeSingle();

    if (!key || key.revoked_at) {
      return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401 });
    }

    // Record usage (fire-and-forget).
    supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', key.id)
      .then(() => {});

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    const { chatbotId, message, sessionId } = body;
    if (!chatbotId || !message || !sessionId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Verify chatbot belongs to the API key's org
    const { data: bot } = await supabaseAdmin
      .from('chatbots')
      .select('id, org_id')
      .eq('id', chatbotId)
      .maybeSingle();
    if (!bot || bot.org_id !== key.org_id) {
      return NextResponse.json({ error: 'Chatbot not accessible' }, { status: 403 });
    }

    // Forward to the streaming endpoint and accumulate the response server-side.
    const origin = req.headers.get('origin') || `${new URL(req.url).origin}`;
    const upstream = await fetch(`${origin}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatbotId, message, sessionId }),
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'Upstream chat failed' }, { status: 502 });
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    let done = false;
    while (!done) {
      const r = await reader.read();
      if (r.done) { done = true; break; }
      full += decoder.decode(r.value, { stream: true });
    }

    const metaIdx = full.indexOf('__DOCWISE_META__');
    const text = metaIdx >= 0 ? full.slice(0, metaIdx).trim() : full.trim();
    let meta: { sources?: string[]; escalated?: boolean } = {};
    if (metaIdx >= 0) {
      try { meta = JSON.parse(full.slice(metaIdx + '__DOCWISE_META__'.length).trim()); } catch {}
    }

    return NextResponse.json({ message: text, sources: meta.sources ?? [], escalated: !!meta.escalated });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
