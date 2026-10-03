import { useState, useEffect, useRef } from 'react'
import zaikaLogo from '../assets/zaika.png'

export default function Navbar({
  currentPage,
  setCurrentPage,
  currentUser
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navRef = useRef(null)

  const handleNavigate = (page) => {
    setCurrentPage(page)
    setIsMenuOpen(false)
  }

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMenuOpen])

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  // Automatically close on resize to larger viewport (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navLinks = [
    {
      id: 'discover',
      label: 'Discover',
      description: 'Explore curated restaurants and unique dishes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
        </svg>
      )
    },
    {
      id: 'favorites',
      label: 'Favorites',
      description: 'Quickly access your saved restaurants',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 'compare',
      label: 'Compare',
      description: 'Analyze menus, pricing, and ratings side-by-side',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ]

  return (
    <header ref={navRef} className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Left: Logo & Desktop Nav Links */}
        <div className="flex items-center gap-8 lg:gap-10">
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2 group cursor-pointer border-0 bg-transparent p-0"
            title="Go to Home"
          >
            <img
              src={zaikaLogo}
              alt="Zaika"
              className="h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-102"
            />
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-neutral-700">
            <button
              onClick={() => handleNavigate('discover')}
              className={`transition-colors cursor-pointer bg-transparent border-0 p-0 text-[15px] font-medium ${
                currentPage === 'discover'
                  ? 'text-[#85312C] font-semibold'
                  : 'text-neutral-700 hover:text-[#85312C]'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => handleNavigate('compare')}
              className={`transition-colors cursor-pointer bg-transparent border-0 p-0 text-[15px] font-medium ${
                currentPage === 'compare'
                  ? 'text-[#85312C] font-semibold'
                  : 'text-neutral-700 hover:text-[#85312C]'
              }`}
            >
              Compare
            </button>
            <button
              onClick={() => handleNavigate('favorites')}
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

        {/* Right Section: Profile Icon Button, Hamburger Button (Mobile), Desktop Login & Compare */}
        <div className="flex items-center gap-2.5 sm:gap-4 md:gap-6">
          {/* User Icon Button: Navigates directly to Profile Page if logged in, or Login Page if logged out */}
          <button
            onClick={() => handleNavigate(currentUser ? 'profile' : 'login')}
            className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
              currentPage === 'profile'
                ? 'text-[#85312C] bg-[#FAF1E8] ring-2 ring-[#85312C]/30'
                : currentUser
                ? 'text-neutral-800 hover:text-[#85312C] hover:bg-[#FAF1E8]'
                : 'text-neutral-700 hover:text-[#85312C]'
            }`}
            title={currentUser ? `${currentUser.name} - Profile & Settings` : 'Log in to your account'}
            aria-label={currentUser ? 'My Profile & Account' : 'Log in to your account'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {/* Hamburger Menu Button: Positioned right after profile icon, visible on smaller devices (md:hidden) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            className={`md:hidden p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              isMenuOpen
                ? 'text-[#85312C] bg-[#FAF1E8] ring-2 ring-[#85312C]/20'
                : 'text-neutral-700 hover:text-[#85312C] hover:bg-[#FAF1E8]'
            }`}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop Only: Login button */}
          {!currentUser && (
            <button
              onClick={() => handleNavigate('login')}
              className={`hidden md:inline-block text-[14px] font-medium transition-colors cursor-pointer ${
                currentPage === 'login'
                  ? 'text-[#85312C] font-semibold'
                  : 'text-neutral-800 hover:text-[#85312C]'
              }`}
            >
              Log in
            </button>
          )}

          {/* Desktop Only: Compare menus button */}
          <button
            onClick={() => handleNavigate('compare')}
            className="hidden md:inline-flex items-center gap-2 bg-[#85312C] hover:bg-[#702622] text-white text-[14px] font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
          >
            <span>Compare menus</span>
            <span className="text-base leading-none">→</span>
          </button>
        </div>
      </div>

      {/* Backdrop overlay for smaller devices */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 top-20 bg-neutral-900/40 backdrop-blur-xs z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile Hamburger Drawer Menu */}
      <div
        className={`md:hidden relative z-40 bg-white border-t border-neutral-200/80 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-5 py-4 space-y-2">
          {/* Section: Main Navigation Links */}
          <div className="space-y-1">
            <p className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Menu Navigation
            </p>
            {navLinks.map((item) => {
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#FAF1E8] text-[#85312C] font-semibold shadow-xs'
                      : 'text-neutral-700 hover:bg-[#FAF8F5] hover:text-[#85312C]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-2 rounded-lg transition-colors ${
                        isActive ? 'bg-[#85312C] text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <div className="text-[15px] font-medium leading-snug">{item.label}</div>
                      <div className="text-[12px] text-neutral-500 font-normal leading-tight">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#85312C]" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="h-px bg-neutral-100 my-2" />

          {/* Quick Action: Compare Menus CTA */}
          <button
            onClick={() => handleNavigate('compare')}
            className="w-full flex items-center justify-center gap-2 bg-[#85312C] hover:bg-[#702622] text-white text-[14px] font-medium py-2.5 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <span>Compare Menus</span>
            <span className="text-base leading-none">→</span>
          </button>

          {/* Section: Account / Authentication in Mobile Menu */}
          {!currentUser ? (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleNavigate('login')}
                className={`py-2 px-3 text-[14px] font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                  currentPage === 'login'
                    ? 'border-[#85312C] text-[#85312C] bg-[#FAF1E8]'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => handleNavigate('signup')}
                className={`py-2 px-3 text-[14px] font-medium rounded-lg text-center transition-colors cursor-pointer ${
                  currentPage === 'signup'
                    ? 'bg-[#85312C] text-white'
                    : 'bg-neutral-800 hover:bg-neutral-900 text-white'
                }`}
              >
                Sign up
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => handleNavigate('profile')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 hover:bg-[#FAF8F5] transition-colors cursor-pointer ${
                  currentPage === 'profile' ? 'bg-[#FAF1E8] border-[#85312C]/40 text-[#85312C]' : 'text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#85312C] text-white flex items-center justify-center font-semibold text-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-semibold leading-tight text-neutral-800">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-neutral-500">View profile & preferences</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400 font-medium">Manage →</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
