import { useState, useEffect } from 'react'

export default function RestaurantDetailsModal({
  isOpen,
  onClose,
  restaurant
}) {
  const [activeTab, setActiveTab] = useState('reviews') // 'reviews' | 'photos' | 'menu'
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [details, setDetails] = useState(null)
  const [loadedPlaceId, setLoadedPlaceId] = useState(null)
  const isLoadingDetails = isOpen && Boolean(restaurant?.id) && loadedPlaceId !== restaurant?.id

  // Fetch full details and Google reviews when modal opens
  useEffect(() => {
    if (!isOpen || !restaurant?.id) return

    let isMounted = true

    async function fetchPlaceDetails() {
      try {
        const res = await fetch(`http://localhost:5000/api/restaurants/${restaurant.id}/details`)
        if (!res.ok) throw new Error('Failed to fetch place details')
        const json = await res.json()
        if (isMounted && json.success && json.data) {
          // Prefix photo URLs if needed
          const photos = (json.data.photos || []).map(p =>
            p.startsWith('/api') ? `http://localhost:5000${p}` : p
          )
          setDetails({
            ...json.data,
            photos: photos.length > 0 ? photos : (restaurant.photos || [restaurant.image])
          })
        }
      } catch (err) {
        console.warn('Place details fetch error:', err)
        if (isMounted) {
          setDetails({
            ...restaurant,
            photos: restaurant.photos || [restaurant.image],
            reviews: restaurant.reviews || []
          })
        }
      } finally {
        if (isMounted) setLoadedPlaceId(restaurant.id)
      }
    }

    fetchPlaceDetails()

    return () => {
      isMounted = false
    }
  }, [isOpen, restaurant])

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !restaurant) return null

  const displayData = details || restaurant
  const photos = displayData.photos && displayData.photos.length > 0
    ? displayData.photos
    : [restaurant.image]
  const reviews = displayData.reviews || []
  const menu = restaurant.menu || displayData.menu || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-start justify-between gap-3 bg-white shrink-0">
          <div className="flex items-start gap-3.5 min-w-0">
            <img
              src={photos[0]}
              alt={restaurant.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF1E8] text-[#85312C]">
                  {restaurant.category === 'Café' ? '☕ Café' : '🍽️ Restaurant'}
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  {restaurant.price} · {restaurant.cuisine}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-medium text-neutral-900 leading-tight truncate">
                {restaurant.name}
              </h3>
              <p className="text-xs text-neutral-500 truncate mt-0.5">
                📍 {displayData.address || `${restaurant.locality}, ${restaurant.city}`} · {restaurant.displayDistance || restaurant.distance}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-1"
          >
            ✕
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="px-5 pt-2 border-b border-neutral-100 bg-[#FAF8F5] shrink-0 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'reviews'
                ? 'text-[#85312C]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            ⭐ Google Reviews ({reviews.length})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#85312C] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'photos'
                ? 'text-[#85312C]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            📸 Photos ({photos.length})
            {activeTab === 'photos' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#85312C] rounded-full" />
            )}
          </button>

          {menu.length > 0 && (
            <button
              onClick={() => setActiveTab('menu')}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === 'menu'
                  ? 'text-[#85312C]'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              🍽️ Menu & Dishes ({menu.length})
              {activeTab === 'menu' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#85312C] rounded-full" />
              )}
            </button>
          )}
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center py-14 space-y-3">
              <svg className="animate-spin w-8 h-8 text-[#85312C]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <p className="text-xs text-neutral-500">Loading Google reviews and photos...</p>
            </div>
          ) : activeTab === 'reviews' ? (
            /* TAB 1: GOOGLE REVIEWS */
            <div className="space-y-5">
              {/* Overall Google Rating Summary Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl sm:text-5xl font-serif font-bold text-neutral-900">
                    {restaurant.rating}
                  </div>
                  <div>
                    <div className="flex items-center text-amber-500 text-lg">
                      {'★'.repeat(Math.round(restaurant.rating))}
                      {'☆'.repeat(Math.max(0, 5 - Math.round(restaurant.rating)))}
                    </div>
                    <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                      Based on {restaurant.userRatingsTotal || 150} Google reviews
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-2xs border border-amber-100 text-xs font-semibold text-neutral-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Verified Google Places Data
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3.5">
                {reviews.length > 0 ? (
                  reviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-100 hover:border-neutral-200 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          {rev.authorPhoto ? (
                            <img
                              src={rev.authorPhoto}
                              alt={rev.authorName}
                              className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#FAF1E8] text-[#85312C] font-semibold text-xs flex items-center justify-center">
                              {rev.authorName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="text-xs sm:text-sm font-semibold text-neutral-900 block leading-tight">
                              {rev.authorName}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              {rev.relativeTime}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                          <span>★</span>
                          <span className="text-neutral-800">{rev.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed pl-10">
                        {rev.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-400">
                    <p className="text-sm">No reviews available yet for this location.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'photos' ? (
            /* TAB 2: PHOTOS GALLERY */
            <div className="space-y-4">
              {/* Main Photo Viewer */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-sm group">
                <img
                  src={photos[activePhotoIndex]}
                  alt={`${restaurant.name} photo ${activePhotoIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Photo Index Badge */}
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs">
                  {activePhotoIndex + 1} / {photos.length}
                </div>

                {/* Previous & Next Buttons */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev === 0 ? photos.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev === photos.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {photos.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                  {photos.map((ph, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        idx === activePhotoIndex
                          ? 'border-[#85312C] scale-102 ring-2 ring-[#85312C]/20'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={ph}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TAB 3: MENU & DISHES */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 text-xs text-neutral-500">
                <span>Signature Curated Menu</span>
                <span className="text-[#85312C] font-semibold">{restaurant.offer}</span>
              </div>

              {menu.length > 0 ? (
                menu.map((dish, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-neutral-200 transition-colors"
                  >
                    <div>
                      <h5 className="text-sm font-semibold text-neutral-900">{dish.name}</h5>
                      <p className="text-xs text-neutral-500 mt-0.5">{dish.desc}</p>
                    </div>
                    <span className="font-serif font-semibold text-neutral-900 text-sm ml-3 shrink-0">
                      {dish.price}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-400 text-center py-6">
                  Menu items will be updated shortly for this place.
                </p>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 bg-[#FAF8F5] shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {displayData.website ? (
              <a
                href={displayData.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#85312C] hover:underline flex items-center gap-1"
              >
                <span>Visit Official Website</span>
                <span>↗</span>
              </a>
            ) : (
              <span className="text-xs text-neutral-400">Google Places Verified</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="bg-[#85312C] hover:bg-[#702622] text-white px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}
