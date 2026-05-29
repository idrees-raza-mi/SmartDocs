import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parseUrl } from '@/lib/parsers/url';
import { chunkText, batchGenerateEmbeddings } from '@/lib/embeddings';
import { effectivePlan } from '@/lib/plan';

export async function POST(req: Request) {
  let sourceId: string | null = null;
  try {
    const { chatbotId, url } = await req.json();

    if (!chatbotId || !url) {
      return NextResponse.json({ error: 'Missing chatbotId or url' }, { status: 400 });
    }

    // Plan gate: URL ingestion is paid-tier only.
    const { data: planRow } = await supabaseAdmin
      .from('chatbots')
      .select('organizations(plan, trial_ends_at)')
      .eq('id', chatbotId)
      .single();
    const orgs = planRow?.organizations as { plan?: string; trial_ends_at?: string | null } | { plan?: string; trial_ends_at?: string | null }[] | null;
    const org = Array.isArray(orgs) ? orgs[0] : orgs;
    if (org) {
      const plan = effectivePlan({ plan: org.plan ?? 'free', trial_ends_at: org.trial_ends_at ?? null });
      if (plan === 'free' || plan === 'trial') {
        return NextResponse.json(
          { error: 'URL ingestion requires the Starter plan or above. Upload a file or paste text instead.' },
          { status: 403 }
        );
      }
    }

    const { data: existing } = await supabaseAdmin
      .from('sources')
      .select('id')
      .eq('chatbot_id', chatbotId)
      .eq('url', url)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'This URL is already a source for this chatbot.' },
        { status: 409 }
      );
    }

    const { data: source, error: sourceError } = await supabaseAdmin
      .from('sources')
      .insert({
        chatbot_id: chatbotId,
        type: 'url',
        name: url,
        url: url,
        status: 'processing'
      })
      .select()
      .single();

    if (sourceError || !source) throw sourceError;
    sourceId = source.id;

    const text = await parseUrl(url);
    const chunks = chunkText(text, 400);

    if (chunks.length === 0) {
      await supabaseAdmin
        .from('sources')
        .update({ status: 'error' })
        .eq('id', source.id);
      return NextResponse.json({ error: 'No content extracted from URL' }, { status: 422 });
    }

    const embeddings = await batchGenerateEmbeddings(chunks);

    const chunksToInsert = chunks.map((content, i) => ({
      source_id: source.id,
      chatbot_id: chatbotId,
      content,
      embedding: embeddings[i],
      token_count: Math.ceil(content.length / 4)
    }));

    await supabaseAdmin.from('chunks').insert(chunksToInsert);

    await supabaseAdmin
      .from('sources')
      .update({ status: 'ready', chunk_count: chunks.length })
      .eq('id', source.id);

    return NextResponse.json({ sourceId: source.id, chunkCount: chunks.length, characterCount: text.length });
  } catch (error: unknown) {
    console.error('URL ingest error:', error);
    if (sourceId) {
      await supabaseAdmin.from('sources').update({ status: 'error' }).eq('id', sourceId);
    }
    const message = error instanceof Error ? error.message : 'URL ingest failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
