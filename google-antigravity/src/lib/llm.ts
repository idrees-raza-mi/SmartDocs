import { GoogleGenAI } from '@google/genai';

// New @google/genai SDK uses the stable v1 endpoint, which supports the
// current generation of models reliably (the older @google/generative-ai
// SDK called v1beta and 404'd on text-embedding-004 / embedContent calls).
const apiKey = process.env.GEMINI_API_KEY ?? '';
export const gemini = new GoogleGenAI({ apiKey });

export const MODELS = {
  // Free-tier chat model: 15 RPM, 1M TPM, 1500 RPD. Supports streaming.
  chat: 'gemini-2.0-flash-001',
  // Newer embedding model; configurable output dimension. We pin to 768
  // so the pgvector column shape matches what we store in chunks.embedding.
  embedding: 'gemini-embedding-001',
} as const;

// Vector dimension used for chunks.embedding and the match_chunks RPC.
// Changing this requires a Supabase migration (see supabase-migration.sql).
export const EMBEDDING_DIMENSIONS = 768;
