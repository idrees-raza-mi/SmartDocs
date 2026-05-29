import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parseUrl } from '@/lib/parsers/url';
import { chunkText, batchGenerateEmbeddings } from '@/lib/embeddings';
import { PLAN_LIMITS, type PlanType } from '@/lib/constants';

const MAX_PARALLEL = 3;

function extractUrlsFromSitemap(xml: string): string[] {
  const urls = new Set<string>();
  // Simple regex extractor — handles standard sitemaps + sitemap indexes (loc tags).
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) urls.add(m[1].trim());
  return Array.from(urls);
}

async function processUrl(chatbotId: string, url: string): Promise<'added' | 'skipped' | 'failed'> {
  try {
    const { data: existing } = await supabaseAdmin
      .from('sources')
      .select('id')
      .eq('chatbot_id', chatbotId)
      .eq('url', url)
      .maybeSingle();

    if (existing) return 'skipped';

    const { data: source } = await supabaseAdmin
      .from('sources')
      .insert({ chatbot_id: chatbotId, type: 'url', name: url, url, status: 'processing' })
      .select()
      .single();
    if (!source) return 'failed';

    try {
      const text = await parseUrl(url);
      const chunks = chunkText(text, 400);
      if (chunks.length === 0) {
        await supabaseAdmin.from('sources').update({ status: 'error' }).eq('id', source.id);
        return 'failed';
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
      return 'added';
    } catch (innerErr) {
      console.error('[sitemap] processUrl failed:', url, innerErr);
      await supabaseAdmin.from('sources').update({ status: 'error' }).eq('id', source.id);
      return 'failed';
    }
  } catch (err) {
    console.error('[sitemap] unexpected:', err);
    return 'failed';
  }
}

async function processAll(chatbotId: string, urls: string[]) {
  let i = 0;
  const counters = { added: 0, skipped: 0, failed: 0 };
  const workers = Array.from({ length: Math.min(MAX_PARALLEL, urls.length) }, async () => {
    while (i < urls.length) {
      const idx = i++;
      const result = await processUrl(chatbotId, urls[idx]);
      counters[result]++;
    }
  });
  await Promise.all(workers);
  return counters;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { chatbotId, sitemapUrl } = body as { chatbotId?: string; sitemapUrl?: string };
    if (!chatbotId || !sitemapUrl) {
      return NextResponse.json({ error: 'Missing chatbotId or sitemapUrl' }, { status: 400 });
    }

    // Plan gate
    const { data: chatbot } = await supabaseAdmin
      .from('chatbots')
      .select('id, org_id, organizations(plan)')
      .eq('id', chatbotId)
      .single();
    if (!chatbot) return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    const org = Array.isArray(chatbot.organizations) ? chatbot.organizations[0] : chatbot.organizations;
    const plan = (org?.plan ?? 'trial') as PlanType;
    const max = PLAN_LIMITS[plan].sitemapMaxUrls;
    if (max === 0) {
      return NextResponse.json({ error: 'Sitemap crawling requires the Pro plan.' }, { status: 403 });
    }

    // Fetch sitemap.xml
    let xml: string;
    try {
      const res = await fetch(sitemapUrl, { headers: { 'User-Agent': 'SmartDocs-Crawler/1.0' } });
      if (!res.ok) throw new Error(`Sitemap returned ${res.status}`);
      xml = await res.text();
    } catch (e) {
      return NextResponse.json({ error: `Could not fetch sitemap: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 502 });
    }

    let urls = extractUrlsFromSitemap(xml).filter((u) => !u.endsWith('.xml')); // skip nested sitemaps for now
    if (urls.length === 0) {
      return NextResponse.json({ error: 'No URLs found in sitemap.' }, { status: 422 });
    }
    urls = urls.slice(0, max);

    // Fire-and-forget processing; respond immediately so the dashboard sees the
    // "processing" rows accumulating in the sources list.
    processAll(chatbotId, urls).catch((e) => console.error('[sitemap] background:', e));

    return NextResponse.json({ queued: urls.length });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Sitemap ingest failed';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
