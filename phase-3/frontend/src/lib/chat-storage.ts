/**
 * Chat storage utility for client-side conversation history persistence
 *
 * This module provides localStorage-based storage for conversation history.
 * Used for client-side persistence and quick access to recent conversations.
 */

import type { ChatMessage } from '@/types/chat';

const STORAGE_KEY_PREFIX = 'chat_conversation_';
const CONVERSATIONS_LIST_KEY = 'chat_conversations_list';

/**
 * Get conversation history from localStorage
 *
 * @param conversationId - Conversation ID
 * @returns Array of messages or empty array if not found
 */
export function getConversationHistory(conversationId: number): ChatMessage[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${conversationId}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as ChatMessage[];
  } catch (error) {
    console.error('Failed to load conversation history:', error);
    return [];
  }
}

/**
 * Save message to conversation history in localStorage
 *
 * @param conversationId - Conversation ID
 * @param message - Message to save
 */
export function saveMessage(conversationId: number, message: ChatMessage): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${conversationId}`;
    const history = getConversationHistory(conversationId);
    history.push(message);
    localStorage.setItem(key, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save message:', error);
  }
}

/**
 * Save entire conversation history to localStorage
 *
 * @param conversationId - Conversation ID
 * @param messages - Array of messages
 */
export function saveConversationHistory(
  conversationId: number,
  messages: ChatMessage[]
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${conversationId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save conversation history:', error);
  }
}

/**
 * Get list of conversation IDs from localStorage
 *
 * @returns Array of conversation IDs
 */
export function getConversationIds(): number[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(CONVERSATIONS_LIST_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as number[];
  } catch (error) {
    console.error('Failed to load conversation IDs:', error);
    return [];
  }
}

/**
 * Add conversation ID to list
 *
 * @param conversationId - Conversation ID to add
 */
export function addConversationId(conversationId: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const ids = getConversationIds();
    if (!ids.includes(conversationId)) {
      ids.push(conversationId);
      localStorage.setItem(CONVERSATIONS_LIST_KEY, JSON.stringify(ids));
    }
  } catch (error) {
    console.error('Failed to add conversation ID:', error);
  }
}

/**
 * Clear conversation history from localStorage
 *
 * @param conversationId - Conversation ID to clear
 */
export function clearConversationHistory(conversationId: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${conversationId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear conversation history:', error);
  }
}

