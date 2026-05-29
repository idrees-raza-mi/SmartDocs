import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendDailyDigest } from '@/lib/emails';

// Daily digest for Pro/Business orgs. Aggregates the previous 24h per chatbot.
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: orgs } = await supabaseAdmin
      .from('organizations')
      .select('id, name, user_id, plan')
      .in('plan', ['pro', 'business']);

    if (!orgs || orgs.length === 0) return NextResponse.json({ sent: 0 });

    const since = new Date(Date.now() - 86400000).toISOString();
    let sent = 0;

    for (const org of orgs) {
      try {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(org.user_id);
        if (!user?.email) continue;

        const { data: bots } = await supabaseAdmin
          .from('chatbots')
          .select('id, name')
          .eq('org_id', org.id);
        if (!bots) continue;

        for (const bot of bots) {
          const { data: convs } = await supabaseAdmin
            .from('conversations')
            .select('id')
            .eq('chatbot_id', bot.id)
            .gte('started_at', since);

          const convIds = (convs ?? []).map((c) => c.id);
          if (convIds.length === 0) continue;

          const { data: msgs } = await supabaseAdmin
            .from('messages')
            .select('role, content, was_escalated')
            .in('conversation_id', convIds);

          const escalations = (msgs ?? []).filter((m) => m.was_escalated).length;
          const userMsgs = (msgs ?? []).filter((m) => m.role === 'user').map((m) => m.content);
          const counts = new Map<string, number>();
          for (const c of userMsgs) {
            const key = c.slice(0, 80);
            counts.set(key, (counts.get(key) ?? 0) + 1);
          }
          const topQuestions = Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([q]) => q);

          await sendDailyDigest(user.email, {
            chatbotName: bot.name,
            conversations: convIds.length,
            escalations,
            topQuestions,
          });
          sent++;
        }
      } catch (innerErr) {
        console.error('daily-digest inner:', innerErr);
      }
    }

    return NextResponse.json({ sent });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Cron failed' }, { status: 500 });
  }
}
