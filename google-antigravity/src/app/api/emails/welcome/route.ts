import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendWelcomeEmail } from '@/lib/emails';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
    if (authError || !user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('user_id', user.id)
      .single();

    await sendWelcomeEmail(user.email, org?.name ?? null);

    return NextResponse.json({ sent: true });
  } catch (error: unknown) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ sent: false, error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
