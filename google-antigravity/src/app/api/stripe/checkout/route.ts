import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PLAN_PRICES } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const { planId } = await req.json();

    if (!planId || !PLAN_PRICES[planId as keyof typeof PLAN_PRICES]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const price = PLAN_PRICES[planId as keyof typeof PLAN_PRICES];
    let stripeCustomerId = org.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { org_id: org.id },
      });
      stripeCustomerId = customer.id;
      await supabaseAdmin
        .from('organizations')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', org.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: price.priceId, quantity: 1 }],
      metadata: { org_id: org.id, plan: planId },
      subscription_data: { trial_period_days: 0 },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkout failed' }, { status: 500 });
  }
}
