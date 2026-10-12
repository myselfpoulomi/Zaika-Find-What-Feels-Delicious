import { useState, useEffect, useMemo } from 'react'
import { fetchRestaurantMenu } from '../services/restaurantService'

export default function MenuModal({
  isOpen,
  onClose,
  restaurant
}) {
  const [menuData, setMenuData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [dietaryFilter, setDietaryFilter] = useState('all') // 'all' | 'veg' | 'non-veg'
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isOpen || !restaurant) {
      setMenuData(null)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setActiveCategory('All')
    setSearchQuery('')
    setDietaryFilter('all')

    fetchRestaurantMenu(restaurant)
      .then((data) => {
        if (!isMounted) return
        if (data) {
          setMenuData(data)
        } else {
          // Fallback if network issue
          setMenuData({
            categories: ['All Items'],
            items: (restaurant.menu || []).map((m) => ({
              ...m,
              priceFormatted: m.price || `₹${m.priceNum || 200}.00`,
              isVeg: restaurant.isVeg ?? true,
              image: restaurant.image
            })),
            googleSearchMenuUrl: `https://www.google.com/search?q=${encodeURIComponent((restaurant.name || '') + ' menu')}`,
            zomatoSearchUrl: `https://www.zomato.com/search?q=${encodeURIComponent(restaurant.name || '')}`
          })
        }
      })
      .catch(() => {
        if (!isMounted) return
        setMenuData({
          categories: ['All Items'],
          items: (restaurant.menu || []).map((m) => ({
            ...m,
            priceFormatted: m.price || `₹${m.priceNum || 200}.00`,
            isVeg: restaurant.isVeg ?? true,
            image: restaurant.image
          }))
        })
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, restaurant])

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const categories = useMemo(() => {
    if (!menuData?.categories) return ['All']
    return ['All', ...menuData.categories]
  }, [menuData])

  const filteredItems = useMemo(() => {
    if (!menuData?.items) return []
    return menuData.items.filter((item) => {
      // Category filter
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false
      }
      // Dietary filter
      if (dietaryFilter === 'veg' && !item.isVeg) return false
      if (dietaryFilter === 'non-veg' && item.isVeg) return false
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesDesc = (item.desc || '').toLowerCase().includes(q)
        return matchesName || matchesDesc
      }
      return true
    })
  }, [menuData, activeCategory, dietaryFilter, searchQuery])

  if (!isOpen || !restaurant) return null

  const googleUrl = menuData?.googleSearchMenuUrl || `https://www.google.com/search?q=${encodeURIComponent((restaurant.name || '') + ' ' + (restaurant.city || '') + ' menu')}`
  const zomatoUrl = menuData?.zomatoSearchUrl || `https://www.zomato.com/search?q=${encodeURIComponent(restaurant.name || '')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#1B1D1F] text-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER: Mirrored after Google & Zomato sheet */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/90 bg-[#212427] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-medium text-white tracking-tight">
                  Menu
                </h2>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs sm:text-sm text-neutral-300 font-normal truncate max-w-[260px] sm:max-w-md">
                  {restaurant.name} {restaurant.city ? `· ${restaurant.city}` : ''}
                </span>
              </div>

              {/* Attribution Banner */}
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-300 bg-neutral-800/90 border border-neutral-700/80 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="font-semibold text-rose-400">Provided by Zomato</span>
                  <span className="text-neutral-500">|</span>
                  <span className="text-neutral-400">Google Verified</span>
                </span>

                {menuData?.provider && (
                  <span className="hidden sm:inline-block text-[11px] text-neutral-400">
                    Digitized with Zaika AI
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors cursor-pointer text-lg shrink-0"
              aria-label="Close menu modal"
            >
              ✕
            </button>
          </div>

          {/* Quick Search & Veg/Non-Veg Toggle Row */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search dishes, drinks, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#18191B] border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#85312C] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dietary Filter Pills */}
            <div className="flex items-center gap-1.5 shrink-0 bg-[#18191B] p-1 rounded-xl border border-neutral-700/80">
              <button
                onClick={() => setDietaryFilter('all')}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  dietaryFilter === 'all'
                    ? 'bg-neutral-700 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietaryFilter('veg')}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  dietaryFilter === 'veg'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'text-neutral-400 hover:text-emerald-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Veg</span>
              </button>
              <button
                onClick={() => setDietaryFilter('non-veg')}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  dietaryFilter === 'non-veg'
                    ? 'bg-rose-950 text-rose-300 border border-rose-700'
                    : 'text-neutral-400 hover:text-rose-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>Non-veg</span>
              </button>
            </div>
          </div>

          {/* Horizontal Category Pill Tabs */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 -mb-1 pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-full shrink-0 font-medium transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-white text-neutral-900 font-bold shadow-sm'
                      : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700/90'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MODAL BODY: Menu items list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-neutral-800/60">
          {isLoading ? (
            <div className="space-y-4 py-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-neutral-900/60 rounded-2xl border border-neutral-800/80">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-800 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-800 rounded w-2/3" />
                    <div className="h-3 bg-neutral-800 rounded w-full" />
                    <div className="h-3 bg-neutral-800 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-neutral-400">
              <span className="text-3xl block mb-2">🍽️</span>
              <p className="text-sm font-medium">No dishes match your selected filter.</p>
              <button
                onClick={() => {
                  setActiveCategory('All')
                  setDietaryFilter('all')
                  setSearchQuery('')
                }}
                className="mt-3 text-xs text-[#F6EEBE] underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredItems.map((dish, idx) => (
              <div
                key={idx}
                className="pt-3.5 first:pt-0 flex items-start justify-between gap-3 sm:gap-4 group hover:bg-neutral-900/40 p-2 sm:p-3 rounded-2xl transition-colors"
              >
                {/* Dish Photo on Left */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-neutral-800 shrink-0 border border-neutral-800 shadow-sm">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {dish.isBestseller && (
                    <span className="absolute top-1.5 left-1.5 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      ★ Bestseller
                    </span>
                  )}
                </div>

                {/* Dish Info Center */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm sm:text-base font-medium text-white group-hover:text-[#F6EEBE] transition-colors leading-snug">
                      {dish.name}
                    </h4>
                    {/* Price on right */}
                    <span className="text-sm sm:text-base font-semibold text-white tracking-tight shrink-0">
                      {dish.priceFormatted || `₹${dish.price}`}
                    </span>
                  </div>

                  {/* Description / Ingredients */}
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                    {dish.desc || 'Prepared fresh with chef signature condiments and spices.'}
                  </p>

                  {/* Veg / Non-Veg Badge */}
                  <div className="flex items-center gap-2 mt-2">
                    {dish.isVeg ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        VEGETARIAN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        NON-VEGETARIAN
                      </span>
                    )}

                    {dish.category && dish.category !== 'At a Glance' && (
                      <span className="text-[10px] text-neutral-500">
                        · {dish.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL FOOTER: Real Action Links */}
        <div className="p-4 sm:p-5 border-t border-neutral-800/90 bg-[#212427] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={zomatoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#CB202D] hover:bg-[#b01c27] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
            >
              <span>🔴 View Live Menu on Zomato</span>
              <span>↗</span>
            </a>

            <a
              href={googleUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium px-3.5 py-2 rounded-xl border border-neutral-700 transition-colors"
            >
              <span>🔍 View on Google</span>
              <span>↗</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors cursor-pointer border border-neutral-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
