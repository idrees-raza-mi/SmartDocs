import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parsePdf } from '@/lib/parsers/pdf';
import { parseDocx } from '@/lib/parsers/docx';
import { parsePlain, parseMarkdown, parseCsv, parseJson } from '@/lib/parsers/text';
import { chunkText, batchGenerateEmbeddings } from '@/lib/embeddings';
import { contentHash } from '@/lib/hash';

const MAX_FILE_BYTES = 25 * 1024 * 1024;

type SourceType = 'pdf' | 'docx' | 'txt' | 'md' | 'csv' | 'json';

function detectType(name: string): SourceType | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.txt')) return 'txt';
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'md';
  if (lower.endsWith('.csv') || lower.endsWith('.tsv')) return 'csv';
  if (lower.endsWith('.json')) return 'json';
  return null;
}

async function extract(type: SourceType, buffer: Buffer): Promise<string> {
  switch (type) {
    case 'pdf': return parsePdf(buffer);
    case 'docx': return parseDocx(buffer);
    case 'txt': return parsePlain(buffer);
    case 'md': return parseMarkdown(buffer);
    case 'csv': return parseCsv(buffer);
    case 'json': return parseJson(buffer);
  }
}

export async function POST(req: Request) {
  let sourceId: string | null = null;
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const chatbotId = formData.get('chatbotId') as string | null;

    if (!file || !chatbotId) {
      return NextResponse.json({ error: 'Missing file or chatbotId' }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 413 });
    }

    const type = detectType(file.name);
    if (!type) {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, DOCX, TXT, MD, CSV, or JSON.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extract(type, buffer);
    const hash = contentHash(text);

    const { data: existing } = await supabaseAdmin
      .from('sources')
      .select('id')
      .eq('chatbot_id', chatbotId)
      .eq('content_hash', hash)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'This file content was already added.' }, { status: 409 });
    }

    const { data: source, error: sourceError } = await supabaseAdmin
      .from('sources')
      .insert({
        chatbot_id: chatbotId,
        type,
        name: file.name,
        status: 'processing',
        content_hash: hash,
      })
      .select()
      .single();
    if (sourceError || !source) throw sourceError;
    sourceId = source.id;

    const chunks = chunkText(text, 400);
    if (chunks.length === 0) {
      await supabaseAdmin.from('sources').update({ status: 'error' }).eq('id', source.id);
      return NextResponse.json({ error: 'No content extracted from file' }, { status: 422 });
    }

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

    return NextResponse.json({ sourceId: source.id, chunkCount: chunks.length, characterCount: text.length });
  } catch (error: unknown) {
    console.error('File ingest error:', error);
    if (sourceId) {
      await supabaseAdmin.from('sources').update({ status: 'error' }).eq('id', sourceId);
    }
    const message = error instanceof Error ? error.message : 'File ingest failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
