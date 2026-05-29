import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { chunkText, batchGenerateEmbeddings } from '@/lib/embeddings';

export async function POST(req: Request) {
  let sourceId: string | null = null;
  try {
    const { chatbotId, name, content } = await req.json();

    if (!chatbotId || !name || !content) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { data: source, error: sourceError } = await supabaseAdmin
      .from('sources')
      .insert({
        chatbot_id: chatbotId,
        type: 'text',
        name,
        status: 'processing'
      })
      .select()
      .single();

    if (sourceError || !source) throw sourceError;
    sourceId = source.id;

    const chunks = chunkText(content, 400);

    if (chunks.length === 0) {
      await supabaseAdmin.from('sources').update({ status: 'error' }).eq('id', source.id);
      return NextResponse.json({ error: 'No content to embed' }, { status: 422 });
    }

    const embeddings = await batchGenerateEmbeddings(chunks);

    const chunksToInsert = chunks.map((chunkContent, i) => ({
      source_id: source.id,
      chatbot_id: chatbotId,
      content: chunkContent,
      embedding: embeddings[i],
      token_count: Math.ceil(chunkContent.length / 4)
    }));

    await supabaseAdmin.from('chunks').insert(chunksToInsert);

    await supabaseAdmin
      .from('sources')
      .update({ status: 'ready', chunk_count: chunks.length })
      .eq('id', source.id);

    return NextResponse.json({ sourceId: source.id, chunkCount: chunks.length, characterCount: content.length });
  } catch (error: unknown) {
    console.error('Text ingest error:', error);
    if (sourceId) {
      await supabaseAdmin.from('sources').update({ status: 'error' }).eq('id', sourceId);
    }
    const message = error instanceof Error ? error.message : 'Text ingest failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
