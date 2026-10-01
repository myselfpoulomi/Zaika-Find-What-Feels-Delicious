import React from 'react'
import zaikaLogo from '../assets/zaika.png'

export default function Footer({ setCurrentPage }) {
  const handleNavClick = (targetHash) => {
    setCurrentPage('home')
    setTimeout(() => {
      const el = document.querySelector(targetHash)
      el?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <footer className="bg-[#FAF5EA] border-t border-[#EFE8D6] py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Logo and Tagline */}
        <div>
          <button
            onClick={() => setCurrentPage('home')}
            className="inline-block p-0 bg-transparent border-0 cursor-pointer text-left"
            title="Go to Home"
          >
            <img
              src={zaikaLogo}
              alt="Zaika"
              className="h-8 md:h-9 w-auto object-contain"
            />
          </button>
          <p className="text-xs text-neutral-600 mt-2 font-normal">
            Discover. Compare. Decide. Eat.
          </p>
        </div>

        {/* Right: Navigation Links */}
        <div className="flex flex-wrap items-center gap-6 md:gap-8 text-xs md:text-sm text-neutral-700 font-medium">
          <button
            onClick={() => handleNavClick('#shortlist')}
            className="hover:text-[#85312C] transition-colors bg-transparent border-0 p-0 text-xs md:text-sm text-neutral-700 font-medium cursor-pointer"
          >
            Discover
          </button>
          <button
            onClick={() => handleNavClick('#compare')}
            className="hover:text-[#85312C] transition-colors bg-transparent border-0 p-0 text-xs md:text-sm text-neutral-700 font-medium cursor-pointer"
          >
            Compare
          </button>
          <button
            onClick={() => setCurrentPage('favorites')}
            className="hover:text-[#85312C] transition-colors bg-transparent border-0 p-0 text-xs md:text-sm text-neutral-700 font-medium cursor-pointer"
          >
            Favorites
          </button>
          <button
            onClick={() => {
              alert('For restaurant partners: Zaika menu onboarding portal is opening soon!')
            }}
            className="hover:text-[#85312C] transition-colors bg-transparent border-0 p-0 text-xs md:text-sm text-neutral-700 font-medium cursor-pointer"
          >
            For restaurants
          </button>
        </div>
      </div>
    </footer>
  )
}
