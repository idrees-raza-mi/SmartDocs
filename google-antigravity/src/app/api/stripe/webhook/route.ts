import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { resend } from '@/lib/resend';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.org_id;
        const plan = session.metadata?.plan;

        if (orgId && plan) {
          await supabaseAdmin
            .from('organizations')
            .update({
              plan,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              trial_ends_at: null,
              billing_period_start: new Date().toISOString(),
            })
            .eq('id', orgId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (org) {
          const priceId = subscription.items.data[0]?.price.id;
          const planMap: Record<string, string> = {
            [process.env.STRIPE_PRICE_STARTER!]: 'starter',
            [process.env.STRIPE_PRICE_PRO!]: 'pro',
            [process.env.STRIPE_PRICE_BUSINESS!]: 'business',
          };
          const newPlan = planMap[priceId] || 'trial';
          await supabaseAdmin
            .from('organizations')
            .update({ plan: newPlan })
            .eq('id', org.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (org) {
          await supabaseAdmin
            .from('organizations')
            .update({
              plan: 'trial',
              stripe_subscription_id: null,
              trial_ends_at: new Date().toISOString(),
            })
            .eq('id', org.id);

          await supabaseAdmin
            .from('chatbots')
            .update({ is_active: false })
            .eq('org_id', org.id)
            .filter('id', 'not in', (
              await supabaseAdmin
                .from('chatbots')
                .select('id')
                .eq('org_id', org.id)
                .limit(1)
            ).data?.map(c => c.id) || []);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (customerId) {
          const { data: org } = await supabaseAdmin
            .from('organizations')
            .select('id')
            .eq('stripe_customer_id', customerId)
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
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (customerId) {
          const { data: org } = await supabaseAdmin
            .from('organizations')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (org) {
            const { data: orgData } = await supabaseAdmin
              .from('organizations')
              .select('name')
              .eq('id', org.id)
              .single();

            const { data: userData } = await supabaseAdmin
              .from('organizations')
              .select('user_id')
              .eq('id', org.id)
              .single();

            if (userData) {
              const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userData.user_id);
              if (user?.email) {
                await resend.emails.send({
                  from: 'DocWise <billing@docwise.ai>',
                  to: user.email,
                  subject: 'Action required: DocWise payment failed',
                  text: `Hi${orgData?.name ? ' ' + orgData.name : ''},\n\nYour recent payment for DocWise has failed. Please update your payment method to continue using the service.\n\nThank you,\nDocWise Team`,
                });
              }
            }
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook failed' }, { status: 500 });
  }
}
