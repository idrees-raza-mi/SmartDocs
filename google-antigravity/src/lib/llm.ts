import { GoogleGenerativeAI } from '@google/generative-ai';

// Single global instance — created once, reused across all routes.
// Reads GEMINI_API_KEY at import time. Throws lazily inside any model call
// if the key isn't configured, rather than at module load.
const apiKey = process.env.GEMINI_API_KEY ?? '';
export const gemini = new GoogleGenerativeAI(apiKey);

export const MODELS = {
  // gemini-2.0-flash-exp: free-tier model, 1500 RPD, 1M TPM, supports streaming
  chat: 'gemini-2.0-flash-exp',
  // text-embedding-004: 768-dimension vectors, free-tier limit 1500 RPM
  embedding: 'text-embedding-004',
} as const;

// The dimension of the embedding vectors. We use this in chunked storage and
// when defining the pgvector column shape. If this constant ever changes,
// you must run a migration to update the chunks.embedding column.
export const EMBEDDING_DIMENSIONS = 768;
