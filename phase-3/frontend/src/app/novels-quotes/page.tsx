'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Quote, ArrowLeft } from 'lucide-react';


// Book name to image mapping
const getBookImage = (bookName: string): string => {
  const bookImageMap: { [key: string]: string } = {
    "Peer-e-Kamil": "/book/peerekamil.png",
    "Jannat Kay Pattay": "/book/jannatpatty.png",
    "Namal": "/book/namal.png",
    "Shahr-e-Zaat": "/book/shahezat.png",
    "Amarbel": "/book/amarbel.png",
    "La Hasil": "/book/lahasil.png",
    "Aab-e-Hayat": "/book/Aab-e-Hayat.png",
    "Iman Ummid Aur Mohabbat": "/book/ImanUmmidAurMohabbat.png",
  };
  return bookImageMap[bookName] || "/book/peerekamil.png"; // default fallback
};


// Comprehensive Novel Quotes
const novelQuotes = [
  // Peer-e-Kamil Quotes
  {
    quote: "زندگی میں ھم کبھی نہ کبھی اس مقام پر آجاتے ہيں جہاں سارے رشتے ختم ہو جاتے ہيں. وہاں صرف ھم ہوتے ہيں اور اللہ ہوتا ہے.",
    translation: "In life, at sometime or another we come to a point where all relationships cease—where there is only us and Allah.",
    source: "Peer-e-Kamil",
    author: "Umera Ahmed"
  },
  {
    quote: "اکستاسی کے بعد کیا ہے؟ درد۔ درد کے بعد کیا ہے؟ خلا۔ خلا کے بعد کیا ہے؟ جہنم۔",
    translation: "What is next to ecstasy? Pain. What is next to pain? Nothingness. What is next to nothingness? Hell.",
    source: "Peer-e-Kamil",
    author: "Umera Ahmed"
  },
  {
    quote: "جس نے ایک قطرہ مانگا، تم نے اسے سمندر عطا کر دیے۔",
    translation: "To him who begs for a drop, You grant the seas.",
    source: "Peer-e-Kamil",
    author: "Umera Ahmed"
  },
  {
    quote: "وہ میرے بس میں نہیں، مگر میری محبت پاک ہے، گھٹیا خواہش نہیں۔ میں صرف اسی کا تھا، ہوں - چاہے وہ میری نہ بھی ہو۔",
    translation: "She is beyond me, but my love is pure, not base desire. To her alone I belonged, I belong - even if mine she may not be.",
    source: "Peer-e-Kamil",
    author: "Umera Ahmed"
  },
  {
    quote: "اسے بھول جاؤ۔ کوئی سانس لینا کیسے بھول سکتا ہے؟",
    translation: "Forget her. How can anyone forget breathing?",
    source: "Peer-e-Kamil",
    author: "Umera Ahmed"
  },
  {
    quote: "محبت میں ذاتی آزادی کو طلب کرنا شرک ہے۔",
    translation: "Seeking personal freedom in love is Shirk/polytheism.",
    source: "Peer-e-Kamil",
    author: "Umera Ahmed"
  },
  {
    quote: "میں یہاں کھڑا تجھ سے پاک عورتوں میں سے ایک کو مانگتا ہوں... میں اپنی نسل کے لیے امامہ ہاشم کو مانگتا ہوں",
    translation: "I ask You here for one of the pure women... I ask for Imama Hashim for my descendants",
    source: "Peer-e-Kamil",
    author: "Umera Ahmed"
  },
  
  // Jannat Kay Pattay Quotes
  {
    quote: "چیزیں وقتی ہوتی ہیں، ٹوٹ جاتی ہیں، بکھر جاتی ہیں، رویے دائمی ہوتے ہیں، صدیوں کے لیے اپنا اثر چھوڑ جاتے ہیں",
    translation: "Things are temporary, they break, scatter, but behaviors are permanent, they leave their impact for centuries",
    source: "Jannat Kay Pattay",
    author: "Nimra Ahmed"
  },
  {
    quote: "تم وہ گناہ کیسے کر سکتے ہو ان ہاتھوں سے جن سے تم نے نماز پڑھی؟",
    translation: "How can you do sin with hands you used for prayers?",
    source: "Jannat Kay Pattay",
    author: "Nimra Ahmed"
  },
  {
    quote: "کبھی کوئ آپ کے لیے جنت کے پتے توڑ کر لا یا ہے؟",
    translation: "Has anyone ever brought you leaves from paradise?",
    source: "Jannat Kay Pattay",
    author: "Nimra Ahmed"
  },
  
  // Namal Quotes
  {
    quote: "انسان کو ہمیشہ مشورہ کرنا چاہیے . مشورہ انسان کو رسوای سے بچاتا ہے . بہترین مشورہ اللہ سے مشورہ ہوتا ہے اور بہترین فتوی دل کا فتوی ہوتا ہے",
    translation: "Man should always seek advice. Advice saves man from disgrace. The best advice is advice from Allah and the best verdict is the verdict of the heart.",
    source: "Namal",
    author: "Nimra Ahmed"
  },
  {
    quote: "میں نے چار سال پہلے تمہیں قید میں ڈالا تھا",
    translation: "I imprisoned you four years ago",
    source: "Namal",
    author: "Nimra Ahmed"
  },
  {
    quote: "میں آپکو تم کہہ سکتا ہوں ؟",
    translation: "Can I address you as 'tu'?",
    source: "Namal",
    author: "Nimra Ahmed"
  },
  {
    quote: "کسی کا دل توڑنے کی وضاحت نہیں ہوتی",
    translation: "Breaking someone's heart cannot be explained",
    source: "Namal",
    author: "Nimra Ahmed"
  },
  {
    quote: "جو ہے اس کی قدر کیجیے ، پِھر جو نہیں ہے وہ نہ آپکو ڈراے گا نہ غمزدہ ہونے دے گا",
    translation: "Value what you have, then what you don't have won't scare you or make you sad",
    source: "Namal",
    author: "Nimra Ahmed"
  },
  
  // Shahr-e-Zaat Quotes
  {
    quote: "الله کی محبت کے سوا ہر محبت کو زوال ہے",
    translation: "Allah's love is the only love that never fades. Every other love has an end.",
    source: "Shahr-e-Zaat",
    author: "Umera Ahmed"
  },
  
  // Amarbel Quotes
  {
    quote: "زندگی میں انسان کو ایک عادت ضرور سیکھ لینی چاہیے جو چیز ہاتھ سے نکل جائے اسے بھول جانے کی عادت.",
    translation: "In life, a person must learn one habit—the habit of forgetting what slips from your hands.",
    source: "Amarbel",
    author: "Umera Ahmed"
  },
  
  // La Hasil Quotes
  {
    quote: "دنیا عورت کے ماضی کو کبھی نہیں بھولتی. دنیا صرف مرد کے ماضی کو بھولتی ہے.",
    translation: "The world never forgets a woman's past. The world only forgets a man's past.",
    source: "La Hasil",
    author: "Umera Ahmed"
  },
  
  // Aab-e-Hayat Quotes
  {
    quote: "محبت کی سب سے بڑی آزمائش یہ نہیں کہ آپ کسی کو پا لیں، بلکہ یہ ہے کہ آپ کسی کو کھونے کے بعد بھی اس کی خوشی کے لیے دعا کریں۔",
    translation: "The greatest test of love is not finding someone, but praying for their happiness even after losing them.",
    source: "Aab-e-Hayat",
    author: "Umera Ahmed"
  },
  
  // Iman Ummid Aur Mohabbat
  {
    quote: "محبت تاریک جنگل کی طرح ہوتی ہے، ایک بار اس کے اندر چلے جاؤ پھر یہ باہر آنے نہیں دیتی۔",
    translation: "Love is like a dark forest, once you enter it, it doesn't let you come out.",
    source: "Iman Ummid Aur Mohabbat",
    author: "Umera Ahmed"
  }
];

export default function NovelsQuotesPage() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const books = Array.from(new Set(novelQuotes.map(q => q.source)));
  const filteredQuotes = selectedBook 
    ? novelQuotes.filter(q => q.source === selectedBook)
    : novelQuotes;

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
            Novel Quotes & Lines
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Beautiful lines and quotes from famous Urdu novels
          </p>
        </div>
      </div>

      {/* Filter by Book */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedBook(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedBook === null
                ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md'
                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-700'
            }`}
          >
            All Books
          </button>
          {books.map((book) => (
            <button
              key={book}
              onClick={() => setSelectedBook(book)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedBook === book
                  ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
            >
              {book}
            </button>
          ))}
        </div>

        {/* Quotes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.map((quote, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col"
            >
              {/* Quote Content */}
              <div className="flex-1 flex flex-col">
                <Quote className="w-5 h-5 text-purple-400 dark:text-purple-300 mb-3" />
                <blockquote className="text-base font-medium text-slate-900 dark:text-white mb-3 font-playfair leading-relaxed">
                  "{quote.quote}"
                </blockquote>
                {quote.translation && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 italic">
                    "{quote.translation}"
                  </p>
                )}
                <div className="mt-auto pt-3 border-t border-slate-200 dark:border-zinc-800">
                  <p className="text-xs text-purple-400 dark:text-purple-300 font-semibold mb-2">
                    — {quote.source}
                  </p>
                  <div className="flex items-center gap-2">
                    {/* Book Cover as Profile Image */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-300 dark:border-purple-600 shadow-md flex-shrink-0">
                      <Image
                        src={getBookImage(quote.source)}
                        alt={quote.source}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      by {quote.author}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
