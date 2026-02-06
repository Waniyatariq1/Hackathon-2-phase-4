'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Menu,
  CheckCircle2,
  Filter,
  List,
  Grid,
  Circle,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { TaskProvider } from '@/contexts/TaskContext';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TaskTrendsChart } from '@/components/dashboard/TaskTrendsChart';
import { WeeklyActivityChart } from '@/components/dashboard/WeeklyActivityChart';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { TaskList } from '@/components/tasks/TaskList';
import { WelcomePopup } from '@/components/dashboard/WelcomePopup';
import { cn } from '@/lib/utils';

type ViewMode = 'overview' | 'books';

function DashboardContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { tasks, loading, fetchTasks } = useTasks();
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [bookFilter, setBookFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    if (isAuthenticated && !loading && tasks.length === 0) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show welcome popup on first visit
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcomePopup(true);
      }
    }
  }, [isAuthenticated, isLoading]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const reading = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate this week's added books
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekAdded = tasks.filter(book => {
      if (!book.created_at) return false;
      const bookDate = new Date(book.created_at);
      return bookDate >= weekStart;
    }).length;

    return { 
      total, 
      completed, 
      reading, 
      completionRate,
      thisWeekAdded,
      readingTrend: reading > 0 ? `${((reading / total) * 100).toFixed(1)}% reading` : '0%',
      completedTrend: completionRate > 0 ? `${completionRate}% completed` : '0%',
    };
  }, [tasks]);

  // Filter books based on selected filter
  const filteredBooks = useMemo(() => {
    if (bookFilter === 'all') return tasks;
    if (bookFilter === 'active') return tasks.filter((t) => !t.completed);
    return tasks.filter((t) => t.completed);
  }, [tasks, bookFilter]);


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
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-playfair underline-gradient">
                    Welcome, {user?.name || user?.email?.split('@')[0] || 'Reader'}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Track your reading journey and discover new books
                  </p>
                </div>
          </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('overview')}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                      viewMode === 'overview'
                        ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <Grid className="w-4 h-4 inline mr-1.5" />
                    Overview
                  </button>
                  <button
                    onClick={() => setViewMode('books')}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                      viewMode === 'books'
                        ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <List className="w-4 h-4 inline mr-1.5" />
                    Books
                  </button>
                </div>
                <Button 
                  onClick={() => setShowCreateModal(true)} 
                  size="sm"
                  className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg"
                >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Book
          </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {viewMode === 'overview' ? (
            <>
          {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
                  title="Currently Reading"
              value={stats.reading}
              icon={Circle}
              iconColor="text-purple-400 dark:text-purple-300"
              trend={{ value: stats.readingTrend, isPositive: true }}
            />
            <StatsCard
                  title="Completed Books"
              value={stats.completed}
              icon={CheckCircle2}
              iconColor="text-green-400 dark:text-green-300"
              trend={{ value: stats.completedTrend, isPositive: true }}
            />
            <StatsCard
                  title="Total Books"
              value={stats.total}
              icon={BarChart3}
              iconColor="text-purple-400 dark:text-purple-300"
            />
                <StatsCard
                  title="Added This Week"
                  value={stats.thisWeekAdded}
                  icon={Calendar}
                  iconColor="text-purple-400 dark:text-purple-300"
                />
          </div>

          {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <TaskTrendsChart tasks={tasks} />
            <WeeklyActivityChart tasks={tasks} />
          </div>

              {/* Hero Section with Logo */}
              <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 dark:from-zinc-900 dark:via-purple-950 dark:to-zinc-900 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 md:p-12 shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300 dark:bg-purple-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 font-playfair underline-gradient">
                      Track Your Reading Journey
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">
                      Organize your book collection and discover your next great read with KitabKosh
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Book
                      </Button>
                      <button
                        onClick={() => router.push('/calendar')}
                        className="px-4 py-2 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-500 dark:text-purple-300 font-medium transition-colors"
                      >
                        View Reading Calendar
                      </button>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-2xl transform transition-transform duration-300 group-hover:scale-110">
                        <img 
                          src="/image.png" 
                          alt="KitabKosh Logo" 
                          className="w-32 h-32 md:w-40 md:h-40 object-contain transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Book Filter */}
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-3">
                <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <div className="flex items-center gap-1">
                  {(['all', 'active', 'completed'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setBookFilter(filter)}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-md transition-all capitalize',
                        bookFilter === filter
                          ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:underline decoration-purple-300/50'
                      )}
                    >
                      {filter === 'active' ? 'Reading' : filter}
                    </button>
                  ))}
                </div>
                <div className="ml-auto text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
                </div>
              </div>

              {/* Book List */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6">
                {filteredBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-slate-400 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-playfair underline-purple">
                      No {bookFilter === 'all' ? '' : bookFilter === 'active' ? 'reading' : bookFilter} books
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {bookFilter === 'all'
                        ? 'Add your first book to get started!'
                        : `No ${bookFilter === 'active' ? 'reading' : bookFilter} books at the moment.`}
                    </p>
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add Book
                    </Button>
                  </div>
                ) : (
                  <TaskList tasks={filteredBooks} />
                )}
              </div>
          </div>
          )}
        </div>
      </main>

      {/* Create Book Modal */}
      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <WelcomePopup
          userName={user?.name || user?.email?.split('@')[0] || undefined}
          onClose={() => setShowWelcomePopup(false)}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <TaskProvider>
      <DashboardContent />
    </TaskProvider>
  );
}
