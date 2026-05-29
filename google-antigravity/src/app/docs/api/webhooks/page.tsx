import { DocHeader, P, Section, UL, CodeBlock, Code, Callout, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'Webhooks — DocWise Docs' };

export default function WebhooksDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Developer"
        title="Webhooks"
        lead="Subscribe to chatbot events. DocWise POSTs to your endpoint when interesting things happen."
      />

      <Section title="Available events">
        <UL>
          <li><Code>message.created</Code> — fires for every assistant message</li>
          <li><Code>escalation</Code> — fires when the bot escalates a question</li>
          <li><Code>lead.captured</Code> — fires when a visitor submits the lead capture form</li>
          <li><Code>source.updated</Code> — fires when a source finishes processing or re-syncing</li>
          <li><Code>conversation.resolved</Code> — fires when an owner marks a conversation resolved</li>
        </UL>
      </Section>

      <Section title="Payload shape">
        <CodeBlock lang="json">{`{
  "id":          "evt_3f8a...",
  "type":        "escalation",
  "createdAt":   "2026-05-29T10:34:21Z",
  "chatbotId":   "f2e9c5b4-...",
  "data": {
    "question":   "How do I get a refund from 2019?",
    "confidence": 0.18,
    "sessionId":  "sess_abc"
  }
}`}</CodeBlock>
      </Section>

      <Section title="Signing">
        <P>Every webhook POST includes an <Code>X-DocWise-Signature</Code> header containing an HMAC-SHA256 of the request body using your subscription&apos;s secret. Verify it before trusting the payload:</P>
        <CodeBlock lang="node.js">{`import crypto from 'crypto';

function verify(body, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}`}</CodeBlock>
      </Section>

      <Section title="Retries">
        <P>If your endpoint returns a non-2xx status, DocWise retries with exponential backoff: 1m, 5m, 30m, 2h, 12h. After 5 failures the event is dropped (but stays visible in the audit log).</P>
      </Section>

      <Callout tone="info" title="Status">
        Webhook subscriptions are configurable via the API and stored in <Code>webhook_subscriptions</Code>. A management UI ships in the next release; for now, create subscriptions with a direct database insert or contact support.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/api/keys', label: 'API keys' }}
        next={{ href: '/docs/billing', label: 'Plans & billing' }}
      />
    </>
  );
}
