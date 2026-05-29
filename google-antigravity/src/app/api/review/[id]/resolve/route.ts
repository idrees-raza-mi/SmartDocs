import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { chunkText, batchGenerateEmbeddings } from '@/lib/embeddings';

// Resolve an unanswered-question entry. Stores the owner-provided answer as a
// new Text source so the bot will retrieve it on similar questions. This is
// the self-improving knowledge-base loop.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { chatbotId, question, answer } = body;
    if (!chatbotId || !question || !answer) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Ownership check.
    const { data: bot } = await supabaseAdmin
      .from('chatbots')
      .select('id, organizations!inner(user_id)')
      .eq('id', chatbotId)
      .single();
    const orgs = bot?.organizations as { user_id?: string } | { user_id?: string }[] | null;
    const orgObj = Array.isArray(orgs) ? orgs[0] : orgs;
    if (!bot || orgObj?.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Compose a Q/A document so the embedding captures both the question and
    // the answer — boosts retrieval for paraphrases of the same question.
    const document = `Q: ${question}\nA: ${answer}`;

    const { data: source, error: sourceError } = await supabaseAdmin
      .from('sources')
      .insert({
        chatbot_id: chatbotId,
        type: 'text',
        name: `Q: ${question.slice(0, 60)}`,
        status: 'processing',
      })
      .select()
      .single();
    if (sourceError || !source) throw sourceError;

    const chunks = chunkText(document, 400);
    const embeddings = await batchGenerateEmbeddings(chunks);
    const rows = chunks.map((content, i) => ({
      source_id: source.id,
      chatbot_id: chatbotId,
      content,
      embedding: embeddings[i],
      token_count: Math.ceil(content.length / 4),
    }));
    await supabaseAdmin.from('chunks').insert(rows);
    await supabaseAdmin
      .from('sources')
      .update({ status: 'ready', chunk_count: chunks.length, last_synced_at: new Date().toISOString() })
      .eq('id', source.id);

    // Mark the question resolved.
    await supabaseAdmin
      .from('unanswered_questions')
      .update({
        resolved_at: new Date().toISOString(),
        answer,
        source_id: source.id,
      })
      .eq('id', id);

    return NextResponse.json({ ok: true, sourceId: source.id });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Resolve failed';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
