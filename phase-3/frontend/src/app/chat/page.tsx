'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { ChatProvider, useChatContext } from '@/contexts/ChatContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatKit } from '@/components/chat/ChatKit';

function ChatContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { setView } = useChatContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Ensure we're in chat view when on this page
  useEffect(() => {
    setView('chat');
  }, [setView]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="lg:pl-64 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                AI Assistant
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage books through natural language
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <ChatKit />
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <TaskProvider>
      <ChatProvider>
        <ChatContent />
      </ChatProvider>
    </TaskProvider>
  );
}

