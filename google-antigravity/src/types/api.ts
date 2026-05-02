export interface ChatRequest {
  chatbotId: string;
  message: string;
  sessionId: string;
  conversationId?: string;
}

export interface IngestUrlRequest {
  chatbotId: string;
  url: string;
}

export interface IngestTextRequest {
  chatbotId: string;
  name: string;
  content: string;
}

export interface IngestResponse {
  chunkCount: number;
  characterCount: number;
}
