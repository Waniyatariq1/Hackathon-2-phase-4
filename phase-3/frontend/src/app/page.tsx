'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone,
  ArrowRight,
  BarChart3,
  Calendar,
  Target,
  Heart,
  Rocket,
  BookOpen,
  Library,
  Sun,
  Moon,
  Quote,
  ChevronDown,
  Users,
  MessageSquare,
  User,
  LayoutDashboard,
  Bot,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// Inspirational Quotes about Books (for landing page)
const inspirationalQuotes = [
  {
    quote: "کتابیں وہ دوست ہیں جو کبھی خاموش نہیں ہوتے",
    translation: "Books are friends that never remain silent",
    source: "General",
    author: "Classic Urdu Literature"
  },
  {
    quote: "اکستاسی کے بعد کیا ہے؟ درد۔ درد کے بعد کیا ہے؟ خلا۔ خلا کے بعد کیا ہے؟ جہنم۔",
    translation: "What is next to ecstasy? Pain. What is next to pain? Nothingness. What is next to nothingness? Hell.",
    source: "Peer-e-Kamil",
    author: "Umera Ahmed"
  },
  {
    quote: "ہر کتاب ایک نئی دنیا کی طرف ایک کھڑکی ہے",
    translation: "Every book is a window to a new world",
    source: "General",
    author: "Classic Urdu Literature"
  },
  {
    quote: "پڑھنا ایک ایسا سفر ہے جو کبھی ختم نہیں ہوتا",
    translation: "Reading is a journey that never ends",
    source: "General",
    author: "Literary Wisdom"
  },
  {
    quote: "کتابیں انسان کی بہترین رفیق ہوتی ہیں",
    translation: "Books are man's best companions",
    source: "General",
    author: "Urdu Literature"
  },
  {
    quote: "علم کی تلاش میں کوئی حد نہیں",
    translation: "There is no limit in the pursuit of knowledge",
    source: "General",
    author: "Urdu Literature"
  }
];

// All quotes moved to separate pages - this will be used in /novels-quotes page

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [darkMode, setDarkMode] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [libraryDropdownOpen, setLibraryDropdownOpen] = useState(false);
  // Show all quotes on landing page (5-6 quotes)
  const displayedQuotes = inspirationalQuotes;

  // Auto-change quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % displayedQuotes.length);
    }, 5000); // Change quote every 5 seconds

    return () => clearInterval(interval);
  }, [displayedQuotes.length]);

  useEffect(() => {
    // Initialize theme
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);


  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            setVisibleSections((prev) => new Set(prev).add(sectionId));
          }
        });
      },
      { 
        threshold: 0.15,
        rootMargin: '-50px 0px -50px 0px'
      }
    );

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => {
        if (section.id) {
          observer.observe(section);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-purple-400 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img 
                  src="/image.png" 
                  alt="KitabKosh" 
                  className="relative w-10 h-10 object-contain bg-transparent transform group-hover:scale-110 transition-transform" 
                />
            </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent font-playfair underline-gradient">
                KitabKosh
              </span>
            </Link>
            
            {/* Center Navigation Links */}
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              <Link
                href="#features"
                className="text-sm font-semibold text-slate-700 hover:text-purple-400 dark:text-slate-200 dark:hover:text-purple-300 transition-colors relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 dark:bg-purple-300 group-hover:w-full transition-all duration-300"></span>
              </Link>
              {/* Library Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setLibraryDropdownOpen(true)}
                onMouseLeave={() => setLibraryDropdownOpen(false)}
              >
                <button className="text-sm font-semibold text-slate-700 hover:text-purple-400 dark:text-slate-200 dark:hover:text-purple-300 transition-colors relative group flex items-center gap-1">
                  Library
                  <ChevronDown className={`w-4 h-4 transition-transform ${libraryDropdownOpen ? 'rotate-180' : ''}`} />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 dark:bg-purple-300 group-hover:w-full transition-all duration-300"></span>
                </button>
                {libraryDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-800 py-2 z-50">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-zinc-900 border-l border-t border-slate-200 dark:border-zinc-800 rotate-45"></div>
                    <Link
                      href="/library"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors relative z-10"
                      onClick={() => setLibraryDropdownOpen(false)}
                    >
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      Books
                    </Link>
                    <Link
                      href="/heroes"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors relative z-10"
                      onClick={() => setLibraryDropdownOpen(false)}
                    >
                      <Users className="w-4 h-4 text-purple-400" />
                      Characters
                    </Link>
                    <Link
                      href="/novels-quotes"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors relative z-10"
                      onClick={() => setLibraryDropdownOpen(false)}
                    >
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      Famous Lines
                    </Link>
                  </div>
                )}
              </div>
              <Link
                href="#about"
                className="text-sm font-semibold text-slate-700 hover:text-purple-400 dark:text-slate-200 dark:hover:text-purple-300 transition-colors relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 dark:bg-purple-300 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" /> : <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
              </button>
              {!isLoading && isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button 
                      variant="ghost"
                      className="text-sm font-semibold text-slate-700 hover:text-purple-400 dark:text-slate-200 dark:hover:text-purple-300 hidden sm:flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user?.name || user?.email?.split('@')[0] || 'Profile'}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signin">
                    <Button 
                      variant="ghost"
                      className="text-sm font-semibold text-slate-700 hover:text-purple-400 dark:text-slate-200 dark:hover:text-purple-300 hidden sm:block"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background - Pastel Purple */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-50 dark:from-zinc-900 dark:via-purple-950/30 dark:to-zinc-900"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/60 dark:bg-purple-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/50 dark:bg-purple-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-200/40 dark:bg-purple-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-full border border-slate-200 dark:border-zinc-800 mb-8 shadow-lg animate-scale-in">
                <BookOpen className="w-4 h-4 text-purple-400 dark:text-purple-300 animate-pulse" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Your Reading Companion & Book Tracker
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-6 animate-fade-in-up animate-delay-100 font-playfair">
                Track Your Reading,
                <span className="block bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent mt-2 underline-gradient">
                  Discover Great Books
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed animate-fade-in-up animate-delay-200">
                Manage your reading list with{' '}
                <span className="font-semibold text-slate-900 dark:text-white underline-purple">beautiful simplicity</span>.
                Track progress, organize your library, and never lose track of a great book.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12 animate-fade-in-up animate-delay-300">
                {!isLoading && isAuthenticated ? (
                  <>
                    <Link href="/dashboard">
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all text-lg px-8 py-6"
                      >
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button 
                        size="lg"
                        variant="outline"
                        className="px-8 py-6 text-lg font-semibold text-slate-700 dark:text-slate-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-500"
                      >
                        View Profile
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signin">
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all text-lg px-8 py-6"
                      >
                        Start Reading Journey
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link href="#features">
                      <Button 
                        size="lg"
                        variant="outline"
                        className="px-8 py-6 text-lg font-semibold text-slate-700 dark:text-slate-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-500"
                      >
                        Learn More
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 animate-fade-in-up animate-delay-400">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">100%</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Your Library</div>
                </div>
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">∞</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Books</div>
                </div>
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">24/7</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Available</div>
                </div>
              </div>
            </div>

            {/* Right Visual - Quote */}
            <div className="relative hidden lg:block animate-fade-in-right animate-delay-200">
              <div className="relative animate-float">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-300 to-purple-400 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                
                {/* Main Card with Quote */}
                <div className="relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-200 dark:border-zinc-800 transform hover:scale-105 transition-transform duration-500">
                  {/* Quote Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 rounded-full flex items-center justify-center">
                      <Quote className="w-8 h-8 text-purple-400 dark:text-purple-300" />
                    </div>
                  </div>
                  
                  {/* Quote Text */}
                  <div className="text-center">
                    <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium text-slate-900 dark:text-white font-playfair leading-relaxed mb-6 italic">
                      "یہ جو سر گشتہ سے پھرتے ہیں کتابوں والے،<br />
                      ان سے مت مل کے انہیں روگ ہیں خوابوں والے"
                    </blockquote>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 italic">
                      "Those who wander among books, don't meet them - they are afflicted with dreams"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inspirational Quotes Section - Auto Changing Carousel */}
      <section id="quotes" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-reveal ${visibleSections.has('quotes') ? 'revealed' : ''}`}>
        <div className={`text-center mb-12 ${visibleSections.has('quotes') ? 'animate-fade-in-down opacity-100' : 'opacity-0'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-playfair underline-gradient">
            Inspirational Quotes
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Words that inspire and motivate readers
          </p>
        </div>

        {/* Auto-changing Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentQuoteIndex * 100}%)` }}
            >
              {displayedQuotes.map((quote, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 w-full bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-950/20 dark:to-purple-900/20 rounded-2xl p-8 md:p-12 border border-purple-200/50 dark:border-purple-800/30 shadow-lg"
                >
                  <Quote className="w-10 h-10 text-purple-400 dark:text-purple-300 mb-6 mx-auto" />
                  <blockquote className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white mb-6 font-playfair leading-relaxed text-center">
                    "{quote.quote}"
                  </blockquote>
                  <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-4 italic text-center">
                    "{quote.translation}"
                  </p>
                  <p className="text-sm text-purple-400 dark:text-purple-300 font-semibold text-center">
                    — {quote.author}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {displayedQuotes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuoteIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  currentQuoteIndex === index
                    ? 'w-3 h-3 bg-purple-500 dark:bg-purple-400'
                    : 'w-2 h-2 bg-purple-300 dark:bg-purple-700 hover:bg-purple-400 dark:hover:bg-purple-600'
                }`}
                aria-label={`Go to quote ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Book Management Section */}
      <section id="books" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-reveal ${visibleSections.has('books') ? 'revealed' : ''}`}>
        <div className={`text-center mb-16 ${visibleSections.has('books') ? 'animate-fade-in-down opacity-100' : 'opacity-0'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-playfair underline-gradient mb-4">
            Manage Your Book Collection
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Organize your reading journey and discover amazing books from our library
          </p>
        </div>

        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 ${visibleSections.has('books') ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
          {/* Dashboard Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-8 border border-emerald-200/50 dark:border-emerald-800/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg mb-6">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-playfair mb-3">
              Dashboard
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Add books, track reading tasks & manage todos in your personal dashboard
            </p>
            <Link href="/signin" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-2 transition-all">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-2xl p-8 border border-purple-200/50 dark:border-purple-800/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg mb-6">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-playfair mb-3">
              Browse Books
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Discover amazing Urdu and English novels from our extensive collection
            </p>
            <Link href="/library" className="inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold hover:gap-2 transition-all">
              Explore Library
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30 rounded-2xl p-8 border border-pink-200/50 dark:border-pink-800/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mb-6">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-playfair mb-3">
              Meet Characters
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Explore iconic heroes, heroines, and villains from famous Urdu novels
            </p>
            <Link href="/heroes" className="inline-flex items-center text-pink-600 dark:text-pink-400 font-semibold hover:gap-2 transition-all">
              View Characters
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30 rounded-2xl p-8 border border-indigo-200/50 dark:border-indigo-800/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg mb-6">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-playfair mb-3">
              Famous Lines
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Read beautiful quotes and memorable lines from your favorite novels
            </p>
            <Link href="/novels-quotes" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-2 transition-all">
              Read Quotes
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-reveal ${visibleSections.has('features') ? 'revealed' : ''}`}>
        <div className={`text-center mb-16 ${visibleSections.has('features') ? 'animate-fade-in-down opacity-100' : 'opacity-0'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-playfair underline-gradient">
            Everything You Need to Track Your Reading
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Powerful features designed for book lovers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-100 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-purple-400 dark:text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 font-playfair underline-purple">
              Track Reading Progress
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Keep track of books you're reading, want to read, and have completed. Never lose track of where you left off.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-200 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center mb-4">
              <Library className="w-6 h-6 text-purple-400 dark:text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 font-playfair underline-purple">
              Organize Your Library
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Build your personal digital library. Categorize books, add notes, and create custom collections.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-300 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-400 dark:text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 font-playfair underline-purple">
              Reading Calendar
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Plan your reading schedule and track your reading habits over time with beautiful visualizations.
            </p>
          </div>

          {/* Feature 4 */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-400 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-400 dark:text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 font-playfair underline-purple">
              Secure & Private
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your reading data is completely private and secure. We never share your information with anyone.
            </p>
          </div>

          {/* Feature 5 */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-500 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-purple-400 dark:text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 font-playfair underline-purple">
              Mobile-First Design
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Access your reading list from anywhere. Beautiful responsive design that works on all devices.
            </p>
          </div>

          {/* Feature 6 */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-500 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-400 dark:text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 font-playfair underline-purple">
              Reading Statistics
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Track your reading habits with detailed statistics and insights about your reading journey.
            </p>
          </div>

          {/* Feature 7 - AI Chatbot */}
          <div className={`p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-600 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 font-playfair underline-purple">
              AI Assistant
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Chat with our AI assistant to manage your books naturally. Add, update, or find books through simple conversation.
            </p>
            {!isLoading && isAuthenticated ? (
              <Link href="/chat" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:gap-2 transition-all">
                Try AI Assistant
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            ) : (
              <Link href="/signin" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:gap-2 transition-all">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-reveal ${visibleSections.has('about') ? 'revealed' : ''}`}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className={visibleSections.has('about') ? 'animate-fade-in-left opacity-100' : 'opacity-0'}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-950 rounded-full mb-6">
              <Target className="w-4 h-4 text-purple-400 dark:text-purple-300" />
              <span className="text-sm font-medium text-purple-500 dark:text-purple-300">About KitabKosh</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6 font-playfair underline-gradient">
              Built for Book Lovers
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              KitabKosh is a modern reading companion designed to help you organize your reading journey. 
              Whether you're tracking Urdu novels, English classics, or any genre in between, we've got you covered.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Our mission is to make reading tracking simple, beautiful, and accessible. 
              Join thousands of readers who trust KitabKosh to manage their personal libraries.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-purple-400 dark:text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 underline-purple">Reader-Focused</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Designed with readers in mind</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-5 h-5 text-purple-400 dark:text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 underline-purple">Fast & Simple</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Lightning-fast performance</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`relative ${visibleSections.has('about') ? 'animate-fade-in-right animate-delay-200 opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-900/20 dark:to-purple-900/20 rounded-3xl blur-3xl animate-pulse"></div>
            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <div className="space-y-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-playfair mb-3">
                    AI-Powered Assistant
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Manage your books through natural language. Just chat and let AI handle the rest!
                  </p>
                  {!isLoading && isAuthenticated ? (
                    <Link href="/chat">
                      <Button className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white">
                        Try AI Assistant
                        <Sparkles className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/signin">
                      <Button className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-reveal ${visibleSections.has('cta') ? 'revealed' : ''}`}>
        <div className={`bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 dark:from-zinc-900 dark:via-purple-950 dark:to-zinc-900 rounded-3xl p-12 md:p-16 text-center shadow-2xl border border-purple-200 dark:border-purple-800 overflow-hidden relative ${visibleSections.has('cta') ? 'animate-scale-in opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300 dark:bg-purple-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 font-playfair underline-gradient">
              Ready to Start Your Reading Journey?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              {!isLoading && isAuthenticated 
                ? `Welcome back${user?.name ? `, ${user.name}` : ''}! Continue your reading journey.`
                : 'Join thousands of readers who trust KitabKosh to organize their reading. Sign up now and transform how you track your books.'}
            </p>
            {!isLoading && isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 transition-all"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-500 text-slate-700 dark:text-slate-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 transition-all"
                  >
                    View Profile
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/signin">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/image.png" 
                alt="KitabKosh" 
                className="w-8 h-8 object-contain bg-transparent" 
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent font-playfair">
                KitabKosh
              </span>
            </div>
            <div className="text-center md:text-right text-sm text-slate-600 dark:text-slate-400">
              <p>&copy; 2025 KitabKosh. Built with Next.js 15, FastAPI, and PostgreSQL.</p>
              <p className="mt-1">Secure · Fast · Beautiful</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
