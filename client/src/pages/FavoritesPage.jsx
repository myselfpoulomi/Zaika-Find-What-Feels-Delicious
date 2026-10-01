import { useState } from 'react'
import { ALL_RESTAURANTS } from '../data/restaurants'

export default function FavoritesPage({
  setCurrentPage,
  favorites = {},
  onToggleFavorite,
  selectedForCompare = {},
  onToggleCompare
}) {
  const [activeMenuModal, setActiveMenuModal] = useState(null)

  // Filter restaurants that are currently marked as favorite
  const savedRestaurants = ALL_RESTAURANTS.filter((r) => favorites[r.id])

  return (
    <main className="flex-1 w-full bg-[#FAF8F5] py-12 px-6 sm:px-10 lg:px-16 min-h-[calc(100vh-160px)]">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
            YOUR COLLECTION
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-neutral-900 font-normal leading-tight">
            Your saved places.
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base mt-1.5">
            The ones worth coming back to.
          </p>
        </div>

        {/* Top Horizontal Divider Line */}
        <div className="border-b border-neutral-200/90 mb-12 sm:mb-16 w-full" />

        {/* EMPTY STATE: Matches user screenshot */}
        {savedRestaurants.length === 0 ? (
          <div className="py-12 sm:py-20 text-center">
            {/* Heart Outline Icon */}
            <div className="flex justify-center mb-5">
              <svg
                className="w-10 h-10 sm:w-11 sm:h-11 text-[#85312C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal mb-2.5">
              Nothing saved yet.
            </h2>

            {/* Subtext */}
            <p className="text-neutral-500 text-sm sm:text-base max-w-md mx-auto mb-7 font-normal">
              When somewhere catches your eye, tap the heart to keep it here.
            </p>

            {/* Button */}
            <button
              onClick={() => setCurrentPage('discover')}
              className="inline-flex items-center gap-2 bg-[#85312C] hover:bg-[#702622] text-white text-sm font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <span>Discover places</span>
              <span className="text-base leading-none">→</span>
            </button>
          </div>
        ) : (
          /* POPULATED STATE: Saved restaurant cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {savedRestaurants.map((restaurant) => {
              const isSelected = selectedForCompare[restaurant.id]

              return (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />

                    {/* Active Heart Toggle */}
                    <button
                      onClick={() => onToggleFavorite(restaurant.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:scale-105 shadow-xs transition-all cursor-pointer"
                      title="Remove from favorites"
                      aria-label="Remove from favorites"
                    >
                      <svg
                        className="w-5 h-5 fill-rose-500 text-rose-500"
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
                    <div className="absolute bottom-3 left-3 bg-[#FAF1E8] text-[#85312C] text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs border border-[#F3E2D4]">
                      {restaurant.offer}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name & Rating */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif text-xl font-normal text-neutral-900 group-hover:text-[#85312C] transition-colors">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm font-semibold text-neutral-800">
                          <span className="text-amber-500">★</span>
                          <span>{restaurant.rating}</span>
                        </div>
                      </div>

                      {/* Cuisine */}
                      <p className="text-xs text-neutral-500 mt-1 font-normal">
                        {restaurant.cuisine}
                      </p>

                      {/* Description */}
                      <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                        {restaurant.description}
                      </p>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="mt-5 pt-3 border-t border-neutral-100">
                      {/* Details row: Price & Distance */}
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

                      {/* Action Buttons: View Menu & Selected / Compare */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveMenuModal(restaurant)}
                          className="flex-1 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>View menu</span>
                          <span className="text-sm">→</span>
                        </button>

                        <button
                          onClick={() => onToggleCompare(restaurant.id)}
                          className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#F6EEBE] hover:bg-[#ECE3AD] text-neutral-900'
                              : 'bg-[#85312C] hover:bg-[#702622] text-white shadow-xs'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <span>✓</span>
                              <span>Selected</span>
                            </>
                          ) : (
                            <>
                              <span>+</span>
                              <span>Compare</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom Horizontal Divider Line */}
        <div className="border-b border-neutral-200/90 mt-12 sm:mt-16 w-full" />
      </div>

      {/* Menu Viewer Modal */}
      {activeMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-neutral-100">
            <button
              onClick={() => setActiveMenuModal(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={activeMenuModal.image}
                alt={activeMenuModal.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-serif text-2xl font-normal text-neutral-900">
                  {activeMenuModal.name}
                </h3>
                <p className="text-xs text-neutral-500">
                  {activeMenuModal.cuisine} · {activeMenuModal.distance}
                </p>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-[#85312C] mb-3">
              Highlighted Menu
            </h4>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activeMenuModal.menu.map((dish, i) => (
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
              <span className="text-xs text-neutral-500">
                Offer: <strong className="text-[#85312C] font-semibold">{activeMenuModal.offer}</strong>
              </span>
              <button
                onClick={() => setActiveMenuModal(null)}
                className="bg-[#85312C] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#702622] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
