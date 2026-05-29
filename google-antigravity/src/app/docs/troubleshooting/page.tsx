import { DocHeader, P, Section, UL, Code, Callout, NextPrev } from '../_components/DocComponents';

export const metadata = { title: 'Troubleshooting — DocWise Docs' };

export default function TroubleshootingDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Account"
        title="Troubleshooting"
        lead="Common issues and how to fix them."
      />

      <Section title="The widget doesn't appear on my site">
        <UL>
          <li><b>Check the script URL.</b> Open browser DevTools → Network and look for the <Code>widget.js</Code> request. If it&apos;s 404, the URL is wrong.</li>
          <li><b>Check the chatbot ID.</b> The <Code>data-chatbot-id</Code> attribute must match a real chatbot in your dashboard.</li>
          <li><b>Check CSP.</b> If you set a Content-Security-Policy, allow our origin in <Code>script-src</Code> and <Code>connect-src</Code>.</li>
          <li><b>Check for ad blockers.</b> Aggressive blockers may flag any chat widget; allowlist your own domain.</li>
        </UL>
      </Section>

      <Section title="The bot says my domain isn't allowed">
        <P>You&apos;ve enabled the domain allowlist but haven&apos;t added the host where the widget is loading. Open the chatbot&apos;s <Code>Embed</Code> tab and add the domain. Subdomains are matched automatically — adding <Code>example.com</Code> allows <Code>www.example.com</Code> and <Code>blog.example.com</Code>.</P>
      </Section>

      <Section title="Source stuck on 'Processing'">
        <P>The Sources page polls every 3 seconds while any source is processing. If it&apos;s been &gt;5 minutes:</P>
        <UL>
          <li>For URLs: the page may be SPA-rendered and yielded no text. Check the page source-view shows content without JS.</li>
          <li>For files: very large PDFs (&gt;500 pages) may take a few minutes to embed; wait it out.</li>
          <li>If the row flips to &ldquo;Error&rdquo;, delete it and retry.</li>
        </UL>
      </Section>

      <Section title="Bot gives wrong / unhelpful answers">
        <P>Almost always a sources problem. Check:</P>
        <UL>
          <li>Does the answer actually exist in your sources? Open the source preview and verify the text was extracted correctly.</li>
          <li>Are competing sources giving conflicting info? Delete or fix outdated content.</li>
          <li>Use the System Prompt in <Code>Settings</Code> to adjust tone (e.g. &ldquo;Be concise. Always cite the source.&rdquo;).</li>
          <li>Watch the Review Queue — recurring bad answers cluster there.</li>
        </UL>
      </Section>

      <Section title="Stripe checkout shows an error">
        <P>If you see <Code>The minimum number of trial period days is 1</Code>, the Stripe price has a 0-day trial configured. Edit it in your Stripe dashboard to either remove the trial entirely or set it to ≥1 day.</P>
      </Section>

      <Section title="API returns 401 'Invalid or revoked API key'">
        <UL>
          <li>The key has been revoked. Check the audit log to confirm.</li>
          <li>You&apos;re using a test-mode key against a live endpoint, or vice versa.</li>
          <li>There&apos;s extra whitespace in your env var. Trim it.</li>
        </UL>
      </Section>

      <Section title="API returns 429 Too Many Requests">
        <P>You&apos;ve hit the 60-req/min rate limit. Slow down or implement client-side backoff. The <Code>Retry-After</Code> header tells you how many seconds to wait.</P>
      </Section>

      <Section title="I can't sign in after changing my email">
        <P>Email changes require confirmation from <b>both</b> the old and new addresses. Check both inboxes (including spam) and click both links.</P>
      </Section>

      <Callout tone="info" title="Still stuck?">
        Email <a href="mailto:support@docwise.ai" className="text-white underline">support@docwise.ai</a> with the chatbot ID, what you expected, and what happened. Business plan customers get priority support with a 4-hour response SLA during business hours.
      </Callout>

      <NextPrev prev={{ href: '/docs/privacy', label: 'Privacy & data' }} />
    </>
  );
}
