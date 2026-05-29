import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { emailFingerprint } from '@/lib/email-fingerprint';

// Called from the signup form before supabase.auth.signUp(). Returns whether
// this email is eligible for the free trial. Pre-existing fingerprints are
// blocked from creating a second trial — they need to start on a paid plan.
// Node runtime because the fingerprint helper uses Node's crypto module.

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const fingerprint = emailFingerprint(email);

    const { data: blocked } = await supabaseAdmin
      .from('trial_blocklist')
      .select('id, reason')
      .eq('email_hash', fingerprint)
      .maybeSingle();

    if (blocked) {
      return NextResponse.json({
        allowed: false,
        reason: 'previous_account',
        message:
          'This email was used for a previous account. You can still create a new account, but the free trial is not available.',
      });
    }

    return NextResponse.json({ allowed: true });
  } catch (err) {
    // Fail open rather than block legitimate signups on an internal error.
    console.error('[signup-precheck] error:', err);
    return NextResponse.json({ allowed: true, warning: 'precheck_unavailable' });
  }
}
