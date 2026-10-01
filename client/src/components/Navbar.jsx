import React from 'react'
import zaikaLogo from '../assets/zaika.png'

export default function Navbar({ currentPage, setCurrentPage, currentUser, onLogout }) {
  const handleNavClick = (targetHash) => {
    if (currentPage !== 'home') {
      setCurrentPage('home')
      setTimeout(() => {
        const el = document.querySelector(targetHash)
        el?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const el = document.querySelector(targetHash)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
              onClick={() => handleNavClick('#shortlist')}
              className="hover:text-[#85312C] transition-colors cursor-pointer bg-transparent border-0 p-0 text-[15px] font-medium text-neutral-700"
            >
              Discover
            </button>
            <button
              onClick={() => handleNavClick('#compare')}
              className="hover:text-[#85312C] transition-colors cursor-pointer bg-transparent border-0 p-0 text-[15px] font-medium text-neutral-700"
            >
              Compare
            </button>
            <button
              onClick={() => handleNavClick('#shortlist')}
              className="hover:text-[#85312C] transition-colors cursor-pointer bg-transparent border-0 p-0 text-[15px] font-medium text-neutral-700"
            >
              Favorites
            </button>
          </nav>
        </div>

        {/* Right: Search, Profile, Log in / Account, Compare Button */}
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

          <button
            onClick={() => {
              if (!currentUser) {
                setCurrentPage('login')
              }
            }}
            className="text-neutral-700 hover:text-[#85312C] transition-colors p-1.5 cursor-pointer"
            title={currentUser ? currentUser.name : 'Account'}
            aria-label="Account"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {currentUser ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-800 bg-[#FAF1E8] text-[#85312C] px-2.5 py-1 rounded-full">
                Hi, {currentUser.name.split(' ')[0]}
              </span>
              <button
                onClick={onLogout}
                className="text-xs text-neutral-500 hover:text-[#85312C] underline ml-1 cursor-pointer"
              >
                Log out
              </button>
            </div>
          ) : (
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
            onClick={() => handleNavClick('#compare')}
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
