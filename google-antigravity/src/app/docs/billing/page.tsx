import { DocHeader, P, Section, UL, Code, Callout, NextPrev } from '../_components/DocComponents';

export const metadata = { title: 'Plans & billing — SmartDocs Docs' };

export default function BillingDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Account"
        title="Plans & billing"
        lead="What each plan includes, how usage is metered, and how to upgrade, downgrade, or cancel."
      />

      <Section title="Plan tiers">
        <UL>
          <li><b>Trial — free, 7 days.</b> 1 chatbot, 1 source, 50 messages. No credit card required.</li>
          <li><b>Starter — $29/mo.</b> 1 chatbot, 5 sources, 500 messages/mo. Analytics, conversations history, lead capture.</li>
          <li><b>Pro — $79/mo.</b> 5 chatbots, unlimited sources, 5,000 messages/mo. Sitemap crawling, scheduled re-sync, Review Queue, confidence scoring, Slack notifications, daily digest emails, remove branding.</li>
          <li><b>Business — $199/mo.</b> Unlimited chatbots, 50,000 messages/mo. REST API access, webhooks, audit log, custom widget domain, team members, priority support.</li>
        </UL>
      </Section>

      <Section title="What counts as a message">
        <P>One assistant response = one message. User messages are not counted, system replies for over-quota are not counted, and rate-limit rejections are not counted.</P>
      </Section>

      <Section title="Quota behavior">
        <P>When your org hits its monthly message limit, the chatbot starts replying with a polite over-quota message until the next billing period begins. No data is lost; the bot simply stops responding to new questions until you upgrade or the period resets.</P>
      </Section>

      <Section title="Upgrading">
        <P>Open <Code>/dashboard/billing</Code> and click the plan you want. You&apos;ll be redirected to Stripe Checkout. The new plan takes effect immediately.</P>
      </Section>

      <Section title="Downgrading">
        <P>From <Code>/dashboard/billing</Code>, click <b>Manage subscription</b> to open the Stripe billing portal. Downgrades take effect at the end of the current billing period — you keep the higher-tier features until then.</P>
        <P>When a downgrade puts you over a tier limit (e.g. 6 chatbots on a plan that allows 1), the oldest chatbots stay active and the rest are deactivated. Their data is preserved; reactivate by upgrading again or deleting other chatbots.</P>
      </Section>

      <Section title="Cancellation">
        <P>From the billing portal, click <b>Cancel plan</b>. Service continues through the end of your billing period, then drops to a paused state where your chatbots stop responding but all data is retained for 30 days. After 30 days the org is permanently deleted.</P>
      </Section>

      <Callout tone="info" title="Annual plans">
        Annual billing saves about 20% off monthly. Switch from the billing portal — the change is pro-rated against your remaining monthly time.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/api/webhooks', label: 'Webhooks' }}
        next={{ href: '/docs/privacy', label: 'Privacy & data' }}
      />
    </>
  );
}
