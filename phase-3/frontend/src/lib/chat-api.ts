/**
 * Chat API client for sending messages and receiving AI responses
 *
 * This module provides type-safe functions for interacting with the chat endpoint.
 * All requests include JWT authentication automatically.
 */

import type { ChatRequest, ChatResponse } from '@/types/chat';
import { getJWTToken } from './get-jwt-token';

/**
 * Send a chat message and receive AI response
 *
 * @param message - User's natural language message
 * @param conversationId - Optional conversation ID (creates new if not provided)
 * @param userId - User ID from JWT token
 * @returns Chat response with assistant message and tool calls
 * @throws Error if request fails or user is not authenticated
 */
export async function SendMessage(
  message: string,
  conversationId: number | null | undefined,
  userId: string
): Promise<ChatResponse> {
  const token = await getJWTToken();

  if (!token) {
    throw new Error('No authentication token available');
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const url = `${baseUrl}/api/${userId}/chat`;

  const requestBody: ChatRequest = {
    message,
    conversation_id: conversationId || null,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - please sign in again');
      }
      if (response.status === 403) {
        throw new Error('Forbidden - user ID mismatch');
      }
      if (response.status === 404) {
        throw new Error('Conversation not found');
      }
      if (response.status === 502) {
        throw new Error('AI service unavailable - please try again later');
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to send message');
  }
}

