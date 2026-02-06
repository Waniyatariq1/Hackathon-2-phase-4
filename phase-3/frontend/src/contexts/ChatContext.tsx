'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/**
 * Chat view mode
 */
export type ChatViewMode = 'gui' | 'chat';

/**
 * Chat context state
 */
export interface ChatContextState {
  currentView: ChatViewMode;
  conversationId: number | null;
}

/**
 * Chat context actions
 */
export interface ChatContextActions {
  toggleView: () => void;
  setView: (view: ChatViewMode) => void;
  setConversationId: (id: number | null) => void;
}

/**
 * Chat context value
 */
export interface ChatContextValue extends ChatContextState, ChatContextActions {}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

/**
 * Chat provider component
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ChatViewMode>('gui');
  const [conversationId, setConversationId] = useState<number | null>(null);

  const toggleView = useCallback(() => {
    setCurrentView((prev) => (prev === 'gui' ? 'chat' : 'gui'));
  }, []);

  const setView = useCallback((view: ChatViewMode) => {
    setCurrentView(view);
  }, []);

  const setConversationIdHandler = useCallback((id: number | null) => {
    setConversationId(id);
  }, []);

  const value: ChatContextValue = {
    currentView,
    conversationId,
    toggleView,
    setView,
    setConversationId: setConversationIdHandler,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Hook to access chat context
 */
export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}

