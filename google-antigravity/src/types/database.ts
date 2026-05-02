export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          user_id: string
          name: string
          plan: 'free' | 'starter' | 'pro' | 'business'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          message_count_this_month: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'message_count_this_month'> & { id?: string, message_count_this_month?: number, created_at?: string }
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
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
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chatbots']['Row'], 'id' | 'created_at' | 'total_messages'> & { id?: string, total_messages?: number, created_at?: string }
        Update: Partial<Database['public']['Tables']['chatbots']['Insert']>
      }
      sources: {
        Row: {
          id: string
          chatbot_id: string
          type: 'url' | 'pdf' | 'docx' | 'text'
          name: string
          url: string | null
          status: 'pending' | 'processing' | 'ready' | 'error'
          chunk_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sources']['Row'], 'id' | 'created_at' | 'chunk_count'> & { id?: string, chunk_count?: number, created_at?: string }
        Update: Partial<Database['public']['Tables']['sources']['Insert']>
      }
      chunks: {
        Row: {
          id: string
          source_id: string
          chatbot_id: string
          content: string
          embedding: number[]
          token_count: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chunks']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string }
        Update: Partial<Database['public']['Tables']['chunks']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          chatbot_id: string
          session_id: string
          started_at: string
          message_count: number
          resolved: boolean
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'started_at' | 'message_count' | 'resolved'> & { id?: string, started_at?: string, message_count?: number, resolved?: boolean }
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          sources_used: string[] | null
          was_escalated: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'was_escalated'> & { id?: string, created_at?: string, was_escalated?: boolean }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
    }
  }
}
