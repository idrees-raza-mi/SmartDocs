import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parsePdf } from '@/lib/parsers/pdf';
import { parseDocx } from '@/lib/parsers/docx';
import { chunkText, batchGenerateEmbeddings } from '@/lib/embeddings';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const chatbotId = formData.get('chatbotId') as string;

    if (!file || !chatbotId) {
      return NextResponse.json({ error: 'Missing file or chatbotId' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';
    let type = 'pdf';

    if (file.name.endsWith('.pdf')) {
      text = await parsePdf(buffer);
    } else if (file.name.endsWith('.docx')) {
      type = 'docx';
      text = await parseDocx(buffer);
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const { data: source, error: sourceError } = await supabaseAdmin
      .from('sources')
      .insert({
        chatbot_id: chatbotId,
        type: type,
        name: file.name,
        status: 'processing'
      })
      .select()
      .single();

    if (sourceError || !source) throw sourceError;

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
    console.error('File ingest error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
