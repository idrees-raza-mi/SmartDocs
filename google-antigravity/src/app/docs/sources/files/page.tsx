import { DocHeader, P, Section, UL, Code, Callout, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'Files — SmartDocs Docs' };

export default function FilesDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Knowledge sources"
        title="File uploads"
        lead="Upload PDFs, Word documents, Markdown, plain text, CSV, or JSON. SmartDocs extracts the text, chunks it, and embeds it."
      />

      <Section title="Supported formats">
        <UL>
          <li><b>PDF</b> &mdash; text extraction; scanned image-only PDFs require OCR (not built in).</li>
          <li><b>DOCX</b> &mdash; Word documents (the modern <Code>.docx</Code> format, not <Code>.doc</Code>).</li>
          <li><b>TXT</b> &mdash; plain text in UTF-8.</li>
          <li><b>Markdown (.md)</b> &mdash; rendered to text; image syntax is stripped.</li>
          <li><b>CSV / TSV</b> &mdash; each row becomes <Code>header: value, header: value, ...</Code> for clean embedding.</li>
          <li><b>JSON</b> &mdash; flattened to <Code>path.to.key: value</Code> lines so deeply nested data still retrieves well.</li>
        </UL>
      </Section>

      <Section title="Limits">
        <UL>
          <li>Maximum file size: <b>25 MB</b> per file</li>
          <li>You can drag multiple files into the upload zone — each is processed independently</li>
          <li>Identical content (same SHA-256 hash) is rejected as a duplicate</li>
        </UL>
      </Section>

      <Section title="Tips for great answers">
        <UL>
          <li><b>Keep documents focused.</b> A 200-page PDF with 30 unrelated topics retrieves worse than 30 single-topic files.</li>
          <li><b>Use clear headings.</b> They help the chunker split on semantic boundaries.</li>
          <li><b>Avoid scanned PDFs.</b> Run them through OCR first, then upload as a TXT or Markdown file.</li>
          <li><b>For Q&amp;A docs</b>, prefer the &ldquo;Raw text&rdquo; tab and use the format <Code>Q: ... A: ...</Code> — embeddings capture this structure exceptionally well.</li>
        </UL>
      </Section>

      <Callout tone="info" title="Content hashing">
        We hash the extracted text (not the file bytes) so a PDF re-exported with different metadata won&apos;t cause unnecessary re-embedding.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/sources/urls', label: 'URLs & sitemaps' }}
        next={{ href: '/docs/sources/text', label: 'Raw text' }}
      />
    </>
  );
}
