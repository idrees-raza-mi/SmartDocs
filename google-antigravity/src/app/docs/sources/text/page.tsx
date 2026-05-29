import { DocHeader, P, Section, CodeBlock, Code, Callout, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'Raw text — SmartDocs Docs' };

export default function TextDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Knowledge sources"
        title="Raw text"
        lead="Paste content directly. Best for short FAQs, policies, and Q&A pairs."
      />

      <Section title="When to use raw text">
        <P>The text source is the simplest way to add knowledge: just give it a name and paste content. Use it for:</P>
        <ul className="list-disc pl-5 text-white/70 space-y-1 mb-4">
          <li>Frequently asked questions (Q/A format)</li>
          <li>Internal policies that don&apos;t live on a public URL</li>
          <li>Quick fact patches between full re-syncs of larger sources</li>
          <li>Manually-resolved questions from the Review Queue (this happens automatically)</li>
        </ul>
      </Section>

      <Section title="The Q&A pattern">
        <P>Embeddings work best when each chunk contains a complete &ldquo;thought.&rdquo; For FAQ content, format like this:</P>
        <CodeBlock lang="text">{`Q: How do I cancel my subscription?
A: Open Billing in the dashboard and click "Cancel plan."
   Service continues through the end of your billing period.

Q: Do you offer annual discounts?
A: Yes — annual plans save 20% versus monthly billing.`}</CodeBlock>
        <P>When a visitor asks &ldquo;how do I cancel,&rdquo; the embedding for that question matches the question half of your Q/A pair, and the answer half travels along for free.</P>
      </Section>

      <Section title="Length & chunking">
        <P>There&apos;s no minimum content length. Text shorter than ~1,600 characters becomes a single chunk; longer text is split on paragraph then sentence boundaries with 50-token overlap.</P>
      </Section>

      <Callout tone="success" title="Self-improving knowledge">
        Every time you use the <a href="/docs/review-queue" className="text-white underline">Review Queue</a> to answer a question your bot missed, the system creates a Q/A text source automatically — your bot learns from production.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/sources/files', label: 'Files' }}
        next={{ href: '/docs/sources/sync', label: 'Auto re-sync' }}
      />
    </>
  );
}
