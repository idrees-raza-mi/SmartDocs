import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY ?? '';
export const gemini = new GoogleGenAI({ apiKey });

// Model picks as of late 2025 / early 2026. Google has shuffled the Gemini
// model lineup repeatedly; if Google deprecates one of these we'll see a
// 404 "models/... is not found" in the chat route and we can swap it here.
//
// Current free-tier roster (per https://ai.google.dev/gemini-api/docs/models):
//   - gemini-2.5-flash       ✓ free (10 RPM, 250 RPD)
//   - gemini-2.5-flash-lite  ✓ free (15 RPM, 1000 RPD)
//   - gemini-embedding-001   ✓ free (1500 RPM)
// Paid-only (limit=0 on free tier):
//   - gemini-2.0-flash, gemini-2.0-flash-001, gemini-2.5-pro
// Deprecated from v1beta:
//   - gemini-1.5-flash, gemini-1.5-pro
export const MODELS = {
  chat: 'gemini-2.5-flash',
  embedding: 'gemini-embedding-001',
} as const;

// Chat fallback order — tried in sequence by callContentStreamWithFallback().
// If the primary model returns 404 (deprecated) or 429 with limit=0 (free
// tier not available), we automatically retry with the next entry. This
// keeps the bot running through Google's frequent model lineup churn.
export const CHAT_MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-exp',
] as const;

// Vector dimension used for chunks.embedding and the match_chunks RPC.
// Changing this requires a Supabase migration (see supabase-migration.sql).
export const EMBEDDING_DIMENSIONS = 768;
