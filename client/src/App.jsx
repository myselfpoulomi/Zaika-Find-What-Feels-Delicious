import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash
    if (hash === '#/login') return 'login'
    if (hash === '#/signup') return 'signup'
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

  // Synchronize hash with page state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#/login') {
        setCurrentPage('login')
      } else if (hash === '#/signup') {
        setCurrentPage('signup')
      } else if (hash === '#/' || hash === '' || hash.startsWith('#')) {
        // If it's a section anchor like #compare or #shortlist, remain on home
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
    } else {
      window.location.hash = '#/'
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const handleLogout = () => {
    setCurrentUser(null)
    try {
      localStorage.removeItem('zaika_user')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 flex flex-col font-sans selection:bg-[#85312C] selection:text-white">
      {/* Shared Navbar for all pages */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={navigateTo}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Page Content */}
      {currentPage === 'home' && (
        <HomePage setCurrentPage={navigateTo} />
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

      {/* Shared Footer for all pages */}
      <Footer setCurrentPage={navigateTo} />
    </div>
  )
}
