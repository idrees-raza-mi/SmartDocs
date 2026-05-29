import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Stale-session cleanup. Trial orgs: 30 days. Paid orgs: 90 days. Business
// gets 365 days. Conversations are bulk-deleted in chunks to stay under
// Postgres statement timeouts.
const RETENTION_DAYS = {
  trial: 30,
  starter: 90,
  pro: 90,
  business: 365,
};

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let totalDeleted = 0;

    for (const plan of Object.keys(RETENTION_DAYS) as Array<keyof typeof RETENTION_DAYS>) {
      const cutoff = new Date(Date.now() - RETENTION_DAYS[plan] * 86400000).toISOString();

      const { data: orgs } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('plan', plan);
      if (!orgs?.length) continue;
      const orgIds = orgs.map((o) => o.id);

      const { data: bots } = await supabaseAdmin
        .from('chatbots')
        .select('id')
        .in('org_id', orgIds);
      if (!bots?.length) continue;
      const botIds = bots.map((b) => b.id);

      const { data: oldConvs } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .in('chatbot_id', botIds)
        .lt('started_at', cutoff);
      if (!oldConvs?.length) continue;
      const convIds = oldConvs.map((c) => c.id);

      // Chunk deletes to avoid massive payloads.
      const CHUNK = 200;
      for (let i = 0; i < convIds.length; i += CHUNK) {
        const slice = convIds.slice(i, i + CHUNK);
        await supabaseAdmin.from('messages').delete().in('conversation_id', slice);
        await supabaseAdmin.from('conversations').delete().in('id', slice);
        totalDeleted += slice.length;
      }
    }

    return NextResponse.json({ deleted: totalDeleted });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Cleanup failed' }, { status: 500 });
  }
}
