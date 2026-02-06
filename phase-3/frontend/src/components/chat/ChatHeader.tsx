'use client';

import React from 'react';
import { BookOpen, List } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

/**
 * ChatHeader component with toggle button to switch between GUI and Chat views
 */
export function ChatHeader() {
  const { currentView, toggleView } = useChatContext();

  return (
    <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {currentView === 'chat' ? 'AI Assistant' : 'Books'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {currentView === 'chat'
              ? 'Manage books through natural language'
              : 'Manage and organize your reading list'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => currentView !== 'gui' && toggleView()}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5',
              currentView === 'gui'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
            aria-label="Switch to GUI view"
          >
            <List className="w-4 h-4" />
            GUI
          </button>
          <button
            onClick={() => currentView !== 'chat' && toggleView()}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5',
              currentView === 'chat'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
            aria-label="Switch to Chat view"
          >
            <BookOpen className={cn(
              "w-4 h-4 transition-transform",
              currentView === 'chat' && "animate-pulse"
            )} />
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}

