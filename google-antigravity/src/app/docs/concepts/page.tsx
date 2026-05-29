import { DocHeader, P, Section, UL, NextPrev, CodeBlock, Code, Callout } from '../_components/DocComponents';

export const metadata = { title: 'How it works — DocWise Docs' };

export default function Concepts() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="How it works"
        lead="DocWise uses retrieval-augmented generation (RAG). The bot only answers from your own knowledge — never from its general training data."
      />

      <Section title="The pipeline">
        <P>Every chatbot follows the same six-step pipeline. Understanding it helps you debug bad answers and tune your sources for better retrieval.</P>
        <UL>
          <li><b>Ingest.</b> Sources (URLs, files, text) are downloaded and parsed into plain text.</li>
          <li><b>Chunk.</b> Text is split into ~400-token chunks with 50-token overlap so context isn&apos;t lost at boundaries.</li>
          <li><b>Embed.</b> Each chunk is turned into a 1536-dimension vector using OpenAI&apos;s <Code>text-embedding-3-small</Code>.</li>
          <li><b>Store.</b> Vectors are stored in Supabase Postgres with the <Code>pgvector</Code> extension and an HNSW index.</li>
          <li><b>Retrieve.</b> When a visitor asks a question, the question is embedded and we run a cosine-similarity search to fetch the top 5 most relevant chunks (similarity &gt; 0.7).</li>
          <li><b>Generate.</b> Those chunks are inserted into a strict system prompt that instructs <Code>gpt-4o-mini</Code> to answer only from the provided context. The response streams back token-by-token.</li>
        </UL>
      </Section>

      <Section title="Why this beats raw LLM answers">
        <P>Off-the-shelf LLMs hallucinate. They will confidently invent product features that don&apos;t exist or pricing that&apos;s out of date.</P>
        <P>DocWise forces the model to either find an answer in your sources or say &ldquo;I don&apos;t know&rdquo; — there is no third option. The bot will explicitly tag itself with <Code>[ESCALATE]</Code> when it can&apos;t help, which the system uses to route the conversation to a human (or to the Review Queue for later answering).</P>
      </Section>

      <Section title="Conversation memory">
        <P>The last 10 messages of each visitor&apos;s session are loaded as context on every turn, so follow-up questions like &ldquo;tell me more about that&rdquo; work naturally.</P>
        <P>Sessions are identified by a localStorage-stored ID per chatbot. Visitors who return after a refresh see the same conversation continued, and a &ldquo;Welcome back&rdquo; greeting.</P>
      </Section>

      <Section title="The trailing metadata frame">
        <P>The chat endpoint streams plain text, then sends a trailing JSON metadata frame the widget parses to render citations and follow-up suggestions:</P>
        <CodeBlock lang="example response stream">{`Hello! That feature was launched in v2.4.

__DOCWISE_META__{"sources":["changelog.md"],"escalated":false}`}</CodeBlock>
        <P>If you build a custom integration, look for the <Code>__DOCWISE_META__</Code> marker and parse everything after it as JSON.</P>
      </Section>

      <Callout tone="info" title="Confidence scoring">
        Every assistant message gets a confidence score (0&ndash;1) based on top retrieval similarity, response length, and escalation signal. View it on the conversation page — low-confidence answers are great Review Queue candidates.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/quickstart', label: 'Quickstart' }}
        next={{ href: '/docs/sources/urls', label: 'URLs & sitemaps' }}
      />
    </>
  );
}
