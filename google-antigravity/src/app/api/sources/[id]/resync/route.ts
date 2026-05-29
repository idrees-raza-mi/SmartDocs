import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parseUrl } from '@/lib/parsers/url';
import { chunkText, batchGenerateEmbeddings } from '@/lib/embeddings';
import { contentHash } from '@/lib/hash';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: source } = await supabaseAdmin
      .from('sources')
      .select('id, type, url, content_hash, chatbot_id, chatbots!inner(organizations!inner(user_id))')
      .eq('id', id)
      .single();

    if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

    const chat = source.chatbots as { organizations?: { user_id?: string } | { user_id?: string }[] } | { organizations?: { user_id?: string } | { user_id?: string }[] }[];
    const chatObj = Array.isArray(chat) ? chat[0] : chat;
    const orgs = chatObj?.organizations;
    const orgObj = Array.isArray(orgs) ? orgs[0] : orgs;
    if (orgObj?.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (source.type !== 'url' || !source.url) {
      return NextResponse.json({ error: 'Only URL sources can be re-synced.' }, { status: 400 });
    }

    await supabaseAdmin.from('sources').update({ status: 'processing' }).eq('id', source.id);

    // Background work — respond fast, do the heavy lifting after.
    (async () => {
      try {
        const text = await parseUrl(source.url!);
        const hash = contentHash(text);

        if (source.content_hash && source.content_hash === hash) {
          await supabaseAdmin
            .from('sources')
            .update({ status: 'ready', last_synced_at: new Date().toISOString() })
            .eq('id', source.id);
          return;
        }

        await supabaseAdmin.from('chunks').delete().eq('source_id', source.id);
        const chunks = chunkText(text, 400);
        if (chunks.length === 0) {
          await supabaseAdmin.from('sources').update({ status: 'error' }).eq('id', source.id);
          return;
        }
        const embeddings = await batchGenerateEmbeddings(chunks);
        const rows = chunks.map((content, i) => ({
          source_id: source.id,
          chatbot_id: source.chatbot_id,
          content,
          embedding: embeddings[i],
          token_count: Math.ceil(content.length / 4),
        }));
        await supabaseAdmin.from('chunks').insert(rows);
        await supabaseAdmin
          .from('sources')
          .update({
            status: 'ready',
            chunk_count: chunks.length,
            content_hash: hash,
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', source.id);
      } catch (err) {
        console.error('[resync] background failed:', err);
        await supabaseAdmin.from('sources').update({ status: 'error' }).eq('id', source.id);
      }
    })();

    return NextResponse.json({ ok: true });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Resync failed';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
