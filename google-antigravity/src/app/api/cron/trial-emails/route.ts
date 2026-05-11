import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendTrialEndingSoonEmail, sendTrialExpiredEmail } from '@/lib/emails';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: orgs } = await supabaseAdmin
      .from('organizations')
      .select('id, name, trial_ends_at, user_id')
      .eq('plan', 'trial')
      .not('trial_ends_at', 'is', null);

    if (!orgs || orgs.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const now = new Date();
    let sentCount = 0;

    for (const org of orgs) {
      const endDate = new Date(org.trial_ends_at);
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(org.user_id);
      if (!user?.email) continue;

      if (diffDays === 2) {
        await sendTrialEndingSoonEmail(user.email, org.name || user.email, diffDays);
        sentCount++;
      } else if (diffDays <= 0) {
        await sendTrialExpiredEmail(user.email, org.name || user.email);
        sentCount++;
      }
    }

    return NextResponse.json({ sent: sentCount });
  } catch (error: unknown) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Cron failed' }, { status: 500 });
  }
}
