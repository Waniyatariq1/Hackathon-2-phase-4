/**
 * Chat-related TypeScript types
 * Matches backend schemas for type safety
 */

/**
 * Message role enum
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Chat message interface
 */
export interface ChatMessage {
  id?: number;
  conversation_id?: number;
  role: MessageRole;
  content: string;
  created_at?: string;
}

/**
 * Tool call information
 */
export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
  result: Record<string, any>;
}

/**
 * Chat request payload
 */
export interface ChatRequest {
  message: string;
  conversation_id?: number | null;
}

/**
 * Chat response from backend
 */
export interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: ToolCall[];
}

/**
 * Conversation interface
 */
export interface Conversation {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Chat session state
 */
export interface ChatSession {
  conversation_id: number | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

