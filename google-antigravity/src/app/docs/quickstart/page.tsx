import { DocHeader, P, Steps, Step, CodeBlock, Code, Callout, NextPrev } from '../_components/DocComponents';

export const metadata = { title: 'Quickstart — SmartDocs Docs' };

export default function Quickstart() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Quickstart"
        lead="Get a fully working chatbot trained on your docs and embedded on your site in under 10 minutes."
      />

      <Steps>
        <Step n={1} title="Sign up for free">
          <P>
            Head to <a href="/auth/signup" className="text-white underline">/auth/signup</a> and create an account.
            No credit card required. You get a 7-day trial with 1 chatbot, 1 source, and 50 messages.
          </P>
        </Step>

        <Step n={2} title="Create your chatbot">
          <P>
            From the dashboard, click <Code>+ New Chatbot</Code>. Give it a name, a welcome message, and an accent color.
            These appear in the embedded widget on your site.
          </P>
        </Step>

        <Step n={3} title="Train it on your knowledge">
          <P>
            Click <Code>Add Source</Code>. Choose from:
          </P>
          <ul className="list-disc pl-5 text-white/70 space-y-1 mb-3">
            <li><b>URL</b> — paste any public web page</li>
            <li><b>File</b> — drag-and-drop PDF, DOCX, TXT, Markdown, CSV, or JSON</li>
            <li><b>Raw text</b> — type or paste content directly</li>
            <li><b>Sitemap</b> (Pro+) — paste a <Code>sitemap.xml</Code> URL to crawl many pages at once</li>
          </ul>
          <P>The Status column will show &ldquo;Processing&rdquo; while we extract text, chunk it, and generate embeddings, then flip to &ldquo;Ready&rdquo; within seconds.</P>
        </Step>

        <Step n={4} title="Test in the live widget">
          <P>
            Click into a chatbot, then the <Code>Embed</Code> tab. The right panel shows a live preview — type a question into it.
            The bot streams its answer with markdown formatting and source citations.
          </P>
        </Step>

        <Step n={5} title="Embed on your site">
          <P>Copy the embed snippet — it looks like this:</P>
          <CodeBlock lang="html">{`<script
  src="https://YOUR-APP.com/widget.js"
  data-chatbot-id="YOUR-CHATBOT-ID"
  defer
></script>`}</CodeBlock>
          <P>Paste it just before the closing <Code>&lt;/body&gt;</Code> tag of your website. The widget loads asynchronously and never blocks your page rendering.</P>
        </Step>

        <Step n={6} title="Lock it down to your domain">
          <P>
            From the <Code>Embed</Code> tab, fill in <b>Allowed Domains</b> (one per line). The chat API rejects requests from anywhere else — so nobody else can spend your message quota.
          </P>
        </Step>
      </Steps>

      <Callout tone="success" title="You're live.">
        Visitors can now chat with your AI. Head to <a href="/dashboard" className="text-white underline">the dashboard</a> to see conversations stream in.
      </Callout>

      <NextPrev
        prev={{ href: '/docs', label: 'Introduction' }}
        next={{ href: '/docs/concepts', label: 'How it works' }}
      />
    </>
  );
}
