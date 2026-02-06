'use client';

import React, { useState, useEffect } from 'react';
import { User, Bot } from 'lucide-react';
import type { ChatMessage as ChatMessageType, ToolCall } from '@/types/chat';
import { ToolCallDisplay } from './ToolCallDisplay';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export interface ChatMessageProps {
  message: ChatMessageType;
  toolCalls?: ToolCall[];
}

/**
 * Simple markdown renderer for chat messages
 */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    
    // Check for numbered list (1. 2. etc.)
    const numberedListMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (numberedListMatch) {
      const [, number, content] = numberedListMatch;
      elements.push(
        <div key={lineIndex} className="flex gap-2 my-1.5">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0">{number}.</span>
          <span className="flex-1">{renderInlineMarkdown(content)}</span>
        </div>
      );
      return;
    }
    
    // Check for bullet list (- or *)
    const bulletListMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (bulletListMatch) {
      const [, content] = bulletListMatch;
      elements.push(
        <div key={lineIndex} className="flex gap-2 my-1.5">
          <span className="text-slate-600 dark:text-slate-400 flex-shrink-0">•</span>
          <span className="flex-1">{renderInlineMarkdown(content)}</span>
        </div>
      );
      return;
    }
    
    // Regular line with inline markdown
    if (trimmedLine) {
      elements.push(
        <div key={lineIndex} className="my-1.5">
          {renderInlineMarkdown(trimmedLine)}
        </div>
      );
    } else if (lineIndex < lines.length - 1) {
      // Empty line for spacing (but not at the end)
      elements.push(<div key={lineIndex} className="h-2" />);
    }
  });
  
  return <div className="space-y-0">{elements}</div>;
}

/**
 * Render inline markdown (bold, italic, etc.)
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  
  // Match **bold** text
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;
  let lastIndex = 0;
  let keyCounter = 0;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText) {
        parts.push(<span key={`text-${keyCounter++}`}>{beforeText}</span>);
      }
    }
    
    // Add bold text
    parts.push(
      <strong key={`bold-${keyCounter++}`} className="font-semibold">
        {match[1]}
      </strong>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      parts.push(<span key={`text-${keyCounter++}`}>{remainingText}</span>);
    }
  }
  
  // If no bold text found, return original text
  if (parts.length === 0) {
    return text;
  }
  
  return <>{parts}</>;
}

/**
 * ChatMessage component for displaying individual messages
 */
export function ChatMessage({ message, toolCalls }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Load profile image from localStorage
  useEffect(() => {
    if (isUser && user?.id && typeof window !== 'undefined') {
      const loadImage = () => {
        const savedImage = localStorage.getItem(`profile_image_${user.id}`);
        if (savedImage) {
          setProfileImage(savedImage);
        } else {
          setProfileImage(null);
        }
      };
      
      loadImage();
      
      // Listen for profile image updates
      const handleCustomStorageChange = () => {
        loadImage();
      };
      
      window.addEventListener('profileImageUpdated', handleCustomStorageChange);
      
      return () => {
        window.removeEventListener('profileImageUpdated', handleCustomStorageChange);
      };
    }
  }, [isUser, user?.id]);

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md ring-2 ring-blue-200 dark:ring-purple-900/50">
          <Bot className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
      )}

      <div
        className={cn(
          'flex flex-col gap-2 max-w-[80%] sm:max-w-[70%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-md transition-all duration-200',
            'hover:shadow-lg transform hover:scale-[1.02]',
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
              : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-700 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700'
          )}
        >
          <div className={cn(
            'text-sm leading-relaxed break-words',
            isUser ? 'text-white' : ''
          )}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {renderMarkdown(message.content)}
              </div>
            )}
          </div>
        </div>

        {!isUser && toolCalls && toolCalls.length > 0 && (
          <div className="w-full mt-1">
            <ToolCallDisplay toolCalls={toolCalls} />
          </div>
        )}

        {message.created_at && (
          <span
            className={cn(
              'text-xs text-slate-500 dark:text-zinc-500',
              isUser ? 'text-right' : 'text-left'
            )}
          >
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-md ring-2 ring-slate-200 dark:ring-slate-700 overflow-hidden">
          {profileImage ? (
            <img
              src={profileImage}
              alt="User"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-white" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  );
}

