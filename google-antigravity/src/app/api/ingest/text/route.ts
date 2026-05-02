import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { chunkText, batchGenerateEmbeddings } from '@/lib/embeddings';

export async function POST(req: Request) {
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
        name: name,
        status: 'processing'
      })
      .select()
      .single();

    if (sourceError || !source) throw sourceError;

    const chunks = chunkText(content, 400);
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

    return NextResponse.json({ chunkCount: chunks.length, characterCount: content.length });
  } catch (error: any) {
    console.error('Text ingest error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
