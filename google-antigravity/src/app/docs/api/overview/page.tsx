import { DocHeader, P, Section, CodeBlock, Code, Callout, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'API overview — SmartDocs Docs' };

export default function ApiOverviewDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Developer"
        title="API overview"
        lead="Programmatic access to SmartDocs. Send chat messages, manage chatbots, and receive webhooks — all from your code."
      />

      <Section title="Plan availability">
        <P>REST API access requires the <b>Business plan</b>. Trial, Starter, and Pro plans use the embedded widget exclusively.</P>
      </Section>

      <Section title="Base URL">
        <CodeBlock>{`https://YOUR-APP.com/api/v1`}</CodeBlock>
      </Section>

      <Section title="Authentication">
        <P>All requests require an API key in the <Code>Authorization</Code> header:</P>
        <CodeBlock>{`Authorization: Bearer sd_live_a4f7d8c2e9b1a0d3f5e8c2a1b6d9e0c5`}</CodeBlock>
        <P>Generate keys from <Code>/dashboard/developer</Code>. The key is shown once at creation — store it securely. Keys can be revoked any time.</P>
      </Section>

      <Section title="Content type">
        <P>All requests and responses are JSON. Send <Code>Content-Type: application/json</Code> on every request with a body.</P>
      </Section>

      <Section title="Errors">
        <CodeBlock lang="json">{`{ "error": "Invalid or revoked API key" }`}</CodeBlock>
        <P>Status codes follow standard HTTP semantics:</P>
        <ul className="list-disc pl-5 text-white/70 space-y-1 mb-4">
          <li><Code>400</Code> — malformed request body or missing fields</li>
          <li><Code>401</Code> — missing or invalid API key</li>
          <li><Code>403</Code> — key valid but lacks permission for the resource</li>
          <li><Code>404</Code> — resource not found</li>
          <li><Code>429</Code> — rate limited; <Code>Retry-After</Code> header indicates seconds to wait</li>
          <li><Code>5xx</Code> — server error; retry with exponential backoff</li>
        </ul>
      </Section>

      <Callout tone="warning" title="Rate limits">
        Per-key rate limit: 60 requests per minute. Exceeding it returns HTTP 429. Reach out if you need higher limits for production traffic.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/notifications', label: 'Slack notifications' }}
        next={{ href: '/docs/api/chat', label: 'POST /v1/chat' }}
      />
    </>
  );
}
