import { useState, useEffect } from 'react'
import heroBg from '../assets/hero_bg.jpg'
import { fetchLiveRestaurants } from '../services/restaurantService'
import MenuModal from '../components/MenuModal'

export default function HomePage({
  setCurrentPage,
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery,
  onAddRecentSearch,
  favorites: externalFavorites,
  onToggleFavorite: externalOnToggleFavorite,
  selectedForCompare: externalSelectedForCompare,
  onToggleCompare: externalOnToggleCompare
}) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery
  const setSearchQuery = externalSetSearchQuery !== undefined ? externalSetSearchQuery : setInternalSearchQuery

  const handleSearchSubmit = (queryToSearch) => {
    const q = queryToSearch !== undefined ? queryToSearch : searchQuery
    if (q && q.trim() && onAddRecentSearch) {
      onAddRecentSearch(q.trim())
    }
    const shortlist = document.getElementById('shortlist')
    shortlist?.scrollIntoView({ behavior: 'smooth' })
  }

  const [internalFavorites, setInternalFavorites] = useState({})
  const favorites = externalFavorites !== undefined ? externalFavorites : internalFavorites

  const [internalSelectedForCompare, setInternalSelectedForCompare] = useState({})
  const selectedForCompare = externalSelectedForCompare !== undefined ? externalSelectedForCompare : internalSelectedForCompare
  const [activeModal, setActiveModal] = useState(null)

  const quickSearches = [
    'Date night',
    'Under ₹500',
    'Vegetarian',
    'Coffee & work',
    'Family dinner',
    'Late night'
  ]

  const [restaurants, setRestaurants] = useState([])
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadPlaces() {
      setIsLoadingRestaurants(true)
      try {
        const places = await fetchLiveRestaurants({
          lat: 12.9716,
          lng: 77.5946,
          radius: 5000,
          city: 'Bengaluru'
        })
        if (isMounted) {
          setRestaurants(places.slice(0, 3))
        }
      } catch (err) {
        console.warn('Failed to load places for HomePage:', err)
      } finally {
        if (isMounted) {
          setIsLoadingRestaurants(false)
        }
      }
    }
    loadPlaces()
    return () => {
      isMounted = false
    }
  }, [])

  const toggleFavorite = (restaurant) => {
    const id = restaurant && typeof restaurant === 'object' ? restaurant.id : restaurant
    const obj = restaurant && typeof restaurant === 'object' ? restaurant : null
    if (externalOnToggleFavorite) {
      externalOnToggleFavorite(id, obj)
    } else {
      setInternalFavorites(prev => ({ ...prev, [id]: !prev[id] }))
    }
  }

  const toggleSelected = (restaurant) => {
    const id = restaurant && typeof restaurant === 'object' ? restaurant.id : restaurant
    const obj = restaurant && typeof restaurant === 'object' ? restaurant : null
    if (externalOnToggleCompare) {
      externalOnToggleCompare(id, obj)
    } else {
      setInternalSelectedForCompare(prev => ({ ...prev, [id]: !prev[id] }))
    }
  }

  return (
    <div className="flex-1 w-full">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[calc(100vh-5rem)] min-h-[calc(100dvh-5rem)] flex items-center overflow-hidden">
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit()
                }}
                placeholder="Try: Italian dinner for 2 under ₹1500"
                className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-400 text-sm md:text-[15px] outline-none font-normal py-2"
              />
              <button
                onClick={() => handleSearchSubmit()}
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
                  onClick={() => {
                    setSearchQuery(tag)
                    handleSearchSubmit(tag)
                  }}
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
      <section className="w-full bg-[#FAF4DC] border-y border-[#EDE3C4]/70 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-10 md:gap-x-16 gap-y-3 text-[14px] text-neutral-800">
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

          <button
            onClick={() => setCurrentPage('discover')}
            className="inline-flex items-center gap-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <span>Explore all places</span>
            <span className="text-base leading-none">→</span>
          </button>
        </div>

        {/* 3 Cards Grid */}
        {isLoadingRestaurants ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden p-5 space-y-4 animate-pulse">
                <div className="aspect-[4/3] bg-neutral-200 rounded-xl w-full" />
                <div className="h-5 bg-neutral-200 rounded w-2/3" />
                <div className="h-3 bg-neutral-200 rounded w-1/3" />
                <div className="h-4 bg-neutral-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-neutral-200 p-8">
            <p className="text-neutral-700 font-medium">No live places currently loaded.</p>
            <p className="text-xs text-neutral-400 mt-1">Please ensure the backend server is running to fetch live Google Places data.</p>
          </div>
        ) : (
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
                      onClick={() => toggleFavorite(restaurant)}
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
                        <h3 className="font-serif text-xl font-normal text-neutral-900 group-hover:text-[#85312C] transition-colors truncate">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm font-semibold text-neutral-800 shrink-0">
                          <span className="text-amber-500">★</span>
                          <span>{restaurant.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-500 mt-1 font-normal">
                        {restaurant.cuisine}
                      </p>

                      <p className="text-neutral-600 text-sm mt-3 leading-relaxed line-clamp-2">
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
                          onClick={() => toggleSelected(restaurant)}
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
        )}
      </section>

      {/* 4. THE ZAIKA WAY (Burgundy Comparison Section) */}
      <section id="compare" className="w-full bg-[#85312C] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
              onClick={() => setCurrentPage('compare')}
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

            {restaurants.slice(0, 2).map((opt) => (
              <div
                key={opt.id}
                className="border border-neutral-200/90 rounded-xl p-4 mt-3 bg-white hover:border-[#85312C]/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900">
                      {opt.name}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {opt.sampleDishes}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-normal text-xl text-[#85312C] leading-none block">
                      {opt.estimatedPrice}
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">
                      est. total
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-1.5 text-[#85312C] text-xs font-semibold mt-5">
              <span>★</span>
              <span>Real menus. Clearer choices.</span>
            </div>
          </div>
        </div>
      </section>


      {/* MODAL: Menu Viewer */}
      <MenuModal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        restaurant={activeModal}
      />
    </div>
  )
}
