import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendTrialEndingEmail } from '@/lib/emails';

// Runs daily. Two responsibilities:
//   1. Send reminder emails at 5 days and 2 days before trial ends.
//   2. Auto-downgrade trials whose trial_ends_at has passed → plan='free'.

const REMIND_AT_DAYS = [5, 2];

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
      return NextResponse.json({ sent: 0, downgraded: 0 });
    }

    const now = new Date();
    let sent = 0;
    let downgraded = 0;

    for (const org of orgs) {
      try {
        const endDate = new Date(org.trial_ends_at!);
        const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);

        if (diffDays <= 0) {
          // Trial is over → silently move to permanent free tier. The user can
          // keep using the app at free limits; their data is preserved.
          await supabaseAdmin
            .from('organizations')
            .update({ plan: 'free', trial_ends_at: null })
            .eq('id', org.id);
          downgraded++;
          continue;
        }

        if (!REMIND_AT_DAYS.includes(diffDays)) continue;

        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(org.user_id);
        if (!user?.email) continue;

        await sendTrialEndingEmail(user.email, diffDays, org.name);
        sent++;
      } catch (innerErr) {
        console.error('trial-emails inner:', innerErr);
      }
    }

    return NextResponse.json({ sent, downgraded });
  } catch (error: unknown) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Cron failed' }, { status: 500 });
  }
}
