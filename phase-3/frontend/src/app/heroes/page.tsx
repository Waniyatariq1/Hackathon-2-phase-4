'use client';

import Link from 'next/link';
import { ArrowLeft, Users, Heart, UserX } from 'lucide-react';
import { useState } from 'react';

// Famous Characters with their quotes - Corrected
const characters = [
  // Peer-e-Kamil Characters
  {
    name: "Salar Sikandar",
    novel: "Peer-e-Kamil",
    author: "Umera Ahmed",
    characterType: "Hero",
    description: "A brilliant, arrogant man who finds his way to faith through love.",
    quotes: [
      {
        quote: "زندگی میں کبھی نہ کبھی ہم اس مقام پر آجاتے ہیں جہاں سارے رشتے ختم ہو جاتے ہیں. وہاں صرف ہم ہوتے ہیں اور اللہ ہوتا ہے.",
        translation: "In life, at sometime or another we come to a point where all relationships cease—where there is only us and Allah."
      },
      {
        quote: "میں یہاں کھڑا تجھ سے پاک عورتوں میں سے ایک کو مانگتا ہوں... میں اپنی نسل کے لیے امامہ ہاشم کو مانگتا ہوں",
        translation: "I ask You here for one of the pure women... I ask for Imama Hashim for my descendants"
      },
      {
        quote: "اسے بھول جاؤ۔ کوئی سانس لینا کیسے بھول سکتا ہے؟",
        translation: "Forget her. How can anyone forget breathing?"
      }
    ],
    image: "/api/placeholder/200/300"
  },
  {
    name: "Imama Hashim",
    novel: "Peer-e-Kamil",
    author: "Umera Ahmed",
    characterType: "Heroine",
    description: "A strong, faithful woman who changes lives with her unwavering belief.",
    quotes: [
      {
        quote: "محبت میں ذاتی آزادی کو طلب کرنا شرک ہے۔",
        translation: "Seeking personal freedom in love is Shirk/polytheism."
      },
      {
        quote: "محبت میں ہر حق ایسے ملے گا جیسے مرنے کے بعد کفن ملتا ہے۔",
        translation: "In love, every right is received as if a shroud is received after death."
      }
    ],
    image: "/api/placeholder/200/300"
  },
  
  // Jannat Kay Pattay Characters
  {
    name: "Jahan Sikandar",
    novel: "Jannat Kay Pattay",
    author: "Nimra Ahmed",
    characterType: "Hero",
    description: "Complex character with deep emotional conflicts and strong convictions.",
    quotes: [
      {
        quote: "میں جہان سکندر ہوں ، سلیمان مامو کا بھانجا اور داماد، حیا کا ہر بینڈ !",
        translation: "I am Jahan Sikandar, Suleiman Mamu's nephew and son-in-law, Haya's husband!"
      },
      {
        quote: "میں تمہیں مس کروں گا مگر قیامت تک اس بات کا اقرار نہیں کروں گا !",
        translation: "I will miss you, but I will not admit it until the Day of Judgment!"
      },
      {
        quote: "اگر تم نے میری بیوی کو آنکھ اٹھا کر بھی دیکھا تو استنبول کے کتوں کو کھانے کیلئے تمہاری لاش بھی نہیں ملے گی !",
        translation: "If you even dared to look at my wife, your corpse won't even be found for the dogs of Istanbul to eat!"
      }
    ],
    image: "/api/placeholder/200/300"
  },
  {
    name: "Haya",
    novel: "Jannat Kay Pattay",
    author: "Nimra Ahmed",
    characterType: "Heroine",
    description: "A strong female character navigating complex relationships.",
    quotes: [
      {
        quote: "حیا تم ان جنت کے پتوں میں بہت اچھی لگتی ہو !",
        translation: "Haya, you look very beautiful in these leaves of paradise!"
      },
      {
        quote: "کبھی کوئ آپ کے لیے جنت کے پتے توڑ کر لا یا ہے؟",
        translation: "Has anyone ever brought you leaves from paradise?"
      }
    ],
    image: "/api/placeholder/200/300"
  },
  
  // Namal Characters
  {
    name: "Faris Ghazi",
    novel: "Namal",
    author: "Nimra Ahmed",
    characterType: "Hero",
    description: "A determined and righteous character fighting for justice.",
    quotes: [
      {
        quote: "آپ نے سات سال پہلے مجھے قید میں ڈالا تھا",
        translation: "You imprisoned me seven years ago"
      },
      {
        quote: "انسان کو ہمیشہ مشورہ کرنا چاہیے . مشورہ انسان کو رسوای سے بچاتا ہے",
        translation: "Man should always seek advice. Advice saves man from disgrace."
      }
    ],
    image: "/api/placeholder/200/300"
  },
  {
    name: "Aman Malik",
    novel: "Namal",
    author: "Nimra Ahmed",
    characterType: "Villain",
    description: "A calculating and manipulative character with hidden motives.",
    quotes: [
      {
        quote: "میں نے چار سال پہلے تمہیں قید میں ڈالا تھا",
        translation: "I imprisoned you four years ago"
      }
    ],
    image: "/api/placeholder/200/300"
  },
  {
    name: "Hashim Kardar",
    novel: "Namal",
    author: "Nimra Ahmed",
    characterType: "Villain",
    description: "A ruthless antagonist with complex motivations and power.",
    quotes: [
      {
        quote: "یہ مت سمجھنا کہ مجھے خبر نہیں ہے یا یہ کہ میں تمہیں معاف کر دوں گا، جو تم کر رہے ہونا اس کا حساب دو گے تم",
        translation: "Don't think that I am unaware, or that I will forgive you. You will have to account for what you are doing."
      },
      {
        quote: "وہ ہاشم کار دار ہے ، اگر وہ چاہتا میں دو منٹ میں باہر ہوتا ، میں باہر اس لیے نہیں ہوں کیونکہ اس نے کبھی چاہا ہی نہیں",
        translation: "He is Hashim Kardar. If he wanted, I would be out in two minutes. I am not out because he never wanted me to be."
      }
    ],
    image: "/api/placeholder/200/300"
  },
  {
    name: "Qais",
    novel: "Namal",
    author: "Nimra Ahmed",
    characterType: "Villain",
    description: "A complex antagonist with hidden depths and motivations.",
    quotes: [
      {
        quote: "کسی کا دل توڑنے کی وضاحت نہیں ہوتی",
        translation: "Breaking someone's heart cannot be explained"
      }
    ],
    image: "/api/placeholder/200/300"
  },
  
  // Shahr-e-Zaat Characters
  {
    name: "Falak Sher",
    novel: "Shahr-e-Zaat",
    author: "Umera Ahmed",
    characterType: "Hero",
    description: "A character who learns the true meaning of love and sacrifice.",
    quotes: [
      {
        quote: "الله کی محبت کے سوا ہر محبت کو زوال ہے",
        translation: "Allah's love is the only love that never fades. Every other love has an end."
      }
    ],
    image: "/api/placeholder/200/300"
  },
  {
    name: "Zainab",
    novel: "Shahr-e-Zaat",
    author: "Umera Ahmed",
    characterType: "Heroine",
    description: "A character on a journey of self-discovery and spiritual growth.",
    quotes: [
      {
        quote: "دنیا عورت کے ماضی کو کبھی نہیں بھولتی. دنیا صرف مرد کے ماضی کو بھولتی ہے.",
        translation: "The world never forgets a woman's past. The world only forgets a man's past."
      }
    ],
    image: "/api/placeholder/200/300"
  },
  
  // Amarbel Characters
  {
    name: "Amar",
    novel: "Amarbel",
    author: "Umera Ahmed",
    characterType: "Heroine",
    description: "A character learning to let go and find happiness in life.",
    quotes: [
      {
        quote: "زندگی میں انسان کو ایک عادت ضرور سیکھ لینی چاہیے جو چیز ہاتھ سے نکل جائے اسے بھول جانے کی عادت.",
        translation: "In life, a person must learn one habit—the habit of forgetting what slips from your hands."
      }
    ],
    image: "/api/placeholder/200/300"
  },
  {
    name: "Umar Jehangir",
    novel: "Amarbel",
    author: "Umera Ahmed",
    characterType: "Hero",
    description: "A character dealing with love, loss, and finding meaning.",
    quotes: [],
    image: "/api/placeholder/200/300"
  },
  {
    name: "Alizeh Sikandar",
    novel: "Amarbel",
    author: "Umera Ahmed",
    characterType: "Heroine",
    description: "A strong female character with complex emotions.",
    quotes: [],
    image: "/api/placeholder/200/300"
  },
  
  // Aab-e-Hayat Characters
  {
    name: "Main Character",
    novel: "Aab-e-Hayat",
    author: "Umera Ahmed",
    characterType: "Hero",
    description: "A character on a journey of eternal love and happiness.",
    quotes: [
      {
        quote: "محبت کی سب سے بڑی آزمائش یہ نہیں کہ آپ کسی کو پا لیں، بلکہ یہ ہے کہ آپ کسی کو کھونے کے بعد بھی اس کی خوشی کے لیے دعا کریں۔",
        translation: "The greatest test of love is not finding someone, but praying for their happiness even after losing them."
      }
    ],
    image: "/api/placeholder/200/300"
  },
  
  // Iman Ummid Aur Mohabbat Characters
  {
    name: "Main Character",
    novel: "Iman Ummid Aur Mohabbat",
    author: "Umera Ahmed",
    characterType: "Hero",
    description: "A character exploring faith, hope, and love.",
    quotes: [
      {
        quote: "محبت تاریک جنگل کی طرح ہوتی ہے، ایک بار اس کے اندر چلے جاؤ پھر یہ باہر آنے نہیں دیتی۔",
        translation: "Love is like a dark forest, once you enter it, it doesn't let you come out."
      }
    ],
    image: "/api/placeholder/200/300"
  },
  
  // Zindagi Gulzar Hai Characters
  {
    name: "Kashaf",
    novel: "Zindagi Gulzar Hai",
    author: "Umera Ahmed",
    characterType: "Heroine",
    description: "A strong, independent woman who values education and self-respect.",
    quotes: [],
    image: "/api/placeholder/200/300"
  },
  {
    name: "Zaroon",
    novel: "Zindagi Gulzar Hai",
    author: "Umera Ahmed",
    characterType: "Hero",
    description: "A successful man who learns the value of respect and understanding.",
    quotes: [],
    image: "/api/placeholder/200/300"
  },
  
  // Mere Humsafar Characters
  {
    name: "Hamza",
    novel: "Mere Humsafar",
    author: "Farhat Ishtiaq",
    characterType: "Hero",
    description: "A character finding companionship and lifelong love.",
    quotes: [],
    image: "/api/placeholder/200/300"
  },
  {
    name: "Hala",
    novel: "Mere Humsafar",
    author: "Farhat Ishtiaq",
    characterType: "Heroine",
    description: "A character discovering love and companionship.",
    quotes: [],
    image: "/api/placeholder/200/300"
  }
];

export default function HeroesPage() {
  const [selectedNovel, setSelectedNovel] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const novels = Array.from(new Set(characters.map(c => c.novel)));
  const types = ['Hero', 'Heroine', 'Villain'];

  const filteredCharacters = characters.filter(char => {
    const matchesCharacter = selectedType === null || char.characterType === selectedType;
    const matchesNovel = selectedNovel === null || char.novel === selectedNovel;
    return matchesCharacter && matchesNovel;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'Hero':
        return <Users className="w-10 h-10 text-purple-400 dark:text-purple-300" />;
      case 'Heroine':
        return <Heart className="w-10 h-10 text-pink-400 dark:text-pink-300" />;
      case 'Villain':
        return <UserX className="w-10 h-10 text-red-400 dark:text-red-300" />;
      default:
        return <Users className="w-10 h-10 text-purple-400 dark:text-purple-300" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Hero':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400';
      case 'Heroine':
        return 'bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400';
      case 'Villain':
        return 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400';
      default:
        return 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400';
    }
  };

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
            Famous Characters
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Iconic heroes, heroines, and villains with their memorable lines from Urdu novels
          </p>
          <div className="bg-gradient-to-br from-purple-100/80 to-purple-200/80 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl p-6 border border-purple-200 dark:border-purple-800/50">
            <p className="text-2xl font-medium text-slate-900 dark:text-white font-playfair text-center italic">
              "جس نے ایک قطرہ مانگا، تم نے اسے سمندر عطا کر دیے"
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center mt-3">
              "To him who begs for a drop, You grant the seas."
            </p>
            <p className="text-xs text-purple-400 dark:text-purple-300 text-center mt-2 font-semibold">
              — Peer-e-Kamil
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Character Type Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Character Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === null
                    ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                All
              </button>
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedType === type
                      ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md'
                      : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  {type}s
                </button>
              ))}
            </div>
          </div>

          {/* Novel Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Novel</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedNovel(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedNovel === null
                    ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                All
              </button>
              {novels.map((novel) => (
                <button
                  key={novel}
                  onClick={() => setSelectedNovel(novel)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedNovel === novel
                      ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md'
                      : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  {novel}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Characters Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {/* Character Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center border border-purple-200 dark:border-purple-800/50 flex-shrink-0`}>
                  {getIcon(character.characterType)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-playfair mb-1">
                    {character.name}
                  </h3>
                  <p className="text-sm text-purple-400 dark:text-purple-300 font-semibold mb-1">
                    {character.novel}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    by {character.author}
                  </p>
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${getTypeColor(character.characterType)}`}>
                    {character.characterType}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {character.description}
              </p>

              {/* Quotes */}
              {character.quotes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Famous Lines:</h4>
                  {character.quotes.map((quote, qIndex) => (
                    <div key={qIndex} className="bg-purple-50/50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200/50 dark:border-purple-800/30">
                      <p className="text-sm font-medium text-slate-900 dark:text-white mb-2 font-playfair">
                        "{quote.quote}"
                      </p>
                      {quote.translation && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                          "{quote.translation}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
