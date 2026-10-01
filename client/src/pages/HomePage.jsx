import { useState } from 'react'
import heroBg from '../assets/hero_bg.jpg'
import saffronTableImg from '../assets/saffron_table.jpg'
import oliveHouseImg from '../assets/olive_house.jpg'
import goldenHourImg from '../assets/golden_hour.jpg'

export default function HomePage({ setCurrentPage: _setCurrentPage }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState({ 1: false, 2: false, 3: false })
  const [selectedForCompare, setSelectedForCompare] = useState({ 1: true, 2: true, 3: true })
  const [activeModal, setActiveModal] = useState(null)

  const quickSearches = [
    'Date night',
    'Under ₹500',
    'Vegetarian',
    'Coffee & work',
    'Family dinner',
    'Late night'
  ]

  const restaurants = [
    {
      id: 1,
      name: 'Saffron Table',
      rating: '4.8',
      cuisine: 'Indian · North Indian',
      description: 'Familiar Indian flavors, thoughtfully reimagined for the modern table.',
      offer: 'Up to ₹100 off',
      price: '₹₹',
      distance: '1.2 km away',
      image: saffronTableImg,
      sampleDishes: 'Paneer tikka · Dal makhani · Naan',
      estimatedPrice: '₹619',
      menu: [
        { name: 'Saffron Paneer Tikka', price: '₹260', desc: 'Charred cottage cheese, saffron marinade, bell peppers' },
        { name: 'Dal Makhani Slow Simmered', price: '₹210', desc: 'Overnight cooked black lentils with white butter' },
        { name: 'Butter Garlic Naan (2 pcs)', price: '₹90', desc: 'Fresh tandoor-baked flatbread' },
        { name: 'Dum Biryani Royale', price: '₹290', desc: 'Long grain fragrant rice with seasonal vegetables' }
      ]
    },
    {
      id: 2,
      name: 'Olive House',
      rating: '4.7',
      cuisine: 'Italian · Pizzeria',
      description: 'A little corner of Italy with handmade pastas and really good pizza.',
      offer: 'Up to ₹50 off',
      price: '₹₹',
      distance: '1.8 km away',
      image: oliveHouseImg,
      sampleDishes: 'Margherita · Garlic bread · Coke',
      estimatedPrice: '₹600',
      menu: [
        { name: 'Classic Margherita Pizza', price: '₹340', desc: 'San Marzano tomatoes, fresh mozzarella, basil' },
        { name: 'Handmade Fettuccine Alfredo', price: '₹310', desc: 'Creamy parmesan emulsion with cracked black pepper' },
        { name: 'Herbed Garlic Bread', price: '₹140', desc: 'Toasted sourdough with roasted garlic butter' },
        { name: 'Tiramisu Tradizionale', price: '₹190', desc: 'Espresso-soaked savoiardi, mascarpone cream' }
      ]
    },
    {
      id: 3,
      name: 'The Golden Hour',
      rating: '4.9',
      cuisine: 'Café · Breakfast',
      description: 'Slow mornings, good coffee, and something lovely on your plate.',
      offer: 'Up to ₹75 off',
      price: '₹₹',
      distance: '0.8 km away',
      image: goldenHourImg,
      sampleDishes: 'Avocado Toast · Croissant · Cappuccino',
      estimatedPrice: '₹540',
      menu: [
        { name: 'Artisan Avocado Sourdough', price: '₹240', desc: 'Hass avocado mash, microgreens, soft boiled egg, seeds' },
        { name: 'Butter Croissant', price: '₹120', desc: 'Flaky golden laminated pastry with French butter' },
        { name: 'Specialty Rosetta Cappuccino', price: '₹160', desc: 'Double shot espresso with silky steamed whole milk' },
        { name: 'Granola & Berry Parfait', price: '₹180', desc: 'Greek yogurt, wild blossom honey, toasted almonds' }
      ]
    }
  ]

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSelected = (id) => {
    setSelectedForCompare(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="flex-1 w-full">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[620px] flex items-center overflow-hidden">
        {/* Background Image with Cinematic Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Lavish dining table"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24 w-full">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-block border-b border-white/40 pb-1 mb-5">
              <span className="text-[11px] md:text-[12px] font-semibold tracking-[0.2em] uppercase text-white/90">
                GOOD FOOD, BETTER DECISIONS • ZAIKA
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-[62px] text-white font-normal leading-[1.12] tracking-tight mb-5">
              Find your next favorite place to eat.
            </h1>

            {/* Subheading */}
            <p className="text-white/85 text-base sm:text-lg font-normal leading-relaxed mb-8 max-w-xl">
              Discover restaurants, explore menus, and compare what you can actually get for your budget.
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-xl p-1.5 shadow-2xl flex items-center max-w-xl border border-white/20 transition-all focus-within:ring-2 focus-within:ring-[#85312C]/50">
              <div className="pl-3.5 pr-2 text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </div>
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try: Italian dinner for 2 under ₹1500"
                className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-400 text-sm md:text-[15px] outline-none font-normal py-2"
              />
              <button
                onClick={() => {
                  const shortlist = document.getElementById('shortlist')
                  shortlist?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="bg-[#85312C] hover:bg-[#702622] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm cursor-pointer ml-2"
              >
                <span>Explore</span>
                <span className="text-base leading-none">→</span>
              </button>
            </div>

            {/* Quick Filter Tags */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-white/75 font-normal mr-1">Try searching:</span>
              {quickSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md text-white/95 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION BANNER (Pale Ivory/Cream Strip) */}
      <section className="bg-[#FAF4DC] border-y border-[#EDE3C4]/70 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-10 md:gap-x-16 gap-y-3 text-[14px] text-neutral-800">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#85312C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <path strokeWidth="2" strokeLinecap="round" d="M16 16l4 4" />
            </svg>
            <span>
              <strong className="font-semibold text-neutral-900">Discover</strong> places made for your plans
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#85312C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
              <circle cx="8" cy="6" r="2" fill="#85312C" />
              <circle cx="16" cy="12" r="2" fill="#85312C" />
              <circle cx="10" cy="18" r="2" fill="#85312C" />
            </svg>
            <span>
              <strong className="font-semibold text-neutral-900">Compare</strong> menus and real prices
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#85312C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>
              <strong className="font-semibold text-neutral-900">Decide</strong> with total confidence
            </span>
          </div>
        </div>
      </section>

      {/* 3. THE SHORTLIST SECTION (Restaurant Cards) */}
      <section id="shortlist" className="max-w-7xl mx-auto px-6 py-14 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
              THE SHORTLIST
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
              Worth going out for.
            </h2>
            <p className="text-neutral-600 text-[15px] mt-1">
              Good places, good food, and something for every kind of craving.
            </p>
          </div>

          <a
            href="#shortlist"
            className="inline-flex items-center gap-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <span>Explore all places</span>
            <span className="text-base leading-none">→</span>
          </a>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => {
            const isFav = favorites[restaurant.id]
            const isSelected = selectedForCompare[restaurant.id]

            return (
              <div
                key={restaurant.id}
                className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={() => toggleFavorite(restaurant.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-neutral-700 hover:text-rose-600 hover:bg-white shadow-sm transition-all cursor-pointer"
                    aria-label="Save to favorites"
                  >
                    <svg
                      className={`w-5 h-5 transition-colors ${
                        isFav ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current'
                      }`}
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  </button>

                  {/* Offer Badge */}
                  <div className="absolute bottom-3 left-3 bg-[#FAF1E8] text-[#85312C] text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm border border-[#F3E2D4]">
                    {restaurant.offer}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-xl font-normal text-neutral-900 group-hover:text-[#85312C] transition-colors">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm font-semibold text-neutral-800">
                        <span className="text-amber-500">★</span>
                        <span>{restaurant.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-500 mt-1 font-normal">
                      {restaurant.cuisine}
                    </p>

                    <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                      {restaurant.description}
                    </p>
                  </div>

                  {/* Bottom Meta & Action Buttons */}
                  <div className="mt-5 pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3.5 font-normal">
                      <span>{restaurant.price}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {restaurant.distance}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveModal(restaurant)}
                        className="flex-1 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View menu</span>
                        <span className="text-sm">→</span>
                      </button>

                      <button
                        onClick={() => toggleSelected(restaurant.id)}
                        className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#F6EEBE] hover:bg-[#ECE3AD] text-neutral-900'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        <span>✓</span>
                        <span>{isSelected ? 'Selected' : 'Select'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. THE ZAIKA WAY (Burgundy Comparison Section) */}
      <section id="compare" className="bg-[#85312C] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#F8C8BF] uppercase block">
              THE ZAIKA WAY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight mt-3 text-white">
              Know the bill before the first bite.
            </h2>
            <p className="text-white/85 text-base md:text-lg font-light leading-relaxed mt-4 max-w-lg">
              Pick two places. Choose the dishes you actually want. We'll put the menus, offers and final totals side by side.
            </p>
            <button
              onClick={() => {
                const el = document.getElementById('shortlist')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="mt-8 inline-flex items-center gap-2 bg-[#F6EEBE] hover:bg-[#ECE3AD] text-[#3A1412] px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors cursor-pointer"
            >
              <span>Compare menus</span>
              <span className="text-base leading-none">→</span>
            </button>
          </div>

          {/* Right Comparison Card */}
          <div className="bg-white text-neutral-900 rounded-2xl p-6 md:p-7 shadow-2xl max-w-md w-full ml-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-sm font-semibold text-neutral-900">
                Tonight's options
              </span>
              <span className="text-xs text-neutral-500 font-normal">
                For 2 people · under ₹1,500
              </span>
            </div>

            <div className="border border-neutral-200/90 rounded-xl p-4 mt-4 bg-white hover:border-[#85312C]/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    Saffron Table
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Paneer tikka · Dal makhani · Naan
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif font-normal text-xl text-[#85312C] leading-none block">
                    ₹619
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">
                    est. total
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-neutral-200/90 rounded-xl p-4 mt-3 bg-white hover:border-[#85312C]/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    Olive House
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Margherita · Garlic bread · Coke
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif font-normal text-xl text-[#85312C] leading-none block">
                    ₹600
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">
                    est. total
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[#85312C] text-xs font-semibold mt-5">
              <span>★</span>
              <span>Real menus. Clearer choices.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CURATED FOR YOU */}
      <section className="max-w-7xl mx-auto px-6 py-14 w-full">
        <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
          CURATED FOR YOU
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal mb-8">
          Whatever you're in the mood for.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => setSearchQuery('Italian')}
            className="group relative h-60 md:h-64 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
          >
            <img
              src={oliveHouseImg}
              alt="An Italian evening"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-white font-serif text-xl font-normal">
              <span>An Italian evening</span>
              <span className="text-xl group-hover:translate-x-1.5 transition-transform">→</span>
            </div>
          </div>

          <div
            onClick={() => setSearchQuery('Coffee')}
            className="group relative h-60 md:h-64 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
          >
            <img
              src={goldenHourImg}
              alt="Coffee & a little time"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-white font-serif text-xl font-normal">
              <span>Coffee & a little time</span>
              <span className="text-xl group-hover:translate-x-1.5 transition-transform">→</span>
            </div>
          </div>

          <div
            onClick={() => setSearchQuery('Comfort food')}
            className="group relative h-60 md:h-64 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
          >
            <img
              src={saffronTableImg}
              alt="Comfort food classics"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-white font-serif text-xl font-normal">
              <span>Comfort food classics</span>
              <span className="text-xl group-hover:translate-x-1.5 transition-transform">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL: Menu Viewer */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-neutral-100">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={activeModal.image}
                alt={activeModal.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-serif text-2xl font-normal text-neutral-900">
                  {activeModal.name}
                </h3>
                <p className="text-xs text-neutral-500">{activeModal.cuisine} · {activeModal.distance}</p>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-[#85312C] mb-3">
              Highlighted Menu
            </h4>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activeModal.menu.map((dish, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div>
                    <h5 className="text-sm font-semibold text-neutral-900">{dish.name}</h5>
                    <p className="text-xs text-neutral-500 mt-0.5">{dish.desc}</p>
                  </div>
                  <span className="font-serif font-semibold text-neutral-900 text-sm ml-3">
                    {dish.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">Average cost for two: <strong className="text-neutral-900 font-semibold">{activeModal.estimatedPrice}</strong></span>
              <button
                onClick={() => setActiveModal(null)}
                className="bg-[#85312C] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#702622] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
