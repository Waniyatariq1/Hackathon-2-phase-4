'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen, MessageCircle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface WelcomePopupProps {
  userName?: string;
  onClose: () => void;
}

export function WelcomePopup({ userName, onClose }: WelcomePopupProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome popup before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 300);
    } else {
      onClose();
    }
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWelcome', 'true');
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleGetStarted = () => {
    handleClose();
    router.push('/chat');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={cn(
        'bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full',
        'border border-slate-200 dark:border-zinc-800',
        'transform transition-all duration-300',
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      )}>
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 p-6 rounded-t-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Welcome to KitabKosh! 👋
          </h2>
          <p className="text-white/90 text-center text-sm">
            {userName ? `Hi ${userName}! ` : ''}Let's get you started with your reading journey
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Add Your Books</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Start by adding books to your reading list. Track what you're reading and what you've completed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Assistant</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Use our AI assistant to manage books through natural language. Just chat and it will help you!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/40 rounded-lg">
                <TrendingUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Track Progress</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Monitor your reading statistics and see your progress with beautiful charts and insights.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleGetStarted}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Try AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

