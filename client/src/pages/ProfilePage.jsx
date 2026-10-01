import { useState } from 'react'

export default function ProfilePage({
  currentUser,
  onLogout,
  setCurrentPage
}) {
  const [favoriteCuisine, setFavoriteCuisine] = useState('Italian')
  const [typicalBudget, setTypicalBudget] = useState('1500')
  const [dietaryPref, setDietaryPref] = useState('Vegetarian')

  // Count of saved restaurants (default 0 or loaded from localStorage)
  const [savedCount] = useState(() => {
    try {
      const saved = localStorage.getItem('zaika_favorites')
      if (saved) {
        const parsed = JSON.parse(saved)
        return Object.values(parsed).filter(Boolean).length
      }
      return 0
    } catch {
      return 0
    }
  })

  // Display name
  const displayName = currentUser?.name
    ? currentUser.name.split(' ')[0]
    : 'food lover'

  return (
    <main className="flex-1 w-full bg-[#FAF8F5] py-12 px-6 sm:px-10 lg:px-16">
      <div className="max-w-5xl mx-auto">
        {/* Top Eyebrow & Title */}
        <div className="mb-6">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
            YOUR CORNER
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-neutral-900 font-normal">
            Your profile.
          </h1>
        </div>

        {/* User Identity Header */}
        <div className="flex items-center gap-4 py-2">
          {/* Circular Avatar */}
          <div className="w-14 h-14 rounded-full bg-[#FAF4DC] border border-[#EDE3C4] text-neutral-800 flex items-center justify-center text-xl shrink-0">
            <svg
              className="w-6 h-6 text-neutral-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-neutral-900 leading-tight">
              Hello, {displayName}.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Your personal dining space
            </p>
          </div>
        </div>

        {/* Horizontal Divider Line */}
        <div className="border-b border-neutral-200/90 my-8 w-full" />

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT COLUMN: Your Preferences */}
          <div className="lg:col-span-7">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-6">
              <svg
                className="w-5 h-5 text-[#85312C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 6h18M3 12h18M3 18h18"
                />
                <circle cx="8" cy="6" r="2" fill="#85312C" />
                <circle cx="16" cy="12" r="2" fill="#85312C" />
                <circle cx="10" cy="18" r="2" fill="#85312C" />
              </svg>
              <h3 className="font-serif text-2xl font-normal text-neutral-900">
                Your preferences
              </h3>
            </div>

            {/* Preference Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              {/* Row: Favorite Cuisine & Typical Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Favorite Cuisine */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                    Favorite cuisine
                  </label>
                  <div className="relative">
                    <select
                      value={favoriteCuisine}
                      onChange={(e) => setFavoriteCuisine(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] appearance-none cursor-pointer transition-all pr-8"
                    >
                      <option value="Italian">Italian</option>
                      <option value="North Indian">North Indian</option>
                      <option value="Café · Breakfast">Café · Breakfast</option>
                      <option value="Street Food">Street Food</option>
                      <option value="South Indian">South Indian</option>
                      <option value="Continental">Continental</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Typical Budget */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                    Typical budget
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sm text-neutral-600 font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={typicalBudget}
                      onChange={(e) => setTypicalBudget(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg pl-8 pr-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] transition-all"
                      placeholder="1500"
                    />
                  </div>
                </div>
              </div>

              {/* Dietary Preference */}
              <div className="sm:w-1/2 pr-0 sm:pr-2">
                <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                  Dietary preference
                </label>
                <div className="relative">
                  <select
                    value={dietaryPref}
                    onChange={(e) => setDietaryPref(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] appearance-none cursor-pointer transition-all pr-8"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="No restrictions">No restrictions</option>
                    <option value="Pure Veg">Pure Veg</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Subtitle Note */}
              <p className="text-xs text-neutral-400 pt-2 font-normal">
                Preferences are available for this visit only in this preview.
              </p>
            </form>
          </div>

          {/* RIGHT COLUMN: Navigation Links & Logout Button */}
          <div className="lg:col-span-5 space-y-4">
            {/* Item 1: Saved restaurants */}
            <button
              onClick={() => setCurrentPage('favorites')}
              className="w-full flex items-center justify-between py-3.5 border-b border-neutral-200/90 hover:text-[#85312C] transition-colors group cursor-pointer text-left bg-transparent border-t-0 border-x-0"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-[#85312C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                <span className="text-sm font-medium text-neutral-800 group-hover:text-[#85312C] transition-colors">
                  Saved restaurants
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 group-hover:text-[#85312C] transition-colors">
                <span>{savedCount}</span>
                <span className="text-sm leading-none">→</span>
              </div>
            </button>

            {/* Item 2: Recent comparisons */}
            <button
              onClick={() => {
                setCurrentPage('home')
                setTimeout(() => {
                  const el = document.getElementById('compare')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="w-full flex items-center justify-between py-3.5 border-b border-neutral-200/90 hover:text-[#85312C] transition-colors group cursor-pointer text-left bg-transparent border-t-0 border-x-0"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-neutral-700 group-hover:text-[#85312C] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
                  <circle cx="8" cy="6" r="2" fill="currentColor" />
                  <circle cx="16" cy="12" r="2" fill="currentColor" />
                  <circle cx="10" cy="18" r="2" fill="currentColor" />
                </svg>
                <span className="text-sm font-medium text-neutral-800 group-hover:text-[#85312C] transition-colors">
                  Recent comparisons
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500 group-hover:text-[#85312C] transition-colors">
                <span className="text-sm leading-none">→</span>
              </div>
            </button>

            {/* Item 3: Your reviews */}
            <div className="flex items-center justify-between py-3.5 border-b border-neutral-200/90 text-neutral-500">
              <div className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm font-medium text-neutral-800">
                  Your reviews
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-normal">
                Coming later
              </span>
            </div>

            {/* Logout Button (requested by user) */}
            <div className="pt-4">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50/60 text-[#85312C] hover:text-red-700 border border-neutral-300 hover:border-red-200 py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer group"
              >
                <svg
                  className="w-4 h-4 text-[#85312C] group-hover:text-red-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
