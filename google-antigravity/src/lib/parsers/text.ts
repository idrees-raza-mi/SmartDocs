// Parsers for plain-text style file uploads. Each returns a normalized string
// suitable for chunking and embedding.

export function parsePlain(buffer: Buffer): string {
  return buffer.toString('utf8').replace(/\r\n/g, '\n').trim();
}

export function parseMarkdown(buffer: Buffer): string {
  // Strip code fences metadata, keep code body, drop image markup we can't embed.
  return buffer
    .toString('utf8')
    .replace(/\r\n/g, '\n')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .trim();
}

export function parseCsv(buffer: Buffer): string {
  // Naive but sufficient: treat as TSV-ish to preserve structure for the LLM.
  const text = buffer.toString('utf8').replace(/\r\n/g, '\n');
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return '';

  const headerLine = lines[0];
  const sep = headerLine.includes('\t') ? '\t' : ',';
  const headers = headerLine.split(sep).map((s) => s.trim());

  const rows = lines.slice(1).map((line) => {
    const cols = line.split(sep);
    return headers
      .map((h, i) => `${h}: ${(cols[i] ?? '').trim()}`)
      .join(', ');
  });

  return rows.join('\n');
}

export function parseJson(buffer: Buffer): string {
  try {
    const obj = JSON.parse(buffer.toString('utf8'));
    return flattenJson(obj).join('\n');
  } catch {
    // Fall back to the raw string so the upload doesn't fail outright.
    return buffer.toString('utf8');
  }
}

function flattenJson(node: unknown, path: string[] = []): string[] {
  if (node === null || node === undefined) return [];
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return [`${path.join('.')}: ${String(node)}`];
  }
  if (Array.isArray(node)) {
    return node.flatMap((v, i) => flattenJson(v, [...path, String(i)]));
  }
  if (typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => flattenJson(v, [...path, k]));
  }
  return [];
}
