import { openai } from './openai';
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

export async function generateEmbedding(text: string): Promise<number[]> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
      });
      return response.data[0].embedding;
    } catch (error: any) {
      if (attempt === 3) throw error;
      if (error.status === 429) {
        await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt)));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Failed to generate embedding');
}

export async function batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
  const batchSize = 100;
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch.map(t => t.replace(/\n/g, ' ')),
    });
    
    const batchEmbeddings = response.data
      .sort((a, b) => a.index - b.index)
      .map(d => d.embedding);
      
    embeddings.push(...batchEmbeddings);
    
    if (i + batchSize < texts.length) {
      await new Promise(res => setTimeout(res, 100));
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
