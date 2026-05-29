-- =============================================
-- FIX 1: DATABASE SCHEMA UPDATES
-- =============================================

-- Add missing columns to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_plan text,
  ADD COLUMN IF NOT EXISTS billing_period_start timestamptz;

-- Update plan CHECK constraint to include trial
ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS organizations_plan_check;

ALTER TABLE organizations
  ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('free', 'trial', 'starter', 'pro', 'business'));

-- Update default plan to trial
ALTER TABLE organizations
  ALTER COLUMN plan SET DEFAULT 'trial';

-- Add is_active to chatbots
ALTER TABLE chatbots
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;


-- =============================================
-- FIX 2: AUTO-CREATE ORG ON SIGNUP (trigger)
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.organizations (
    user_id,
    name,
    plan,
    trial_ends_at,
    trial_plan,
    message_count_this_month,
    billing_period_start
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'company_name', split_part(new.email, '@', 1)),
    'trial',
    now() + interval '7 days',
    COALESCE(new.raw_user_meta_data->>'selected_plan', 'starter'),
    0,
    now()
  )
  ON CONFLICT DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =============================================
-- FIX 3: ATOMIC COUNTERS & QUOTA GATE
-- =============================================

-- Atomically check quota and increment all message counters in one transaction.
-- Returns true if the message was accepted (under limit), false if the org is over its monthly cap.
CREATE OR REPLACE FUNCTION public.increment_message_counters(
  p_chatbot_id uuid,
  p_org_id uuid,
  p_conversation_id uuid,
  p_limit int
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_count int;
BEGIN
  -- Atomically increment org-level counter only if under the limit. Conditional UPDATE
  -- prevents the read-then-write race that lets concurrent requests blow past the cap.
  UPDATE public.organizations
     SET message_count_this_month = message_count_this_month + 1
   WHERE id = p_org_id
     AND message_count_this_month < p_limit
  RETURNING message_count_this_month INTO v_count;

  IF v_count IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.chatbots
     SET total_messages = total_messages + 1
   WHERE id = p_chatbot_id;

  UPDATE public.conversations
     SET message_count = message_count + 1
   WHERE id = p_conversation_id;

  RETURN true;
END;
$$;


-- =============================================
-- FIX 4: CASCADE DELETE CHATBOT
-- =============================================

CREATE OR REPLACE FUNCTION public.delete_chatbot_cascade(p_chatbot_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owns boolean;
BEGIN
  -- Ownership check: the chatbot must belong to an org owned by the caller.
  SELECT EXISTS(
    SELECT 1
      FROM public.chatbots c
      JOIN public.organizations o ON o.id = c.org_id
     WHERE c.id = p_chatbot_id
       AND o.user_id = p_user_id
  ) INTO v_owns;

  IF NOT v_owns THEN
    RETURN false;
  END IF;

  DELETE FROM public.messages
   WHERE conversation_id IN (
     SELECT id FROM public.conversations WHERE chatbot_id = p_chatbot_id
   );
  DELETE FROM public.conversations WHERE chatbot_id = p_chatbot_id;
  DELETE FROM public.chunks WHERE chatbot_id = p_chatbot_id;
  DELETE FROM public.sources WHERE chatbot_id = p_chatbot_id;
  DELETE FROM public.chatbots WHERE id = p_chatbot_id;

  RETURN true;
END;
$$;


-- =============================================
-- FIX 5: CASCADE DELETE SOURCE (chunks only)
-- =============================================

CREATE OR REPLACE FUNCTION public.delete_source_cascade(p_source_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owns boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1
      FROM public.sources s
      JOIN public.chatbots c ON c.id = s.chatbot_id
      JOIN public.organizations o ON o.id = c.org_id
     WHERE s.id = p_source_id
       AND o.user_id = p_user_id
  ) INTO v_owns;

  IF NOT v_owns THEN
    RETURN false;
  END IF;

  DELETE FROM public.chunks WHERE source_id = p_source_id;
  DELETE FROM public.sources WHERE id = p_source_id;
  RETURN true;
END;
$$;


-- =============================================
-- FIX 6: EXTRA COLUMNS + NEW TABLES (idempotent)
-- =============================================

-- Source enrichment for re-crawl and dedup
ALTER TABLE public.sources
  ADD COLUMN IF NOT EXISTS content_hash text,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS sync_schedule text CHECK (sync_schedule IN ('manual','daily','weekly','monthly')) DEFAULT 'manual';

-- Per-message feedback
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS feedback smallint CHECK (feedback IN (-1, 0, 1)) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS confidence numeric;

-- Chatbot widget configuration knobs
ALTER TABLE public.chatbots
  ADD COLUMN IF NOT EXISTS widget_position text CHECK (widget_position IN ('bottom-right','bottom-left')) DEFAULT 'bottom-right',
  ADD COLUMN IF NOT EXISTS lead_capture_mode text CHECK (lead_capture_mode IN ('off','optional','required','after_first')) DEFAULT 'off',
  ADD COLUMN IF NOT EXISTS gdpr_consent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS suggested_questions text[],
  ADD COLUMN IF NOT EXISTS slack_webhook_url text,
  ADD COLUMN IF NOT EXISTS notify_on_escalation boolean DEFAULT false;

-- Conversation enrichment for analytics
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS lead_email text,
  ADD COLUMN IF NOT EXISTS lead_name text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS last_message_at timestamptz;

-- Profile (avatar etc.)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  theme text CHECK (theme IN ('light','dark','system')) DEFAULT 'system',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles self read" ON public.profiles;
DROP POLICY IF EXISTS "profiles self write" ON public.profiles;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles self write" ON public.profiles FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile row on signup (extends the existing user trigger).
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'company_name'))
  ON CONFLICT DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Knowledge gap / review queue: unanswered question clusters
CREATE TABLE IF NOT EXISTS public.unanswered_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES public.chatbots ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  count integer DEFAULT 1,
  last_asked_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  answer text,
  source_id uuid REFERENCES public.sources ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS unanswered_chatbot_idx ON public.unanswered_questions(chatbot_id, resolved_at);
ALTER TABLE public.unanswered_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "unanswered owner all" ON public.unanswered_questions;
CREATE POLICY "unanswered owner all" ON public.unanswered_questions FOR ALL USING (
  chatbot_id IN (SELECT id FROM public.chatbots WHERE org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid()))
);

-- Audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_org_idx ON public.audit_log(org_id, created_at DESC);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit owner read" ON public.audit_log;
CREATE POLICY "audit owner read" ON public.audit_log FOR SELECT USING (
  org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid())
);

-- API keys for the developer (Business) tier
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS api_keys_org_idx ON public.api_keys(org_id);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "api_keys owner all" ON public.api_keys;
CREATE POLICY "api_keys owner all" ON public.api_keys FOR ALL USING (
  org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid())
);

-- Webhook subscriptions
CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL,
  secret text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "webhooks owner all" ON public.webhook_subscriptions;
CREATE POLICY "webhooks owner all" ON public.webhook_subscriptions FOR ALL USING (
  org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid())
);

-- Unique source guard (per chatbot, per URL or per (type, name))
CREATE UNIQUE INDEX IF NOT EXISTS sources_chatbot_url_unique
  ON public.sources(chatbot_id, url) WHERE url IS NOT NULL;

-- Storage bucket for avatars (run once via dashboard if buckets not in SQL scope):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- =============================================
-- FIX 7: HNSW REPLACES IVFFLAT FOR BETTER SCALE
-- =============================================
-- Safe: drop old index name only if exists, create new in-place.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'chunks_embedding_idx') THEN
    DROP INDEX public.chunks_embedding_idx;
  END IF;
  -- Drop unnamed ivfflat we created in the original schema if it lingers
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'chunks' AND indexdef ILIKE '%ivfflat%') THEN
    EXECUTE (
      SELECT 'DROP INDEX public.' || quote_ident(indexname)
        FROM pg_indexes
       WHERE tablename = 'chunks' AND indexdef ILIKE '%ivfflat%'
       LIMIT 1
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw
  ON public.chunks USING hnsw (embedding vector_cosine_ops);


-- =============================================
-- FIX 8: TRIAL ABUSE PREVENTION
-- =============================================
-- Stores a SHA-256 hash of normalized emails that have previously had an
-- account. Used to prevent the "sign up → use trial → delete → sign up again
-- for unlimited trials" loop. We store only the hash, not the email itself,
-- so this complies with right-to-erasure: the user's email is gone but the
-- one-way fingerprint remains.

CREATE TABLE IF NOT EXISTS public.trial_blocklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text UNIQUE NOT NULL,
  reason text NOT NULL DEFAULT 'previous_account_deleted',
  blocked_at timestamptz DEFAULT now(),
  notes text
);

CREATE INDEX IF NOT EXISTS trial_blocklist_email_hash_idx
  ON public.trial_blocklist(email_hash);

-- Only the service role can read/write this table. Never expose it to clients.
ALTER TABLE public.trial_blocklist ENABLE ROW LEVEL SECURITY;
-- No policies = no anon access.


-- =============================================
-- FIX 9: SWITCH FROM OPENAI (1536-dim) TO GEMINI (768-dim) EMBEDDINGS
-- =============================================
-- The chunks.embedding column is sized for OpenAI text-embedding-3-small
-- (1536 dimensions). Gemini text-embedding-004 returns 768-dim vectors, so
-- we must:
--   1. Delete all existing chunk rows (different model = incomparable vectors)
--   2. Drop the HNSW index (depends on the column's dimensionality)
--   3. Alter the column to vector(768)
--   4. Recreate the HNSW index
--   5. Update match_chunks() so its parameter type matches
--
-- After this runs, every Source must be re-ingested by the owner (they can
-- click "Re-sync" on URL sources, or delete + re-add for files/text).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'chunks'
      AND column_name = 'embedding'
      AND udt_name = 'vector'
  ) THEN
    -- 1. Drop dependent indexes
    DROP INDEX IF EXISTS public.chunks_embedding_hnsw;
    DROP INDEX IF EXISTS public.chunks_embedding_idx;

    -- 2. Wipe existing embeddings (incompatible dimensionality)
    TRUNCATE TABLE public.chunks;
    -- Mark every existing source as needing re-ingestion
    UPDATE public.sources SET chunk_count = 0, status = 'pending';

    -- 3. Resize the column
    ALTER TABLE public.chunks ALTER COLUMN embedding TYPE vector(768);

    -- 4. Recreate the HNSW index for the new dimensionality
    CREATE INDEX chunks_embedding_hnsw
      ON public.chunks USING hnsw (embedding vector_cosine_ops);
  END IF;
END $$;

-- 5. Recreate match_chunks with a vector(768) signature so the RPC accepts
--    the new embedding shape. CREATE OR REPLACE preserves callers.
CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding vector(768),
  chatbot_id_filter uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE(id uuid, content text, similarity float, source_name text)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.content,
    1 - (c.embedding <=> query_embedding) AS similarity,
    s.name as source_name
  FROM public.chunks c
  JOIN public.sources s ON c.source_id = s.id
  WHERE c.chatbot_id = chatbot_id_filter
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
