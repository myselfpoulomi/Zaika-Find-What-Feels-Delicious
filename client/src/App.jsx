import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import DiscoverPage from './pages/DiscoverPage'
import FavoritesPage from './pages/FavoritesPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash
    if (hash === '#/login') return 'login'
    if (hash === '#/signup') return 'signup'
    if (hash === '#/profile') return 'profile'
    if (hash === '#/discover') return 'discover'
    if (hash === '#/favorites') return 'favorites'
    return 'home'
  })

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zaika_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('zaika_favorites')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [selectedForCompare, setSelectedForCompare] = useState({
    1: true,
    2: true,
    3: true
  })

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('zaika_recent_searches')
      return saved
        ? JSON.parse(saved)
        : [
            'Italian dinner for 2 under ₹1500',
            'Vegetarian date night',
            'Cafes with work space'
          ]
    } catch {
      return [
        'Italian dinner for 2 under ₹1500',
        'Vegetarian date night',
        'Cafes with work space'
      ]
    }
  })

  const [searchQuery, setSearchQuery] = useState('')

  // Synchronize hash with page state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#/login') {
        setCurrentPage('login')
      } else if (hash === '#/signup') {
        setCurrentPage('signup')
      } else if (hash === '#/profile') {
        setCurrentPage('profile')
      } else if (hash === '#/discover') {
        setCurrentPage('discover')
      } else if (hash === '#/favorites') {
        setCurrentPage('favorites')
      } else if (hash === '#/' || hash === '' || hash.startsWith('#')) {
        if (hash === '#/home' || hash === '#/' || hash === '') {
          setCurrentPage('home')
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateTo = (page) => {
    setCurrentPage(page)
    if (page === 'login') {
      window.location.hash = '#/login'
    } else if (page === 'signup') {
      window.location.hash = '#/signup'
    } else if (page === 'profile') {
      window.location.hash = '#/profile'
    } else if (page === 'discover') {
      window.location.hash = '#/discover'
    } else if (page === 'favorites') {
      window.location.hash = '#/favorites'
    } else {
      window.location.hash = '#/'
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleToggleFavorite = (id) => {
    setFavorites((prev) => {
      const updated = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem('zaika_favorites', JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
  }

  const handleToggleCompare = (id) => {
    setSelectedForCompare((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAddRecentSearch = (query) => {
    if (!query || !query.trim()) return
    const clean = query.trim()
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())
      const updated = [clean, ...filtered].slice(0, 5)
      try {
        localStorage.setItem('zaika_recent_searches', JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
  }

  const handleSelectSearch = (query) => {
    setSearchQuery(query)
    handleAddRecentSearch(query)
    navigateTo('home')
    setTimeout(() => {
      const shortlist = document.getElementById('shortlist')
      shortlist?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }

  const handleClearSearches = () => {
    setRecentSearches([])
    try {
      localStorage.removeItem('zaika_recent_searches')
    } catch (e) {
      console.error(e)
    }
  }

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    try {
      localStorage.setItem('zaika_user', JSON.stringify(user))
    } catch (e) {
      console.error(e)
    }
    navigateTo('home')
  }

  const handleSignupSuccess = (user) => {
    setCurrentUser(user)
    try {
      localStorage.setItem('zaika_user', JSON.stringify(user))
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateProfile = (updatedData) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updatedData }
      try {
        localStorage.setItem('zaika_user', JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
  }

  const handleLogout = () => {
    setCurrentUser(null)
    try {
      localStorage.removeItem('zaika_user')
    } catch (e) {
      console.error(e)
    }
    navigateTo('home')
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 flex flex-col font-sans selection:bg-[#85312C] selection:text-white">
      {/* Shared Navbar for all pages */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={navigateTo}
        currentUser={currentUser}
      />

      {/* Main Page Content */}
      {currentPage === 'home' && (
        <HomePage
          setCurrentPage={navigateTo}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddRecentSearch={handleAddRecentSearch}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          selectedForCompare={selectedForCompare}
          onToggleCompare={handleToggleCompare}
        />
      )}

      {currentPage === 'discover' && (
        <DiscoverPage
          setCurrentPage={navigateTo}
          initialQuery={searchQuery}
          onAddRecentSearch={handleAddRecentSearch}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          selectedForCompare={selectedForCompare}
          onToggleCompare={handleToggleCompare}
        />
      )}

      {currentPage === 'favorites' && (
        <FavoritesPage
          setCurrentPage={navigateTo}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          selectedForCompare={selectedForCompare}
          onToggleCompare={handleToggleCompare}
        />
      )}

      {currentPage === 'login' && (
        <LoginPage
          setCurrentPage={navigateTo}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === 'signup' && (
        <SignupPage
          setCurrentPage={navigateTo}
          onSignupSuccess={handleSignupSuccess}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          currentUser={currentUser}
          onLogout={handleLogout}
          setCurrentPage={navigateTo}
          recentSearches={recentSearches}
          onSelectSearch={handleSelectSearch}
          onClearSearches={handleClearSearches}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {/* Shared Footer for all pages */}
      <Footer setCurrentPage={navigateTo} />
    </div>
  )
}
