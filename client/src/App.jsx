import { useState } from 'react'

function App() {
  const [likes, setLikes] = useState(128)
  const [hasLiked, setHasLiked] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Street Food', 'Curries & Biryanis', 'Desserts', 'Beverages']

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1)
      setHasLiked(false)
    } else {
      setLikes((prev) => prev + 1)
      setHasLiked(true)
    }
  }

  const features = [
    {
      title: 'React 19',
      desc: 'Latest React features, fast components, and reactive state management.',
      tag: 'Framework',
      gradient: 'from-cyan-500/20 to-blue-500/10',
      border: 'border-cyan-500/30',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    {
      title: 'Vite',
      desc: 'Next-generation lightning fast HMR and optimized bundler setup.',
      tag: 'Build Tool',
      gradient: 'from-purple-500/20 to-pink-500/10',
      border: 'border-purple-500/30',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    {
      title: 'Tailwind CSS v4',
      desc: 'High-performance CSS-first engine via @tailwindcss/vite plugin.',
      tag: 'Styling',
      gradient: 'from-teal-500/20 to-emerald-500/10',
      border: 'border-teal-500/30',
      badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
    }
  ]

  const tasteHighlights = [
    {
      id: 1,
      title: 'Dum Biryani Royale',
      category: 'Curries & Biryanis',
      prepTime: '45 mins',
      rating: '4.9',
      tag: 'Chef Special',
      description: 'Slow-cooked aromatic basmati rice layered with rich saffron, herbs, and tender spiced cuts.'
    },
    {
      id: 2,
      title: 'Pani Puri Crisps',
      category: 'Street Food',
      prepTime: '20 mins',
      rating: '4.8',
      tag: 'Popular',
      description: 'Crispy puffed hollow puris filled with tangy mint-coriander water, sweet tamarind, and spiced potatoes.'
    },
    {
      id: 3,
      title: 'Shahi Kesar Kulfi',
      category: 'Desserts',
      prepTime: '15 mins',
      rating: '5.0',
      tag: 'Sweet Tooth',
      description: 'Traditional slow-reduced milk kulfi infused with cardamom, saffron strands, and roasted pistachios.'
    }
  ]

  const filteredHighlights = activeCategory === 'All' 
    ? tasteHighlights 
    : tasteHighlights.filter((item) => item.category === activeCategory)

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl"></div>
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/25">
              🍲
            </span>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                Zaika
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-400 ml-2 font-medium">
                Find What Feels Delicious
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Tailwind CSS v4 Active
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Docs & Setup
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full space-y-16">
        <section className="text-center max-w-3xl mx-auto pt-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium tracking-wide">
            ✨ React + Vite + Tailwind CSS v4 Starter Ready
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find What Feels{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Delicious
            </span>
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Your client workspace is configured with high-performance modern tooling. Explore authentic recipes, culinary inspirations, and responsive UI components powered by Tailwind CSS v4.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleLike}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center gap-2 cursor-pointer ${
                hasLiked
                  ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-amber-500/20 hover:scale-105'
              }`}
            >
              <span>{hasLiked ? '❤️ Liked' : '🤍 Taste Explorer'}</span>
              <span className="px-2 py-0.5 rounded-md bg-black/20 text-xs font-mono">
                {likes}
              </span>
            </button>

            <a
              href="#recipes"
              className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 font-medium transition-all duration-200 hover:border-slate-500"
            >
              Explore Recipes
            </a>
          </div>
        </section>

        {/* Tech Stack Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item) => (
            <div
              key={item.title}
              className={`relative rounded-2xl p-6 bg-gradient-to-br ${item.gradient} bg-[#131929]/70 border ${item.border} backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${item.badgeBg}`}>
                  {item.tag}
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* Recipe / Taste Explorer Demo */}
        <section id="recipes" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Taste Preview</h2>
              <p className="text-slate-400 text-sm">Sample recipe cards styled exclusively with Tailwind CSS</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredHighlights.map((recipe) => (
              <div
                key={recipe.id}
                className="group rounded-2xl overflow-hidden bg-[#13192b]/80 border border-white/10 hover:border-amber-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between p-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      {recipe.category}
                    </span>
                    <span className="text-amber-300 font-semibold flex items-center gap-1">
                      ★ {recipe.rating}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {recipe.title}
                  </h4>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    ⏱ {recipe.prepTime}
                  </span>
                  <span className="text-orange-400 font-medium">{recipe.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-950/90 border border-white/10 p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <h3 className="text-lg font-bold text-white">Next Steps to Develop</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-slate-300">
              <span className="text-slate-500 block text-xs mb-1">1. Navigate to client</span>
              <code>cd client</code>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-slate-300">
              <span className="text-slate-500 block text-xs mb-1">2. Start Dev Server</span>
              <code>npm run dev</code>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-slate-300">
              <span className="text-slate-500 block text-xs mb-1">3. Build for Production</span>
              <code>npm run build</code>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        <p>Zaika — Find What Feels Delicious • React + Vite + Tailwind CSS v4</p>
      </footer>
    </div>
  )
}

export default App
