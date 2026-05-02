import { Database } from './database';

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Chatbot = Database['public']['Tables']['chatbots']['Row'];
export type Source = Database['public']['Tables']['sources']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];

export interface ChatbotWithStats extends Chatbot {
  sourceCount: number;
  unansweredCount: number;
}
