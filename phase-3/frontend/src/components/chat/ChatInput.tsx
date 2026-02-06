'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

/**
 * ChatInput component for message input with send button
 */
export function ChatInput({
  onSend,
  disabled = false,
  loading = false,
  placeholder = 'Type your message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && !loading) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setMessage('');
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 bg-gradient-to-b from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 border-t border-slate-200 dark:border-zinc-800">
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          placeholder={placeholder}
          rows={1}
          className={cn(
            'w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-zinc-700',
            'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white',
            'placeholder:text-slate-400 dark:placeholder:text-zinc-500',
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-none overflow-hidden',
            'shadow-sm transition-all',
            'min-h-[52px] max-h-[200px]'
          )}
          style={{
            height: 'auto',
            minHeight: '52px',
          }}
          aria-label="Message input"
          aria-describedby="chat-input-help"
        />
        <div
          id="chat-input-help"
          className="sr-only"
        >
          Press Enter to send, Shift+Enter for new line, Escape to clear
        </div>
      </div>
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled || loading}
        loading={loading}
        size="md"
        className={cn(
          'h-[52px] w-[52px] p-0 flex items-center justify-center',
          'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
          'text-white shadow-lg hover:shadow-xl transition-all',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'rounded-xl'
        )}
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}

