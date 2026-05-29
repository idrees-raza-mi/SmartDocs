import { DocHeader, P, Section, UL, Code, CodeBlock, Callout, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'URLs & sitemaps — SmartDocs Docs' };

export default function UrlsDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Knowledge sources"
        title="URLs & sitemaps"
        lead="Train your bot on public web pages. Add them one at a time, or feed a whole sitemap and let SmartDocs crawl it."
      />

      <Section title="Adding a single URL">
        <P>From any chatbot&apos;s <Code>Sources</Code> tab, click <Code>+ Add Source</Code> → <Code>URL</Code> tab, paste the full URL (including <Code>https://</Code>), and click <Code>Add Source</Code>.</P>
        <P>The page is fetched server-side with a SmartDocs user agent, scripts and styles are stripped, and the main content is extracted, chunked, and embedded.</P>
        <UL>
          <li>JavaScript-rendered pages (SPAs) may not extract well — use server-rendered URLs when possible.</li>
          <li>The same URL cannot be added twice to a chatbot.</li>
          <li>404, 5xx, or unreachable pages mark the source as <Code>error</Code>.</li>
        </UL>
      </Section>

      <Section title="Sitemap crawling (Pro & Business)">
        <P>Paste a full sitemap URL (e.g. <Code>https://example.com/sitemap.xml</Code>) into the <Code>Sitemap</Code> tab. SmartDocs extracts every <Code>&lt;loc&gt;</Code> URL and queues them for processing.</P>
        <UL>
          <li><b>Pro plan</b> — up to 200 URLs per sitemap</li>
          <li><b>Business plan</b> — up to 2,000 URLs per sitemap</li>
          <li>Processing runs three URLs in parallel; the source list updates live with status.</li>
          <li>Nested sitemap indexes (sitemaps that point to other sitemaps) are currently skipped — point us at the leaf sitemap.</li>
        </UL>
      </Section>

      <Section title="Re-syncing a URL">
        <P>URL sources can be re-synced from the source row&apos;s refresh icon. The system fetches the page again, computes a SHA-256 content hash, and:</P>
        <UL>
          <li>If the hash matches what we have, nothing is re-embedded (no OpenAI cost).</li>
          <li>If the hash differs, old chunks are deleted and the new content is re-chunked and re-embedded.</li>
        </UL>
      </Section>

      <Section title="What gets extracted">
        <P>We strip <Code>&lt;script&gt;</Code>, <Code>&lt;style&gt;</Code>, <Code>&lt;noscript&gt;</Code>, <Code>&lt;nav&gt;</Code>, <Code>&lt;footer&gt;</Code>, <Code>&lt;header&gt;</Code>, and inline SVG, then take the <Code>body</Code> text content and collapse whitespace.</P>
        <CodeBlock lang="extraction example">{`Before:
<header>...</header>
<main>
  <h1>Pricing</h1>
  <p>Our plans start at $29/month.</p>
</main>
<footer>...</footer>

After:
Pricing Our plans start at $29/month.`}</CodeBlock>
      </Section>

      <Callout tone="warning" title="Public pages only">
        SmartDocs fetches URLs from our servers without any cookies. Authenticated-only pages, intranet URLs, and login-walled content won&apos;t work. For private content, upload files directly.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/concepts', label: 'How it works' }}
        next={{ href: '/docs/sources/files', label: 'Files' }}
      />
    </>
  );
}
