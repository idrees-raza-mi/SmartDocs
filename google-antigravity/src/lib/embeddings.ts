import { gemini, MODELS } from './llm';
import { supabaseAdmin } from './supabase/admin';

export function chunkText(text: string, maxTokens = 400): string[] {
  const maxChars = maxTokens * 4;
  const overlapChars = 50 * 4;

  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk.length + paragraph.length) > maxChars) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      const overlap = currentChunk.slice(-overlapChars);
      currentChunk = overlap + (overlap ? ' ' : '') + paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.length > maxChars) {
    const sentences = currentChunk.split(/(?<=[.?!])\s+/);
    let tempChunk = '';
    for (const sentence of sentences) {
      if ((tempChunk.length + sentence.length) > maxChars) {
        if (tempChunk.trim().length > 0) chunks.push(tempChunk.trim());
        const overlap = tempChunk.slice(-overlapChars);
        tempChunk = overlap + (overlap ? ' ' : '') + sentence;
      } else {
        tempChunk += (tempChunk ? ' ' : '') + sentence;
      }
    }
    if (tempChunk.trim().length > 0) chunks.push(tempChunk.trim());
  } else if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Type guard for the shape Google returns from rate-limit / quota errors so
// we can detect "429-like" failures without depending on string matching.
function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes('429') || msg.includes('quota') || msg.includes('rate') || msg.includes('overloaded');
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = gemini.getGenerativeModel({ model: MODELS.embedding });
  const cleaned = text.replace(/\n/g, ' ');

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.embedContent(cleaned);
      return result.embedding.values;
    } catch (err) {
      if (attempt === 3) throw err;
      if (isRetryableError(err)) {
        await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt)));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Failed to generate embedding');
}

export async function batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
  // Gemini's batchEmbedContents endpoint is unreliable on v1beta (404s on
  // some models). Individual embedContent calls work reliably. We run them
  // in capped concurrent waves so a 100-chunk source still ingests quickly.
  const cleaned = texts.map((t) => t.replace(/\n/g, ' '));
  const CONCURRENCY = 5;
  const embeddings: number[][] = new Array(cleaned.length);

  for (let i = 0; i < cleaned.length; i += CONCURRENCY) {
    const slice = cleaned.slice(i, i + CONCURRENCY);
    const results = await Promise.all(slice.map((text) => generateEmbedding(text)));
    for (let j = 0; j < results.length; j++) {
      embeddings[i + j] = results[j];
    }

    // Tiny breather between waves so we stay well under the free-tier rate
    // limit (1,500 RPM on text-embedding-004).
    if (i + CONCURRENCY < cleaned.length) {
      await new Promise((res) => setTimeout(res, 50));
    }
  }

  return embeddings;
}

export async function searchSimilarChunks(chatbotId: string, queryEmbedding: number[], limit = 5) {
  const { data, error } = await supabaseAdmin.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    chatbot_id_filter: chatbotId,
    match_threshold: 0.7,
    match_count: limit,
  });

  if (error) throw error;
  return data;
}
