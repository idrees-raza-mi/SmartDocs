-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Organizations Table
CREATE TABLE public.organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    name text NOT NULL,
    plan text DEFAULT 'trial' CHECK (plan IN ('trial', 'starter', 'pro', 'business')),
    stripe_customer_id text,
    stripe_subscription_id text,
    message_count_this_month integer DEFAULT 0,
    trial_ends_at timestamptz,
    trial_plan text,
    billing_period_start timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Chatbots Table
CREATE TABLE public.chatbots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid REFERENCES public.organizations NOT NULL,
    name text NOT NULL,
    system_prompt text,
    accent_color text DEFAULT '#4f46e5',
    welcome_message text DEFAULT 'Hi! How can I help you today?',
    placeholder_text text DEFAULT 'Ask me anything...',
    show_branding boolean DEFAULT true,
    allowed_domains text[],
    total_messages integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Sources Table
CREATE TABLE public.sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id uuid REFERENCES public.chatbots NOT NULL,
    type text CHECK (type IN ('url', 'pdf', 'docx', 'text')),
    name text NOT NULL,
    url text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'error')),
    chunk_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Chunks Table (Embeddings)
CREATE TABLE public.chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id uuid REFERENCES public.sources NOT NULL,
    chatbot_id uuid REFERENCES public.chatbots NOT NULL,
    content text NOT NULL,
    embedding vector(1536),
    token_count integer,
    created_at timestamptz DEFAULT now()
);

-- Conversations Table
CREATE TABLE public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id uuid REFERENCES public.chatbots NOT NULL,
    session_id text NOT NULL,
    started_at timestamptz DEFAULT now(),
    message_count integer DEFAULT 0,
    resolved boolean DEFAULT false
);

-- Messages Table
CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid REFERENCES public.conversations NOT NULL,
    role text CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    sources_used uuid[],
    was_escalated boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Create Index for vector similarity search
CREATE INDEX ON public.chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own organizations" ON public.organizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own organizations" ON public.organizations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their org chatbots" ON public.chatbots FOR SELECT USING (org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their org chatbots" ON public.chatbots FOR ALL USING (org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their chatbot sources" ON public.sources FOR SELECT USING (chatbot_id IN (SELECT id FROM public.chatbots WHERE org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid())));
CREATE POLICY "Users can manage their chatbot sources" ON public.sources FOR ALL USING (chatbot_id IN (SELECT id FROM public.chatbots WHERE org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid())));

CREATE POLICY "Users can view their chatbot chunks" ON public.chunks FOR SELECT USING (chatbot_id IN (SELECT id FROM public.chatbots WHERE org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid())));
CREATE POLICY "Users can manage their chatbot chunks" ON public.chunks FOR ALL USING (chatbot_id IN (SELECT id FROM public.chatbots WHERE org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid())));

CREATE POLICY "Users can view their chatbot conversations" ON public.conversations FOR SELECT USING (chatbot_id IN (SELECT id FROM public.chatbots WHERE org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid())));
CREATE POLICY "Users can manage their chatbot conversations" ON public.conversations FOR ALL USING (chatbot_id IN (SELECT id FROM public.chatbots WHERE org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid())));

CREATE POLICY "Users can view their conversation messages" ON public.messages FOR SELECT USING (conversation_id IN (SELECT id FROM public.conversations WHERE chatbot_id IN (SELECT id FROM public.chatbots WHERE org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid()))));
CREATE POLICY "Users can manage their conversation messages" ON public.messages FOR ALL USING (conversation_id IN (SELECT id FROM public.conversations WHERE chatbot_id IN (SELECT id FROM public.chatbots WHERE org_id IN (SELECT id FROM public.organizations WHERE user_id = auth.uid()))));

-- Supabase Vector Match Function
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
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
  FROM chunks c
  JOIN sources s ON c.source_id = s.id
  WHERE c.chatbot_id = chatbot_id_filter
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
