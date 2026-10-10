import { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import DiscoverPage from './pages/DiscoverPage'
import FavoritesPage from './pages/FavoritesPage'
import ComparePage from './pages/ComparePage'
import { getCurrentUser, logoutUser } from './services/auth'

const PROTECTED_PAGES = ['discover', 'compare', 'favorites', 'profile']

const PROTECTED_MESSAGES = {
  discover: 'Please log in to discover and explore curated restaurants and unique dishes.',
  compare: 'Please log in to compare restaurant menus, pricing, and ratings side-by-side.',
  favorites: 'Please log in to view and manage your saved favorite spots.',
  profile: 'Please log in to access your dining profile and preferences.',
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zaika_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null)
  const [authNotice, setAuthNotice] = useState('')

  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash
    const pageFromHash = hash.replace(/^#\/?/, '')
    const savedUser = (() => {
      try {
        const saved = localStorage.getItem('zaika_user')
        return saved ? JSON.parse(saved) : null
      } catch {
        return null
      }
    })()

    if (PROTECTED_PAGES.includes(pageFromHash)) {
      if (!savedUser) {
        return 'login'
      }
      return pageFromHash
    }

    if (pageFromHash === 'login') return 'login'
    if (pageFromHash === 'signup') return 'signup'
    return 'home'
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

  // Synchronize hash with page state and enforce protection for restricted pages
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      const pageFromHash = hash.replace(/^#\/?/, '')

      let target = 'home'
      if (pageFromHash === 'login') target = 'login'
      else if (pageFromHash === 'signup') target = 'signup'
      else if (pageFromHash === 'profile') target = 'profile'
      else if (pageFromHash === 'discover') target = 'discover'
      else if (pageFromHash === 'favorites') target = 'favorites'
      else if (pageFromHash === 'compare') target = 'compare'
      else if (hash === '#/' || hash === '' || hash.startsWith('#')) target = 'home'

      if (PROTECTED_PAGES.includes(target) && !currentUser) {
        setRedirectAfterLogin(target)
        setAuthNotice(PROTECTED_MESSAGES[target] || 'Please log in to access this page.')
        setCurrentPage('login')
        window.location.hash = '#/login'
        return
      }

      setCurrentPage(target)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [currentUser])

  const navigateTo = (page) => {
    let targetPage = page

    // Restrict Discover, Compare, Favorites, and Profile to logged-in users only
    if (PROTECTED_PAGES.includes(page) && !currentUser) {
      setRedirectAfterLogin(page)
      setAuthNotice(PROTECTED_MESSAGES[page] || 'Please log in to access this page.')
      targetPage = 'login'
    } else if (page !== 'login') {
      setAuthNotice('')
    }

    setCurrentPage(targetPage)
    if (targetPage === 'login') {
      window.location.hash = '#/login'
    } else if (targetPage === 'signup') {
      window.location.hash = '#/signup'
    } else if (targetPage === 'profile') {
      window.location.hash = '#/profile'
    } else if (targetPage === 'discover') {
      window.location.hash = '#/discover'
    } else if (targetPage === 'favorites') {
      window.location.hash = '#/favorites'
    } else if (targetPage === 'compare') {
      window.location.hash = '#/compare'
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
    const destination = redirectAfterLogin || 'home'
    setRedirectAfterLogin(null)
    setAuthNotice('')
    navigateTo(destination)
  }

  const handleSignupSuccess = (user) => {
    setCurrentUser(user)
    try {
      localStorage.setItem('zaika_user', JSON.stringify(user))
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateProfile = useCallback((updatedData) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updatedData }
      try {
        localStorage.setItem('zaika_user', JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
  }, [])

  // Automatically verify user session via HTTP-only cookie on mount
  useEffect(() => {
    let isMounted = true
    getCurrentUser()
      .then((user) => {
        if (!isMounted) return
        if (user) {
          setCurrentUser(user)
          try {
            localStorage.setItem('zaika_user', JSON.stringify(user))
          } catch (e) {
            console.error(e)
          }
        } else {
          // If server says no session or expired cookie, clear local state
          setCurrentUser(null)
          try {
            localStorage.removeItem('zaika_user')
          } catch (e) {
            console.error(e)
          }
          // If user was on a protected page, redirect to login
          setCurrentPage((curr) => {
            if (PROTECTED_PAGES.includes(curr)) {
              setRedirectAfterLogin(curr)
              setAuthNotice(PROTECTED_MESSAGES[curr] || 'Please log in to continue.')
              window.location.hash = '#/login'
              return 'login'
            }
            return curr
          })
        }
      })
      .catch((err) => {
        console.warn('Session check skipped:', err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (e) {
      console.error('Logout error:', e)
    }
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

      {/* Protected: Discover Page */}
      {currentPage === 'discover' && (
        currentUser ? (
          <DiscoverPage
            setCurrentPage={navigateTo}
            initialQuery={searchQuery}
            onAddRecentSearch={handleAddRecentSearch}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            selectedForCompare={selectedForCompare}
            onToggleCompare={handleToggleCompare}
          />
        ) : (
          <LoginPage
            setCurrentPage={navigateTo}
            onLoginSuccess={handleLoginSuccess}
            redirectNotice={PROTECTED_MESSAGES.discover}
          />
        )
      )}

      {/* Protected: Favorites Page */}
      {currentPage === 'favorites' && (
        currentUser ? (
          <FavoritesPage
            setCurrentPage={navigateTo}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            selectedForCompare={selectedForCompare}
            onToggleCompare={handleToggleCompare}
          />
        ) : (
          <LoginPage
            setCurrentPage={navigateTo}
            onLoginSuccess={handleLoginSuccess}
            redirectNotice={PROTECTED_MESSAGES.favorites}
          />
        )
      )}

      {/* Protected: Compare Page */}
      {currentPage === 'compare' && (
        currentUser ? (
          <ComparePage
            setCurrentPage={navigateTo}
            selectedForCompare={selectedForCompare}
            onToggleCompare={handleToggleCompare}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <LoginPage
            setCurrentPage={navigateTo}
            onLoginSuccess={handleLoginSuccess}
            redirectNotice={PROTECTED_MESSAGES.compare}
          />
        )
      )}

      {currentPage === 'login' && (
        <LoginPage
          setCurrentPage={navigateTo}
          onLoginSuccess={handleLoginSuccess}
          redirectNotice={authNotice}
        />
      )}

      {currentPage === 'signup' && (
        <SignupPage
          setCurrentPage={navigateTo}
          onSignupSuccess={handleSignupSuccess}
        />
      )}

      {/* Protected: Profile Page */}
      {currentPage === 'profile' && (
        currentUser ? (
          <ProfilePage
            currentUser={currentUser}
            onLogout={handleLogout}
            setCurrentPage={navigateTo}
            recentSearches={recentSearches}
            onSelectSearch={handleSelectSearch}
            onClearSearches={handleClearSearches}
            onUpdateProfile={handleUpdateProfile}
          />
        ) : (
          <LoginPage
            setCurrentPage={navigateTo}
            onLoginSuccess={handleLoginSuccess}
            redirectNotice={PROTECTED_MESSAGES.profile}
          />
        )
      )}

      {/* Shared Footer for all pages */}
      <Footer setCurrentPage={navigateTo} />
    </div>
  )
}
