'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SendMessage } from '@/lib/chat-api';
import { useChatContext } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { getJWTToken } from '@/lib/get-jwt-token';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType, ToolCall } from '@/types/chat';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * ChatKit main component for conversational interface
 */
export function ChatKit() {
  const { conversationId, setConversationId } = useChatContext();
  const { user } = useAuth();
  const { fetchTasks } = useTasks(); // Add useTasks hook to refresh tasks after tool calls
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [toolCallsMap, setToolCallsMap] = useState<Record<number, ToolCall[]>>({});

  // Get user ID from auth context
  const userId = user?.id || '';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history when conversationId changes
  useEffect(() => {
    // In a real implementation, you might want to fetch conversation history from backend
    // For now, we'll just clear messages when conversation changes
    if (conversationId === null) {
      setMessages([]);
      setToolCallsMap({});
    }
  }, [conversationId]);

  const handleSend = async (messageText: string) => {
    if (!userId) {
      toast.error('Please sign in to use chat');
      return;
    }

    // Add user message to UI immediately
    const userMessage: ChatMessageType = {
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Get JWT token
      const token = await getJWTToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Extract user ID from JWT token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const jwtUserId = payload.userId || payload.sub || payload.user_id || userId;

      // Send message to backend
      const response = await SendMessage(messageText, conversationId, jwtUserId);

      // Update conversation ID if this is a new conversation
      if (response.conversation_id && response.conversation_id !== conversationId) {
        setConversationId(response.conversation_id);
      }

      // Add assistant response to messages
      const assistantMessage: ChatMessageType = {
        role: 'assistant',
        content: response.response,
        conversation_id: response.conversation_id,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Store tool calls for this message
      if (response.tool_calls && response.tool_calls.length > 0) {
        setToolCallsMap((prev) => ({
          ...prev,
          [messages.length + 1]: response.tool_calls, // Index of assistant message
        }));
        
        // Refresh tasks after tool calls (e.g., add_book, update_book, delete_book)
        // This ensures the table view shows the latest data
        const hasBookToolCall = response.tool_calls.some(
          (tc: ToolCall) => 
            tc.name === 'add_book' || 
            tc.name === 'update_book' || 
            tc.name === 'delete_book' || 
            tc.name === 'complete_book'
        );
        
        if (hasBookToolCall) {
          // Small delay to ensure backend has processed the request
          setTimeout(() => {
            fetchTasks().catch((err) => {
              console.error('Failed to refresh tasks after tool call:', err);
            });
          }, 500);
        }
      }

      // Clear any previous errors
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);

      // Remove user message on error (optional - you might want to keep it)
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { text: "Add a book 'Peer e Kamil'", icon: "📚" },
    { text: "Show me all my books", icon: "📖" },
    { text: "What books am I reading?", icon: "🔍" },
    { text: "Mark 'Peer e Kamil' as completed", icon: "✅" },
  ];

  const handleQuickAction = (actionText: string) => {
    handleSend(actionText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] bg-gradient-to-b from-white via-slate-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden backdrop-blur-sm">
      {/* Messages area */}
      <div
        className={cn(
          "flex-1 px-4 py-6 space-y-4 scroll-smooth bg-gradient-to-b from-transparent via-purple-50/30 to-transparent dark:via-purple-950/20",
          messages.length === 0 ? "overflow-hidden" : "overflow-y-auto"
        )}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full text-center px-4 py-3">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-15"></div>
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-2 ring-purple-200 dark:ring-purple-900/50">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full border-2 border-white dark:border-zinc-900 animate-ping"></div>
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900"></div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to AI Assistant! 👋
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mb-4 leading-relaxed px-2">
              I can help you manage your books through natural language. Try asking me to create, list, update, or delete books. I'll also ask you about priority when adding new books!
            </p>
            
            {/* Quick Actions */}
            <div className="w-full max-w-2xl space-y-2">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-center gap-2">
                <span className="w-5 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent dark:via-purple-600"></span>
                <span>Quick Actions</span>
                <span className="w-5 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent dark:via-purple-600"></span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.text)}
                    disabled={loading || !userId}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-left text-[11px] sm:text-xs font-medium',
                      'bg-gradient-to-br from-white to-slate-50 dark:from-zinc-800 dark:to-zinc-700',
                      'border border-slate-200 dark:border-zinc-700 rounded-lg',
                      'hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30',
                      'hover:border-blue-400 dark:hover:border-purple-500',
                      'transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                      'group relative overflow-hidden',
                      'before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:to-purple-500/10',
                      'before:opacity-0 hover:before:opacity-100 before:transition-opacity'
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="text-base sm:text-lg relative z-10 transform group-hover:scale-110 transition-transform flex-shrink-0">{action.icon}</span>
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-purple-400 transition-colors relative z-10 font-medium truncate">
                      {action.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                toolCalls={toolCallsMap[index]}
              />
            ))}
            {loading && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 dark:border-zinc-800 bg-gradient-to-b from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950">
        {messages.length > 0 && messages.length < 3 && (
          <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
            {quickActions.slice(0, 2).map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.text)}
                disabled={loading || !userId}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-full',
                  'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400',
                  'hover:bg-blue-100 dark:hover:bg-blue-900/30',
                  'hover:text-blue-700 dark:hover:text-blue-400',
                  'transition-all duration-200 transform hover:scale-105',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'border border-slate-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600'
                )}
              >
                {action.icon} {action.text.split("'")[0]}
              </button>
            ))}
          </div>
        )}
        <ChatInput
          onSend={handleSend}
          disabled={!userId}
          loading={loading}
          placeholder={
            !userId
              ? 'Please sign in to use chat'
              : 'Type your message... (e.g., "Add a book \'Peer e Kamil\'")'
          }
        />
      </div>
    </div>
  );
}

