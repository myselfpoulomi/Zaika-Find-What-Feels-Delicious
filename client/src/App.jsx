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
import {
  getCompareCookie,
  fetchUserCompare,
  saveUserCompare,
  clearUserCompare,
  removeCompareCookie,
  getLastComparison,
  saveLastComparison,
} from './services/compareService'

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
      const parsed = saved ? JSON.parse(saved) : {}
      const cleaned = {}
      for (const [k, v] of Object.entries(parsed)) {
        if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(String(k))) {
          cleaned[k] = v
        }
      }
      return cleaned
    } catch {
      return {}
    }
  })

  // Historical previously compared menu to display in the Home page "The Zaika Way" card
  const [lastComparison, setLastComparison] = useState(() => {
    try {
      const savedUser = localStorage.getItem('zaika_user')
      const user = savedUser ? JSON.parse(savedUser) : null
      return getLastComparison(user?.id)
    } catch {
      return null
    }
  })

  // Active places selected for comparison on the compare page (always starts empty on login/session)
  const [selectedForCompare, setSelectedForCompare] = useState({})

  // Synchronize last comparison per-user while keeping active compare list clean
  useEffect(() => {
    if (!currentUser?.id) {
      setSelectedForCompare({})
      setLastComparison(getLastComparison(null))
      return
    }

    let isMounted = true

    // Load cached last comparison
    const cachedLast = getLastComparison(currentUser.id)
    if (cachedLast) {
      setLastComparison(cachedLast)
    }

    // Fetch latest from database (only updates lastComparison history, never pollutes active selection)
    fetchUserCompare()
      .then((data) => {
        if (!isMounted || !data) return
        if (data.lastComparison) {
          setLastComparison(data.lastComparison)
          saveLastComparison(currentUser.id, data.lastComparison)
        }
      })
      .catch((err) => {
        console.warn('Sync user compare error:', err)
      })

    return () => {
      isMounted = false
    }
  }, [currentUser?.id])

  const [customRestaurants, setCustomRestaurants] = useState(() => {
    try {
      const saved = localStorage.getItem('zaika_custom_restaurants')
      const parsed = saved ? JSON.parse(saved) : {}
      const cleaned = {}
      for (const [k, v] of Object.entries(parsed)) {
        if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(String(k))) {
          cleaned[k] = v
        }
      }
      return cleaned
    } catch {
      return {}
    }
  })

  const [discoveredRestaurants, setDiscoveredRestaurants] = useState(() => {
    try {
      const saved = localStorage.getItem('zaika_discovered_restaurants')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const handleUpdateDiscoveredRestaurants = useCallback((restaurantsList) => {
    if (Array.isArray(restaurantsList) && restaurantsList.length > 0) {
      setDiscoveredRestaurants(restaurantsList)
      try {
        localStorage.setItem('zaika_discovered_restaurants', JSON.stringify(restaurantsList))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

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

  const handleToggleFavorite = (id, restaurantObj = null) => {
    setFavorites((prev) => {
      const updated = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem('zaika_favorites', JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
    if (restaurantObj) {
      setCustomRestaurants((prev) => {
        const updated = { ...prev, [id]: restaurantObj }
        try {
          localStorage.setItem('zaika_custom_restaurants', JSON.stringify(updated))
        } catch (e) {
          console.error(e)
        }
        return updated
      })
    }
  }

  const handleToggleCompare = (id, restaurantObj = null) => {
    setSelectedForCompare((prev) => {
      const isCurrentlySelected = !!prev[id]
      const updated = { ...prev }
      if (isCurrentlySelected) {
        delete updated[id]
      } else {
        const count = Object.values(updated).filter(Boolean).length
        if (count >= 4) {
          alert('You can compare a maximum of 4 restaurants at a time.')
          return prev
        }
        updated[id] = true
      }

      if (currentUser?.id) {
        const ids = Object.keys(updated).filter((k) => updated[k])
        try {
          localStorage.setItem(`zaika_selected_for_compare_${currentUser.id}`, JSON.stringify(updated))
        } catch (e) {
          console.error(e)
        }
        saveUserCompare({
          userId: currentUser.id,
          restaurantIds: ids,
        }).catch((err) => console.warn('Save compare error:', err))
      }

      return updated
    })

    if (restaurantObj) {
      setCustomRestaurants((prev) => {
        const updated = { ...prev, [id]: restaurantObj }
        try {
          localStorage.setItem('zaika_custom_restaurants', JSON.stringify(updated))
        } catch (e) {
          console.error(e)
        }
        return updated
      })
    }
  }

  const handleClearCompare = () => {
    setSelectedForCompare({})
    if (currentUser?.id) {
      try {
        localStorage.removeItem(`zaika_selected_for_compare_${currentUser.id}`)
      } catch (e) {
        console.error(e)
      }
      clearUserCompare().catch((err) => console.warn('Clear compare error:', err))
    }
  }

  // Location change handler: remove previously compared places from active compare page
  const handleLocationChange = useCallback((newLoc) => {
    setSelectedForCompare({})
    if (currentUser?.id) {
      try {
        localStorage.removeItem(`zaika_selected_for_compare_${currentUser.id}`)
      } catch (e) {
        console.error(e)
      }
      clearUserCompare().catch((err) => console.warn('Clear compare on location change error:', err))
    }
  }, [currentUser?.id])

  // Save last compared menu snapshot
  const handleSaveLastComparison = useCallback((compData) => {
    if (!compData) return
    setLastComparison(compData)
    saveLastComparison(currentUser?.id, compData)
  }, [currentUser?.id])

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

    // Always reset active compare selection on login:
    // Ask user to choose places again, never keep stale places in compare page
    setSelectedForCompare({})

    if (user?.id) {
      try {
        localStorage.removeItem(`zaika_selected_for_compare_${user.id}`)
      } catch (e) {
        console.error(e)
      }

      // Restore previously compared menu strictly for the Home page hero recap
      const prev = getLastComparison(user.id)
      if (prev) {
        setLastComparison(prev)
      }

      clearUserCompare().catch(() => {})
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
    setSelectedForCompare({})
    removeCompareCookie()
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
        compareCount={Object.values(selectedForCompare).filter(Boolean).length}
      />

      {/* Main Page Content */}
      {currentPage === 'home' && (
        <HomePage
          setCurrentPage={navigateTo}
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddRecentSearch={handleAddRecentSearch}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          selectedForCompare={selectedForCompare}
          onToggleCompare={handleToggleCompare}
          lastComparison={lastComparison}
        />
      )}

      {/* Protected: Discover Page */}
      {currentPage === 'discover' && (
        currentUser ? (
          <DiscoverPage
            setCurrentPage={navigateTo}
            currentUser={currentUser}
            initialQuery={searchQuery}
            onAddRecentSearch={handleAddRecentSearch}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            selectedForCompare={selectedForCompare}
            onToggleCompare={handleToggleCompare}
            onClearCompare={handleClearCompare}
            onLocationChange={handleLocationChange}
            onUpdateDiscoveredRestaurants={handleUpdateDiscoveredRestaurants}
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
            currentUser={currentUser}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            selectedForCompare={selectedForCompare}
            onToggleCompare={handleToggleCompare}
            customRestaurants={customRestaurants}
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
            currentUser={currentUser}
            selectedForCompare={selectedForCompare}
            onToggleCompare={handleToggleCompare}
            onClearCompare={handleClearCompare}
            customRestaurants={customRestaurants}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            discoveredRestaurants={discoveredRestaurants}
            onUpdateDiscoveredRestaurants={handleUpdateDiscoveredRestaurants}
            lastComparison={lastComparison}
            onSaveLastComparison={handleSaveLastComparison}
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
