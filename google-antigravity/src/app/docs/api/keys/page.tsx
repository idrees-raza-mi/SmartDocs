import { DocHeader, P, Section, Steps, Step, CodeBlock, Code, Callout, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'API keys — DocWise Docs' };

export default function ApiKeysDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Developer"
        title="API keys"
        lead="Issue, manage, and revoke keys for accessing the DocWise REST API."
      />

      <Section title="Creating a key">
        <Steps>
          <Step n={1} title="Go to /dashboard/developer">
            Available on the Business plan. You&apos;ll see your existing keys (or an empty state on first visit).
          </Step>
          <Step n={2} title="Click 'New API key'">
            Give the key a descriptive name (e.g. <Code>Production backend</Code> or <Code>Marketing site</Code>). This is for your reference; visitors never see it.
          </Step>
          <Step n={3} title="Copy the key immediately">
            The full key (<Code>dw_live_...</Code>) is shown <b>once</b>. We store only a SHA-256 hash, so we can&apos;t retrieve it later. If you lose it, revoke it and create a new one.
          </Step>
        </Steps>
      </Section>

      <Section title="Key format">
        <CodeBlock>{`dw_live_a4f7d8c2e9b1a0d3f5e8c2a1b6d9e0c5`}</CodeBlock>
        <P>The <Code>dw_live_</Code> prefix identifies live keys (test-mode keys would use <Code>dw_test_</Code>). The rest is 32 base64url-encoded random bytes.</P>
      </Section>

      <Section title="Revoking">
        <P>Click the trash icon on a key row. Revocation is immediate — any in-flight requests with the revoked key get <Code>HTTP 401</Code> on the next attempt. The key remains visible in the list as &ldquo;Revoked&rdquo; for audit purposes.</P>
      </Section>

      <Section title="Best practices">
        <ul className="list-disc pl-5 text-white/70 space-y-1 mb-4">
          <li><b>One key per environment.</b> Use distinct keys for production, staging, and dev.</li>
          <li><b>One key per integration.</b> If you revoke a leaked Slack-bot key, your CRM sync keeps working.</li>
          <li><b>Store in env vars.</b> Never commit keys to git.</li>
          <li><b>Rotate periodically.</b> Quarterly rotation is a reasonable cadence for security-conscious teams.</li>
        </ul>
      </Section>

      <Callout tone="warning" title="If a key leaks">
        Revoke it immediately. The audit log records every <Code>apikey.create</Code> and <Code>apikey.revoke</Code> action, including the user who performed it.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/api/chat', label: 'POST /v1/chat' }}
        next={{ href: '/docs/api/webhooks', label: 'Webhooks' }}
      />
    </>
  );
}
