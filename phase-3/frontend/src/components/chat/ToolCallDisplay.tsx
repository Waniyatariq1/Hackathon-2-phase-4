'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code } from 'lucide-react';
import type { ToolCall } from '@/types/chat';

export interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
}

/**
 * ToolCallDisplay component for showing tool calls and results (optional transparency feature)
 */
export function ToolCallDisplay({ toolCalls }: ToolCallDisplayProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggleExpanded = (index: number) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {toolCalls.map((toolCall, index) => {
        const isExpanded = expanded[index] || false;
        return (
          <div
            key={index}
            className="border border-slate-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-zinc-900/50"
          >
            <button
              onClick={() => toggleExpanded(index)}
              className="w-full px-3 py-2 flex items-center justify-between gap-2 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              aria-expanded={isExpanded}
              aria-label={`Toggle tool call ${toolCall.name} details`}
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {toolCall.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-500">
                  ({Object.keys(toolCall.arguments).length} parameters)
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>

            {isExpanded && (
              <div className="px-3 pb-3 space-y-2 border-t border-slate-200 dark:border-zinc-700">
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Arguments:
                  </div>
                  <pre className="text-xs bg-slate-100 dark:bg-zinc-800 p-2 rounded overflow-x-auto">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Result:
                  </div>
                  <pre className="text-xs bg-slate-100 dark:bg-zinc-800 p-2 rounded overflow-x-auto">
                    {JSON.stringify(toolCall.result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

