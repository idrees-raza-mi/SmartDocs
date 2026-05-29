import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createCheckout, variantForPlan } from '@/lib/lemonsqueezy';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.email) return NextResponse.json({ error: 'No email on account' }, { status: 400 });

    const body = await req.json();
    const planId = body.planId as string;
    if (planId !== 'starter' && planId !== 'pro' && planId !== 'business') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const variantId = variantForPlan(planId);
    if (!variantId) {
      return NextResponse.json(
        { error: `LemonSqueezy variant not configured for ${planId}. Set LEMONSQUEEZY_VARIANT_${planId.toUpperCase()} on Vercel.` },
        { status: 500 }
      );
    }

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id, name')
      .eq('user_id', user.id)
      .single();

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const successUrl = `${appUrl}/dashboard/billing?success=true`;

    const checkoutUrl = await createCheckout({
      variantId,
      email: user.email,
      name: org.name ?? undefined,
      customData: {
        org_id: org.id,
        plan: planId,
        user_id: user.id,
      },
      successUrl,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: unknown) {
    console.error('LemonSqueezy checkout error:', error);
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
