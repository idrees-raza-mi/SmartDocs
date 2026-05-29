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
        const plan = session.metadata?.plan as 'starter' | 'pro' | 'business' | undefined;

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
          const planMap: Record<string, 'starter' | 'pro' | 'business'> = {
            [process.env.STRIPE_PRICE_STARTER!]: 'starter',
            [process.env.STRIPE_PRICE_PRO!]: 'pro',
            [process.env.STRIPE_PRICE_BUSINESS!]: 'business',
          };
          const newPlan: 'starter' | 'pro' | 'business' | 'trial' = planMap[priceId] || 'trial';
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

          // Downgrade to trial keeps the org's first (oldest) chatbot active and
          // deactivates the rest, matching the trial plan's chatbots = 1 limit.
          const { data: chatbots } = await supabaseAdmin
            .from('chatbots')
            .select('id')
            .eq('org_id', org.id)
            .order('created_at', { ascending: true });

          const idsToDeactivate = (chatbots || []).slice(1).map((c) => c.id);
          if (idsToDeactivate.length > 0) {
            await supabaseAdmin
              .from('chatbots')
              .update({ is_active: false })
              .in('id', idsToDeactivate);
          }
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
              .select('name, user_id')
              .eq('id', org.id)
              .single();

            if (orgData) {
              const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(orgData.user_id);
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
