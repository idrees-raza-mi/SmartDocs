import { DocHeader, P, Section, UL, CodeBlock, Code, Callout, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'Domain allowlist — DocWise Docs' };

export default function SecurityDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Widget"
        title="Domain allowlist & security"
        lead="Lock your chatbot to specific domains so only your sites can use your message quota."
      />

      <Section title="Why this matters">
        <P>The chatbot ID inside your embed snippet is public (anyone viewing your site&apos;s source can copy it). Without a domain allowlist, anyone could embed it on their own site and burn your monthly message quota.</P>
      </Section>

      <Section title="Configuring allowed domains">
        <P>From the <Code>Embed</Code> tab, fill the <b>Allowed Domains</b> field with one domain per line:</P>
        <CodeBlock lang="example">{`example.com
app.example.com
docs.example.com`}</CodeBlock>
        <UL>
          <li>Subdomains of listed domains are matched automatically — <Code>example.com</Code> allows <Code>blog.example.com</Code>.</li>
          <li>Leave the field empty to allow the widget on any domain (not recommended for production).</li>
          <li>Both <Code>Origin</Code> and <Code>Referer</Code> request headers are checked.</li>
        </UL>
      </Section>

      <Section title="What happens when a request fails the check">
        <P>The chat endpoint returns <Code>HTTP 403 &ldquo;Domain not allowed&rdquo;</Code>. The widget displays a generic error message to the visitor instead of exposing internal details.</P>
      </Section>

      <Section title="Rate limiting">
        <P>Independently of domain checks, every session is rate-limited to 30 messages per minute. Excess requests return <Code>HTTP 429</Code> with a <Code>Retry-After</Code> header.</P>
      </Section>

      <Callout tone="success" title="Other security guarantees">
        <UL>
          <li>The chat API is served from a Vercel Edge function — no persistent database connections to attack</li>
          <li>All Supabase queries use parameterized RPCs (no SQL injection surface)</li>
          <li>Sessions are stateless; no auth cookies cross the chatbot boundary</li>
          <li>API keys for the REST API are hashed with SHA-256 before storage</li>
        </UL>
      </Callout>

      <NextPrev
        prev={{ href: '/docs/widget/lead-capture', label: 'Lead capture' }}
        next={{ href: '/docs/review-queue', label: 'Review queue' }}
      />
    </>
  );
}
