import { DocHeader, P, CardGrid, Card, NextPrev, Callout } from './_components/DocComponents';

export const metadata = { title: 'Introduction — SmartDocs Docs' };

export default function DocsIntro() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Welcome to SmartDocs"
        lead="SmartDocs turns your documentation into an AI agent your customers can talk to. This guide walks through everything from your first chatbot to advanced API integrations."
      />

      <P>
        SmartDocs is a production-grade chatbot platform that ingests your knowledge sources, generates vector embeddings,
        and serves a strictly source-grounded conversational interface — embeddable on any website with one script tag.
        It never invents facts: if the answer is not in your sources, the bot says so and offers to escalate.
      </P>

      <Callout tone="info" title="New to chatbots?">
        Start with the <a href="/docs/quickstart" className="text-white underline">Quickstart</a>. You&apos;ll have a working bot embedded on a page in under 10 minutes.
      </Callout>

      <CardGrid>
        <Card href="/docs/quickstart" title="Quickstart" desc="Create your first chatbot, train it, embed it. End-to-end in 10 minutes." />
        <Card href="/docs/concepts" title="How it works" desc="The RAG pipeline: ingestion → chunking → embedding → retrieval → generation." />
        <Card href="/docs/sources/urls" title="Knowledge sources" desc="URLs, sitemaps, PDFs, DOCX, Markdown, CSV, JSON, and plain text." />
        <Card href="/docs/widget/embed" title="Widget" desc="Embed the chatbot on any site with one line of HTML." />
        <Card href="/docs/review-queue" title="Review queue" desc="Turn unanswered questions into new knowledge — your bot self-improves." />
        <Card href="/docs/api/overview" title="Developer API" desc="REST API, API keys, and webhooks for headless integration." />
      </CardGrid>

      <NextPrev next={{ href: '/docs/quickstart', label: 'Quickstart' }} />
    </>
  );
}
