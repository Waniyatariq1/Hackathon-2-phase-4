'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';

// Famous Urdu and English Novels - Complete List
const novels = [
  {
    title: "Peer-e-Kamil",
    author: "Umera Ahmed",
    language: "Urdu",
    genre: "Spiritual Fiction",
    description: "A spiritual journey of two souls finding their way to faith and love.",
    coverImage: "/book/peerekamil.png"
  },
  {
    title: "Shahr-e-Zaat",
    author: "Umera Ahmed",
    language: "Urdu",
    genre: "Drama",
    description: "A story about self-discovery and the journey to finding inner peace.",
    coverImage: "/book/shahezat.png"
  },
  {
    title: "Amarbel",
    author: "Umera Ahmed",
    language: "Urdu",
    genre: "Romance",
    description: "A tale of love, sacrifice, and the complexities of relationships.",
    coverImage: "/book/amarbel.png"
  },
  {
    title: "La Hasil",
    author: "Umera Ahmed",
    language: "Urdu",
    genre: "Social Drama",
    description: "Exploring themes of loss, redemption, and second chances.",
    coverImage: "/book/lahasil.png"
  },
  {
    title: "Aab-e-Hayat",
    author: "Umera Ahmed",
    language: "Urdu",
    genre: "Romance",
    description: "A story about eternal love and the quest for happiness.",
    coverImage: "/book/Aab-e-Hayat.png"
  },
  {
    title: "Bakht",
    author: "Mehrunnisa",
    language: "Urdu",
    genre: "Drama",
    description: "A narrative about destiny and the choices we make.",
    coverImage: "/book/bakht.png"
  },
  {
    title: "Namal",
    author: "Nimra Ahmed",
    language: "Urdu",
    genre: "Thriller",
    description: "An intense story of revenge, justice, and complex relationships.",
    coverImage: "/book/namal.png"
  },
  {
    title: "Dehshat-e-Wehsat",
    author: "Mehwish Ali",
    language: "Urdu",
    genre: "Thriller",
    description: "A gripping tale of fear and courage.",
    coverImage: "/book/dehshtewehshat.png"
  },
  {
    title: "Iman Ummid Aur Mohabbat",
    author: "Umera Ahmed",
    language: "Urdu",
    genre: "Spiritual",
    description: "Faith, hope, and love intertwined in a beautiful narrative.",
    coverImage: "/book/ImanUmmidAurMohabbat.png"
  },
  {
    title: "Jannat Kay Pattay",
    author: "Nimra Ahmed",
    language: "Urdu",
    genre: "Romance",
    description: "A beautiful story of love, sacrifice, and spiritual growth.",
    coverImage: "/book/jannatpatty.png"
  },
  {
    title: "Haalim",
    author: "Nimra Ahmed",
    language: "Urdu",
    genre: "Romance",
    description: "A tale of forbidden love and sacrifice.",
    coverImage: "/book/halim.png"
  },
  {
    title: "Bismil",
    author: "Mehrunnisa Shameer",
    language: "Urdu",
    genre: "Drama",
    description: "A story of pain, redemption, and finding peace.",
    coverImage: "/book/bismil.png"
  },
  {
    title: "Mala",
    author: "Nimra Ahmed",
    language: "Urdu",
    genre: "Drama",
    description: "Exploring themes of social issues and personal growth.",
    coverImage: "/book/maala.png"
  },
  {
    title: "Rooh-e-Yaram",
    author: "Areej Shah",
    language: "Urdu",
    genre: "Romance",
    description: "A soulful story of love and connection.",
    coverImage: "/book/rooh-e-yaaam.png"
  },
  {
    title: "Junoon-e-Ulfat",
    author: "Mehwish Ali",
    language: "Urdu",
    genre: "Romance",
    description: "A story of obsessive love and its consequences.",
    coverImage: "/book/junooneulfat.png"
  },
  {
    title: "Yaaram",
    author: "Sumera Hameed",
    language: "Urdu",
    genre: "Romance",
    description: "A tale of friendship turning into love.",
    coverImage: "/book/yaaram.png"
  },
  {
    title: "Man-o-Salwa",
    author: "Umera Ahmed",
    language: "Urdu",
    genre: "Spiritual",
    description: "A spiritual journey exploring faith and devotion.",
    coverImage: "/book/Man-o-Salwa.png"
  },
  {
    title: "Ishq Aatish",
    author: "Sadia Rajpoot",
    language: "Urdu",
    genre: "Romance",
    description: "Love like fire, burning and passionate.",
    coverImage: "/book/ishqeaatish.png"
  },
  {
    title: "Sulphite",
    author: "Noor Rajpoot",
    language: "Urdu",
    genre: "Drama",
    description: "A chemical compound, a story of complex relationships.",
    coverImage: "/book/sulphite.png"
  },
  {
    title: "Bab-e-Dar",
    author: "Mehrunnisa Shameer",
    language: "Urdu",
    genre: "Drama",
    description: "The door of the house - a story of family and home.",
    coverImage: "/book/baabedar.png"
  },
  // English Novels
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    language: "English",
    genre: "Philosophical Fiction",
    description: "A shepherd boy's journey to find his personal legend.",
    coverImage: "/book/TheAlchemist.png"
  },
  {
    title: "1984",
    author: "George Orwell",
    language: "English",
    genre: "Dystopian",
    description: "A classic dystopian novel about totalitarianism and surveillance.",
    coverImage: "/book/1984.png"
  },
];

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const languages = Array.from(new Set(novels.map(n => n.language)));
  const genres = Array.from(new Set(novels.map(n => n.genre)));

  const filteredNovels = novels.filter(novel => {
    const matchesSearch = novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         novel.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = selectedLanguage === null || novel.language === selectedLanguage;
    const matchesGenre = selectedGenre === null || novel.genre === selectedGenre;
    return matchesSearch && matchesLanguage && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50/80 via-purple-100/50 to-purple-50/80 dark:from-zinc-900 dark:via-purple-950/20 dark:to-zinc-900 border-b border-purple-200/50 dark:border-purple-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-400 dark:text-purple-300 hover:text-purple-500 dark:hover:text-purple-200 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white font-playfair underline-gradient mb-4">
            Library
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Explore our collection of famous Urdu and English novels
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search books by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full max-w-md"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Language Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Language</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLanguage(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedLanguage === null
                    ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                All
              </button>
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedLanguage === lang
                      ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md'
                      : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Genre</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedGenre(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedGenre === null
                    ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                All
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedGenre === genre
                      ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md'
                      : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Found {filteredNovels.length} {filteredNovels.length === 1 ? 'book' : 'books'}
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredNovels.map((novel, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-slate-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group"
            >
              {/* Book Cover */}
              <div className="aspect-[2/3] rounded-lg mb-4 overflow-hidden border border-purple-200 dark:border-purple-800/50 group-hover:scale-105 transition-transform bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/50 dark:to-purple-900/50">
                <Image
                  src={novel.coverImage}
                  alt={novel.title}
                  width={150}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Book Info */}
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1 font-playfair text-sm line-clamp-2">
                {novel.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                by {novel.author}
              </p>
              <div className="flex gap-2 mb-3">
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded">
                  {novel.language}
                </span>
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded">
                  {novel.genre}
                </span>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2 mt-2">
                {novel.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
