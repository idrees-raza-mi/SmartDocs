# DocWise AI

A production-grade SaaS platform that trains an AI on your documentation and gives you an embeddable chat widget for your website.

## 🚀 Local Setup

1. **Database Setup (Supabase)**
   - Create a new Supabase project.
   - Run the SQL script from `supabase-schema.sql` in the Supabase SQL Editor.
   - This script creates all tables, enables the `pgvector` extension, sets up RLS policies, and creates the `match_chunks` function.

2. **Environment Variables**
   - Copy `.env.local` and fill in your actual keys.
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase Project Settings > API.
   - `SUPABASE_SERVICE_ROLE_KEY` from the same page (keep this secret!).
   - `OPENAI_API_KEY` from OpenAI dashboard.
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` from Stripe.

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

## 🧠 How the RAG Pipeline Works

1. **Ingestion (`lib/embeddings.ts` & `lib/parsers/`)**
   - We extract raw text from uploaded PDFs, Docx, or scraped URLs using specialized parsers.
   - The text is chunked into arrays of ~400 tokens using a smart paragraph/sentence splitting algorithm that maintains a 50-token overlap between chunks. This overlap ensures context isn't lost at boundaries.
   - We batch these chunks and send them to OpenAI's `text-embedding-3-small` model to generate 1536-dimensional vector embeddings.
   - These vectors are saved to the `chunks` table in Supabase via the Service Role key.

2. **Retrieval (`api/chat/route.ts`)**
   - When a user asks a question, we embed their message using the same OpenAI model.
   - We call the Supabase RPC function `match_chunks`, which performs a vector similarity search (Cosine distance) using `pgvector`.
   - It retrieves the top 5 chunks with a similarity score > 0.7.

3. **Generation (Streaming)**
   - The retrieved chunks are formatted into a rigid system prompt that instructs `gpt-4o-mini` to **only** answer based on the provided context.
   - The response is streamed back to the widget word-by-word using a `ReadableStream`.

## 📦 Deployment Steps

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Add all the environment variables from `.env.local` to the Vercel project settings.
4. Deploy!
