export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          user_id: string
          name: string
          plan: 'free' | 'trial' | 'starter' | 'pro' | 'business'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          message_count_this_month: number
          trial_ends_at: string | null
          trial_plan: string | null
          billing_period_start: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          plan?: 'free' | 'trial' | 'starter' | 'pro' | 'business'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          message_count_this_month?: number
          trial_ends_at?: string | null
          trial_plan?: string | null
          billing_period_start?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
        Relationships: []
      }
      chatbots: {
        Row: {
          id: string
          org_id: string
          name: string
          system_prompt: string | null
          accent_color: string
          welcome_message: string
          placeholder_text: string
          show_branding: boolean
          allowed_domains: string[] | null
          total_messages: number
          is_active: boolean
          widget_position: 'bottom-right' | 'bottom-left'
          lead_capture_mode: 'off' | 'optional' | 'required' | 'after_first'
          gdpr_consent: boolean
          suggested_questions: string[] | null
          slack_webhook_url: string | null
          notify_on_escalation: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          system_prompt?: string | null
          accent_color?: string
          welcome_message?: string
          placeholder_text?: string
          show_branding?: boolean
          allowed_domains?: string[] | null
          total_messages?: number
          is_active?: boolean
          widget_position?: 'bottom-right' | 'bottom-left'
          lead_capture_mode?: 'off' | 'optional' | 'required' | 'after_first'
          gdpr_consent?: boolean
          suggested_questions?: string[] | null
          slack_webhook_url?: string | null
          notify_on_escalation?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['chatbots']['Insert']>
        Relationships: []
      }
      sources: {
        Row: {
          id: string
          chatbot_id: string
          type: 'url' | 'pdf' | 'docx' | 'text' | 'sitemap' | 'md' | 'csv' | 'json' | 'txt'
          name: string
          url: string | null
          status: 'pending' | 'processing' | 'ready' | 'error'
          chunk_count: number
          content_hash: string | null
          last_synced_at: string | null
          sync_schedule: 'manual' | 'daily' | 'weekly' | 'monthly'
          created_at: string
        }
        Insert: {
          id?: string
          chatbot_id: string
          type: 'url' | 'pdf' | 'docx' | 'text' | 'sitemap' | 'md' | 'csv' | 'json' | 'txt'
          name: string
          url?: string | null
          status?: 'pending' | 'processing' | 'ready' | 'error'
          chunk_count?: number
          content_hash?: string | null
          last_synced_at?: string | null
          sync_schedule?: 'manual' | 'daily' | 'weekly' | 'monthly'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['sources']['Insert']>
        Relationships: []
      }
      chunks: {
        Row: {
          id: string
          source_id: string
          chatbot_id: string
          content: string
          embedding: number[] | null
          token_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          source_id: string
          chatbot_id: string
          content: string
          embedding?: number[] | null
          token_count?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['chunks']['Insert']>
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          chatbot_id: string
          session_id: string
          started_at: string
          message_count: number
          resolved: boolean
          lead_email: string | null
          lead_name: string | null
          category: string | null
          last_message_at: string | null
        }
        Insert: {
          id?: string
          chatbot_id: string
          session_id: string
          started_at?: string
          message_count?: number
          resolved?: boolean
          lead_email?: string | null
          lead_name?: string | null
          category?: string | null
          last_message_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          sources_used: string[] | null
          was_escalated: boolean
          feedback: number
          confidence: number | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          sources_used?: string[] | null
          was_escalated?: boolean
          feedback?: number
          confidence?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
        Relationships: []
      }
      profiles: {
        Row: {
          user_id: string
          full_name: string | null
          avatar_url: string | null
          theme: 'light' | 'dark' | 'system'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          theme?: 'light' | 'dark' | 'system'
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      unanswered_questions: {
        Row: {
          id: string
          chatbot_id: string
          question: string
          count: number
          last_asked_at: string
          resolved_at: string | null
          answer: string | null
          source_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chatbot_id: string
          question: string
          count?: number
          last_asked_at?: string
          resolved_at?: string | null
          answer?: string | null
          source_id?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['unanswered_questions']['Insert']>
        Relationships: []
      }
      audit_log: {
        Row: {
          id: string
          org_id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_log']['Insert']>
        Relationships: []
      }
      api_keys: {
        Row: {
          id: string
          org_id: string
          name: string
          prefix: string
          key_hash: string
          last_used_at: string | null
          created_at: string
          revoked_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          prefix: string
          key_hash: string
          last_used_at?: string | null
          created_at?: string
          revoked_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['api_keys']['Insert']>
        Relationships: []
      }
      trial_blocklist: {
        Row: {
          id: string
          email_hash: string
          reason: string
          blocked_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          email_hash: string
          reason?: string
          blocked_at?: string
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['trial_blocklist']['Insert']>
        Relationships: []
      }
      webhook_subscriptions: {
        Row: {
          id: string
          org_id: string
          url: string
          events: string[]
          secret: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          url: string
          events: string[]
          secret: string
          is_active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['webhook_subscriptions']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: number[]
          chatbot_id_filter: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          content: string
          similarity: number
          source_name: string
        }[]
      }
      increment_message_counters: {
        Args: {
          p_chatbot_id: string
          p_org_id: string
          p_conversation_id: string
          p_limit: number
        }
        Returns: boolean
      }
      delete_chatbot_cascade: {
        Args: {
          p_chatbot_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      delete_source_cascade: {
        Args: {
          p_source_id: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
