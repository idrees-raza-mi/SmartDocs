import { gemini, MODELS, EMBEDDING_DIMENSIONS } from './llm';
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

function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes('429') || msg.includes('quota') || msg.includes('rate') || msg.includes('overloaded') || msg.includes('500') || msg.includes('503');
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const cleaned = text.replace(/\n/g, ' ');

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await gemini.models.embedContent({
        model: MODELS.embedding,
        contents: cleaned,
        config: { outputDimensionality: EMBEDDING_DIMENSIONS },
      });
      const values = result.embeddings?.[0]?.values;
      if (!values) throw new Error('Embedding response missing values');
      return values;
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
  // The new SDK accepts an array of contents in a single embedContent call.
  // Hard cap of 100 per request so we stay well under the rate limit.
  const cleaned = texts.map((t) => t.replace(/\n/g, ' '));
  const BATCH_SIZE = 100;
  const embeddings: number[][] = [];

  for (let i = 0; i < cleaned.length; i += BATCH_SIZE) {
    const batch = cleaned.slice(i, i + BATCH_SIZE);
    let succeeded = false;

    for (let attempt = 1; attempt <= 3 && !succeeded; attempt++) {
      try {
        const result = await gemini.models.embedContent({
          model: MODELS.embedding,
          contents: batch,
          config: { outputDimensionality: EMBEDDING_DIMENSIONS },
        });
        const vectors = result.embeddings?.map((e) => e.values).filter((v): v is number[] => Array.isArray(v));
        if (!vectors || vectors.length !== batch.length) {
          throw new Error(`Expected ${batch.length} embeddings, got ${vectors?.length ?? 0}`);
        }
        embeddings.push(...vectors);
        succeeded = true;
      } catch (err) {
        if (attempt === 3) throw err;
        if (isRetryableError(err)) {
          await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt)));
        } else {
          throw err;
        }
      }
    }

    if (i + BATCH_SIZE < cleaned.length) {
      await new Promise((res) => setTimeout(res, 100));
    }
  }

  return embeddings;
}

export async function searchSimilarChunks(chatbotId: string, queryEmbedding: number[], limit = 5) {
  // Threshold tuned for Gemini embeddings (gemini-embedding-001 + 768-dim).
  // Gemini's cosine similarity scores typically peak around 0.5-0.7 for
  // strong semantic matches (vs 0.8-0.9 for OpenAI). A 0.3 floor still
  // filters out clearly unrelated chunks while letting good matches through.
  const { data, error } = await supabaseAdmin.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    chatbot_id_filter: chatbotId,
    match_threshold: 0.3,
    match_count: limit,
  });

  if (error) throw error;
  return data;
}
