import { extractText, getDocumentProxy } from 'unpdf';

// unpdf is the serverless-friendly PDF extraction library. It bundles a Node-
// compatible build of PDF.js with no DOM globals required, so it runs on
// Vercel without the DOMMatrix errors that affect the upstream pdf-parse v2.
export async function parsePdf(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  // unpdf returns a string when mergePages is true. Defensively coalesce
  // in case the type narrowing isn't enough at runtime.
  const merged = Array.isArray(text) ? text.join('\n\n') : text;
  return merged.replace(/\s+/g, ' ').trim();
}
