import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendPaymentFailedEmail } from '@/lib/emails';
import {
  verifyWebhookSignature,
  planForVariant,
  type LemonSqueezyWebhookEvent,
} from '@/lib/lemonsqueezy';

// LemonSqueezy webhook handler. Mirrors the behavior of the Stripe webhook
// route but uses LemonSqueezy's JSON:API payload shape and event names.
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as LemonSqueezyWebhookEvent;
    const eventName = event.meta.event_name;
    const custom = event.meta.custom_data ?? {};
    const orgId = custom.org_id;
    const planFromCustom = custom.plan as 'starter' | 'pro' | 'business' | undefined;

    const sub = event.data.attributes;

    switch (eventName) {
      case 'subscription_created': {
        if (!orgId) break;
        const plan = planFromCustom ?? planForVariant(sub.variant_id) ?? 'starter';
        await supabaseAdmin
          .from('organizations')
          .update({
            plan,
            stripe_customer_id: String(sub.customer_id),
            stripe_subscription_id: event.data.id,
            trial_ends_at: null,
            billing_period_start: new Date().toISOString(),
          })
          .eq('id', orgId);
        break;
      }

      case 'subscription_updated': {
        const subId = event.data.id;
        const newPlan = planForVariant(sub.variant_id);
        if (!newPlan) break;

        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('stripe_subscription_id', subId)
          .single();
        if (!org) break;

        await supabaseAdmin
          .from('organizations')
          .update({ plan: newPlan })
          .eq('id', org.id);
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        const subId = event.data.id;
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('stripe_subscription_id', subId)
          .single();
        if (!org) break;

        await supabaseAdmin
          .from('organizations')
          .update({
            plan: 'trial',
            stripe_subscription_id: null,
            trial_ends_at: new Date().toISOString(),
          })
          .eq('id', org.id);

        // Keep oldest chatbot active, deactivate the rest (trial = 1 chatbot)
        const { data: chatbots } = await supabaseAdmin
          .from('chatbots')
          .select('id')
          .eq('org_id', org.id)
          .order('created_at', { ascending: true });
        const idsToDeactivate = (chatbots ?? []).slice(1).map((c) => c.id);
        if (idsToDeactivate.length > 0) {
          await supabaseAdmin
            .from('chatbots')
            .update({ is_active: false })
            .in('id', idsToDeactivate);
        }
        break;
      }

      case 'subscription_payment_success': {
        const subId = event.data.id;
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('stripe_subscription_id', subId)
          .single();
        if (org) {
          await supabaseAdmin
            .from('organizations')
            .update({
              message_count_this_month: 0,
              billing_period_start: new Date().toISOString(),
            })
            .eq('id', org.id);
        }
        break;
      }

      case 'subscription_payment_failed': {
        const subId = event.data.id;
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('id, name, user_id')
          .eq('stripe_subscription_id', subId)
          .single();
        if (!org) break;

        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(org.user_id);
        if (user?.email) {
          await sendPaymentFailedEmail(user.email, org.name);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('LemonSqueezy webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook failed' },
      { status: 500 }
    );
  }
}
