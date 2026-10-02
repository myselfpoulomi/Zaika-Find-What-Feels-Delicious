import React from 'react'
import zaikaLogo from '../assets/zaika.png'

export default function Navbar({
  currentPage,
  setCurrentPage,
  currentUser
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/70">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Logo & Nav Links */}
        <div className="flex items-center gap-10">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 group cursor-pointer border-0 bg-transparent p-0"
            title="Go to Home"
          >
            <img
              src={zaikaLogo}
              alt="Zaika"
              className="h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-102"
            />
          </button>

          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-neutral-700">
            <button
              onClick={() => setCurrentPage('discover')}
              className={`transition-colors cursor-pointer bg-transparent border-0 p-0 text-[15px] font-medium ${
                currentPage === 'discover'
                  ? 'text-[#85312C] font-semibold'
                  : 'text-neutral-700 hover:text-[#85312C]'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setCurrentPage('compare')}
              className={`transition-colors cursor-pointer bg-transparent border-0 p-0 text-[15px] font-medium ${
                currentPage === 'compare'
                  ? 'text-[#85312C] font-semibold'
                  : 'text-neutral-700 hover:text-[#85312C]'
              }`}
            >
              Compare
            </button>
            <button
              onClick={() => setCurrentPage('favorites')}
              className={`transition-colors cursor-pointer bg-transparent border-0 p-0 text-[15px] font-medium ${
                currentPage === 'favorites'
                  ? 'text-[#85312C] font-semibold'
                  : 'text-neutral-700 hover:text-[#85312C]'
              }`}
            >
              Favorites
            </button>
          </nav>
        </div>

        {/* Right: Search, Profile Icon Button (Navigates to /profile), (Log in if guest), Compare Button */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => {
              if (currentPage !== 'home') {
                setCurrentPage('home')
                setTimeout(() => {
                  const el = document.getElementById('search-input')
                  el?.focus()
                  el?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              } else {
                const el = document.getElementById('search-input')
                el?.focus()
                el?.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="text-neutral-700 hover:text-[#85312C] transition-colors p-1.5 cursor-pointer"
            title="Search"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </button>

          {/* User Icon Button: Navigates directly to Profile Page Route */}
          <button
            onClick={() => setCurrentPage('profile')}
            className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
              currentPage === 'profile'
                ? 'text-[#85312C] bg-[#FAF1E8] ring-2 ring-[#85312C]/30'
                : currentUser
                ? 'text-neutral-800 hover:text-[#85312C] hover:bg-[#FAF1E8]'
                : 'text-neutral-700 hover:text-[#85312C]'
            }`}
            title={currentUser ? `${currentUser.name} - Profile & Settings` : 'My Profile & Account'}
            aria-label="My Profile & Account"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {!currentUser && (
            <button
              onClick={() => setCurrentPage('login')}
              className={`hidden sm:inline-block text-[14px] font-medium transition-colors cursor-pointer ${
                currentPage === 'login'
                  ? 'text-[#85312C] font-semibold'
                  : 'text-neutral-800 hover:text-[#85312C]'
              }`}
            >
              Log in
            </button>
          )}

          <button
            onClick={() => setCurrentPage('compare')}
            className="inline-flex items-center gap-2 bg-[#85312C] hover:bg-[#702622] text-white text-[14px] font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
          >
            <span>Compare menus</span>
            <span className="text-base leading-none">→</span>
          </button>
        </div>
      </div>
    </header>
  )
}
