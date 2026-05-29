import { GoogleGenAI } from '@google/genai';

// New @google/genai SDK uses the stable v1 endpoint, which supports the
// current generation of models reliably (the older @google/generative-ai
// SDK called v1beta and 404'd on text-embedding-004 / embedContent calls).
const apiKey = process.env.GEMINI_API_KEY ?? '';
export const gemini = new GoogleGenAI({ apiKey });

export const MODELS = {
  // gemini-2.0-flash-001 has limit=0 on the free tier — only the -exp variant
  // and gemini-1.5-flash are free. 1.5-flash is older but rock-solid and
  // supports the same conversational features we need.
  chat: 'gemini-1.5-flash',
  // Embedding model — configurable output dimension. We pin to 768 so the
  // pgvector column shape matches chunks.embedding.
  embedding: 'gemini-embedding-001',
} as const;

// Vector dimension used for chunks.embedding and the match_chunks RPC.
// Changing this requires a Supabase migration (see supabase-migration.sql).
export const EMBEDDING_DIMENSIONS = 768;
