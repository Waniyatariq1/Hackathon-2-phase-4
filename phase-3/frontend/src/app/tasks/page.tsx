'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { TaskProvider } from '@/contexts/TaskContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskTable } from '@/components/tasks/TaskTable';
import { Button } from '@/components/ui/Button';
import { Sidebar } from '@/components/layout/Sidebar';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatKit } from '@/components/chat/ChatKit';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

function TasksContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { currentView } = useChatContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('table');
  const { tasks, loading, fetchTasks } = useTasks();

  useEffect(() => {
    if (isAuthenticated && !loading && tasks.length === 0) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  // Refresh tasks when switching from chat to GUI view
  useEffect(() => {
    if (currentView === 'gui' && isAuthenticated && !loading) {
      // Refresh tasks when user switches from chat to GUI view
      // This ensures table shows latest data after chat operations
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]); // Only depend on currentView to avoid infinite loops

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
        onCreateTask={() => setShowCreateModal(true)}
      />

      <main className="lg:pl-64 min-h-screen">
        <ChatHeader />

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {currentView === 'chat' ? (
            <ChatKit />
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('table')}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                        viewMode === 'table'
                          ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                        viewMode === 'list'
                          ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      List
                    </button>
                  </div>
                </div>
                <Button onClick={() => setShowCreateModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Book
                </Button>
              </div>

              {viewMode === 'table' ? (
                <TaskTable tasks={tasks} loading={loading} />
              ) : (
                <TaskList tasks={tasks} />
              )}
            </>
          )}
        </div>
      </main>

      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <TaskProvider>
      <ChatProvider>
        <TasksContent />
      </ChatProvider>
    </TaskProvider>
  );
}
