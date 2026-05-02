import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parseUrl } from '@/lib/parsers/url';
import { chunkText, batchGenerateEmbeddings } from '@/lib/embeddings';

export async function POST(req: Request) {
  try {
    const { chatbotId, url } = await req.json();

    if (!chatbotId || !url) {
      return NextResponse.json({ error: 'Missing chatbotId or url' }, { status: 400 });
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

    const text = await parseUrl(url);
    const chunks = chunkText(text, 400);
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

    return NextResponse.json({ chunkCount: chunks.length, characterCount: text.length });
  } catch (error: any) {
    console.error('URL ingest error:', error);
    await supabaseAdmin.from('sources').update({ status: 'error' }).eq('name', await req.json().then(j => j.url).catch(()=>''));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
