export type Mode = "chat" | "text" | "image" | "file";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  fileName?: string;
}

export interface Conversation {
  messages: Message[];
  systemPrompt: string;
  isLoading: boolean;
  conversationId?: string;
}

export type ConversationState = Record<Mode, Conversation>;
