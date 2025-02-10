export interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  imageUrl?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}