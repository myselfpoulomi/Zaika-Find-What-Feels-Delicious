import { useState, useEffect } from 'react'
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from '../services/auth'

export default function ProfilePage({
  currentUser,
  onLogout,
  setCurrentPage,
  onUpdateProfile,
}) {
  // Profile preferences
  const [favoriteCuisine, setFavoriteCuisine] = useState(
    currentUser?.favoriteCuisine || 'Italian'
  )
  const [typicalBudget, setTypicalBudget] = useState(
    currentUser?.typicalBudget || '1500'
  )
  const [dietaryPref, setDietaryPref] = useState(
    currentUser?.dietaryPref || 'Vegetarian'
  )

  // Profile personal info
  const [name, setName] = useState(currentUser?.name || '')
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [bio, setBio] = useState(currentUser?.bio || '')

  // Edit Profile Modal / Form
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState(currentUser?.name || '')
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '')
  const [editBio, setEditBio] = useState(currentUser?.bio || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  // Status & Feedback States
  const [isSavingPrefs, setIsSavingPrefs] = useState(false)
  const [prefsSuccessMsg, setPrefsSuccessMsg] = useState('')
  const [prefsErrorMsg, setPrefsErrorMsg] = useState('')

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileModalError, setProfileModalError] = useState('')

  // Delete Account Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Saved restaurants count
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

  // Fetch fresh profile from database on mount or user change
  useEffect(() => {
    let isMounted = true
    if (currentUser?.id) {
      getUserProfile()
        .then((freshUser) => {
          if (!isMounted || !freshUser) return
          setName(freshUser.name || '')
          setPhone(freshUser.phone || '')
          setBio(freshUser.bio || '')
          if (freshUser.favoriteCuisine) setFavoriteCuisine(freshUser.favoriteCuisine)
          if (freshUser.typicalBudget) setTypicalBudget(freshUser.typicalBudget)
          if (freshUser.dietaryPref) setDietaryPref(freshUser.dietaryPref)
          if (onUpdateProfile) {
            onUpdateProfile(freshUser)
          }
        })
        .catch((err) => {
          console.warn('Could not sync fresh profile:', err.message)
        })
    }
    return () => {
      isMounted = false
    }
  }, [currentUser?.id, onUpdateProfile])

  // If user is not logged in, prompt to log in
  if (!currentUser) {
    return (
      <main className="flex-1 w-full bg-[#FAF8F5] py-16 sm:py-24 min-h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FAF1E8] border border-[#85312C]/20 text-[#85312C] mx-auto flex items-center justify-center mb-5 shadow-xs">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
            YOUR CORNER
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal mb-3">
            Please log in
          </h1>
          <p className="text-neutral-600 text-sm mb-8 leading-relaxed">
            You are currently logged out. Sign in or create an account to view and manage your dining preferences and saved spots.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage('login')}
              className="w-full sm:w-auto bg-[#85312C] hover:bg-[#702622] text-white text-sm font-medium px-6 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Log in
            </button>
            <button
              onClick={() => setCurrentPage('signup')}
              className="w-full sm:w-auto bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-sm font-medium px-6 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Create account
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Handle Save Preferences (CRUD Update)
  const handleSavePreferences = async (e) => {
    e.preventDefault()
    setIsSavingPrefs(true)
    setPrefsSuccessMsg('')
    setPrefsErrorMsg('')

    try {
      const updatedUser = await updateUserProfile({
        favoriteCuisine,
        typicalBudget,
        dietaryPref,
      })

      if (onUpdateProfile) {
        onUpdateProfile(updatedUser)
      }
      setPrefsSuccessMsg('Your dining preferences have been updated!')
      setTimeout(() => setPrefsSuccessMsg(''), 4000)
    } catch (err) {
      setPrefsErrorMsg(err.message || 'Failed to update preferences.')
    } finally {
      setIsSavingPrefs(false)
    }
  }

  // Open Edit Profile Modal
  const openEditModal = () => {
    setEditName(name || currentUser.name || '')
    setEditPhone(phone || '')
    setEditBio(bio || '')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setShowPasswordFields(false)
    setProfileModalError('')
    setIsEditModalOpen(true)
  }

  // Handle Submit Edit Profile Modal (CRUD Update)
  const handleSaveProfileDetails = async (e) => {
    e.preventDefault()
    setProfileModalError('')

    if (!editName.trim()) {
      setProfileModalError('Full name cannot be empty.')
      return
    }

    if (showPasswordFields && newPassword) {
      if (!currentPassword) {
        setProfileModalError('Current password is required to change password.')
        return
      }
      if (newPassword.length < 6) {
        setProfileModalError('New password must be at least 6 characters.')
        return
      }
      if (newPassword !== confirmNewPassword) {
        setProfileModalError('New passwords do not match.')
        return
      }
    }

    setIsUpdatingProfile(true)
    try {
      const updatePayload = {
        name: editName.trim(),
        phone: editPhone.trim(),
        bio: editBio.trim(),
      }

      if (showPasswordFields && newPassword) {
        updatePayload.currentPassword = currentPassword
        updatePayload.newPassword = newPassword
      }

      const updatedUser = await updateUserProfile(updatePayload)

      setName(updatedUser.name)
      setPhone(updatedUser.phone || '')
      setBio(updatedUser.bio || '')

      if (onUpdateProfile) {
        onUpdateProfile(updatedUser)
      }

      setIsEditModalOpen(false)
      setPrefsSuccessMsg('Profile details updated successfully!')
      setTimeout(() => setPrefsSuccessMsg(''), 4000)
    } catch (err) {
      setProfileModalError(err.message || 'Failed to update profile.')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Handle Delete Account (CRUD Delete)
  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setDeleteError('')
    try {
      await deleteUserProfile()
      setIsDeleteModalOpen(false)
      if (onLogout) {
        onLogout()
      }
      setCurrentPage('home')
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account. Please try again.')
      setIsDeleting(false)
    }
  }

  const displayName = name ? name.split(' ')[0] : 'Foodie'
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'Z'

  return (
    <main className="flex-1 w-full bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Eyebrow & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
              YOUR CORNER
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-neutral-900 font-normal">
              Your profile, {displayName}.
            </h1>
          </div>

          <button
            onClick={openEditModal}
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-sm font-medium px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start cursor-pointer"
          >
            <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit profile</span>
          </button>
        </div>

        {/* Global Feedback Banner */}
        {prefsSuccessMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200/90 text-sm text-emerald-800 flex items-center gap-3 shadow-xs">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{prefsSuccessMsg}</span>
          </div>
        )}

        {/* User Identity Header Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Circular Avatar */}
            <div className="w-16 h-16 rounded-full bg-[#85312C] text-white flex items-center justify-center text-xl font-semibold shrink-0 shadow-xs">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900 leading-tight">
                  {name}
                </h2>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-[#FAF1E8] text-[#85312C] px-2.5 py-0.5 rounded-full">
                  Member
                </span>
              </div>
              <p className="text-sm text-neutral-600 mt-1 flex items-center gap-2">
                <span>{currentUser.email}</span>
                {phone && (
                  <>
                    <span className="text-neutral-300">•</span>
                    <span>{phone}</span>
                  </>
                )}
              </p>
              {bio ? (
                <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-xl italic">
                  "{bio}"
                </p>
              ) : (
                <p className="text-xs text-neutral-400 mt-1">
                  No bio added yet. Click &ldquo;Edit profile&rdquo; to add a tagline.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-neutral-100">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Saved spots</p>
              <p className="text-2xl font-serif text-[#85312C]">{savedCount}</p>
            </div>
          </div>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mt-10">
          {/* LEFT COLUMN: Your Preferences (CRUD Read & Update) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-6">
              <svg className="w-5 h-5 text-[#85312C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M3 12h18M3 18h18" />
                <circle cx="8" cy="6" r="2" fill="#85312C" />
                <circle cx="16" cy="12" r="2" fill="#85312C" />
                <circle cx="10" cy="18" r="2" fill="#85312C" />
              </svg>
              <h3 className="font-serif text-2xl font-normal text-neutral-900">
                Dining preferences
              </h3>
            </div>

            {prefsErrorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {prefsErrorMsg}
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-5">
              {/* Row: Favorite Cuisine & Typical Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                    Favorite cuisine
                  </label>
                  <div className="relative">
                    <select
                      value={favoriteCuisine}
                      onChange={(e) => setFavoriteCuisine(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] appearance-none cursor-pointer transition-all pr-8"
                    >
                      <option value="Italian">Italian</option>
                      <option value="North Indian">North Indian</option>
                      <option value="Café · Breakfast">Café · Breakfast</option>
                      <option value="Street Food">Street Food</option>
                      <option value="South Indian">South Indian</option>
                      <option value="Continental">Continental</option>
                      <option value="Asian · Pan-Asian">Asian · Pan-Asian</option>
                      <option value="Mughlai">Mughlai</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                    Typical budget for two
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sm text-neutral-600 font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={typicalBudget}
                      onChange={(e) => setTypicalBudget(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] transition-all"
                      placeholder="1500"
                    />
                  </div>
                </div>
              </div>

              {/* Dietary Preference */}
              <div>
                <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                  Dietary preference
                </label>
                <div className="relative">
                  <select
                    value={dietaryPref}
                    onChange={(e) => setDietaryPref(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] appearance-none cursor-pointer transition-all pr-8"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="No restrictions">No restrictions</option>
                    <option value="Pure Veg">Pure Veg</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Jain Friendly">Jain Friendly</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-xs text-neutral-400 font-normal">
                  Saved permanently to your Zaika account.
                </p>

                <button
                  type="submit"
                  disabled={isSavingPrefs}
                  className="bg-[#85312C] hover:bg-[#702622] disabled:opacity-70 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSavingPrefs ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save preferences</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Saved Navigation, Security, & Danger Zone */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Quick Shortcuts
              </h4>

              {/* Saved restaurants */}
              <button
                onClick={() => setCurrentPage('favorites')}
                className="w-full flex items-center justify-between py-3 border-b border-neutral-100 hover:text-[#85312C] transition-colors group cursor-pointer text-left bg-transparent border-t-0 border-x-0"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#85312C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  <span className="text-sm font-medium text-neutral-800 group-hover:text-[#85312C] transition-colors">
                    Saved favorites
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 group-hover:text-[#85312C] transition-colors">
                  <span>{savedCount} places</span>
                  <span className="text-sm leading-none">→</span>
                </div>
              </button>

              {/* Compare shortcut */}
              <button
                onClick={() => setCurrentPage('compare')}
                className="w-full flex items-center justify-between py-3 border-b border-neutral-100 hover:text-[#85312C] transition-colors group cursor-pointer text-left bg-transparent border-t-0 border-x-0"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-neutral-700 group-hover:text-[#85312C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
                    <circle cx="8" cy="6" r="2" fill="currentColor" />
                    <circle cx="16" cy="12" r="2" fill="currentColor" />
                    <circle cx="10" cy="18" r="2" fill="currentColor" />
                  </svg>
                  <span className="text-sm font-medium text-neutral-800 group-hover:text-[#85312C] transition-colors">
                    Compare menus
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-500 group-hover:text-[#85312C] transition-colors">
                  <span className="text-sm leading-none">→</span>
                </div>
              </button>

              {/* Discover shortcut */}
              <button
                onClick={() => setCurrentPage('discover')}
                className="w-full flex items-center justify-between py-3 hover:text-[#85312C] transition-colors group cursor-pointer text-left bg-transparent border-0"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-neutral-700 group-hover:text-[#85312C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
                  </svg>
                  <span className="text-sm font-medium text-neutral-800 group-hover:text-[#85312C] transition-colors">
                    Discover new restaurants
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-500 group-hover:text-[#85312C] transition-colors">
                  <span className="text-sm leading-none">→</span>
                </div>
              </button>
            </div>

            {/* Account Management & Danger Zone */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Account & Security
              </h4>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2.5 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Log out</span>
              </button>

              {/* Delete Account (CRUD Delete) */}
              <div className="pt-2 border-t border-neutral-100">
                <button
                  onClick={() => {
                    setDeleteError('')
                    setIsDeleteModalOpen(true)
                  }}
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50/70 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete my Zaika account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Edit Profile (CRUD Update) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div>
                <h3 className="font-serif text-2xl font-normal text-neutral-900">Edit Profile</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Update your personal dining identity</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {profileModalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {profileModalError}
              </div>
            )}

            <form onSubmit={handleSaveProfileDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C]"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">Email address</label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-neutral-400 mt-1">Email cannot be changed directly.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C]"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">Bio / Dining Tagline (Optional)</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows="2"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] resize-none"
                  placeholder="e.g. Italian pasta lover, always looking for rooftop cafes"
                />
              </div>

              {/* Password Change Toggle */}
              <div className="pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordFields((prev) => !prev)}
                  className="text-xs font-semibold text-[#85312C] hover:underline cursor-pointer flex items-center gap-1.5"
                >
                  <span>{showPasswordFields ? '− Cancel password change' : '+ Change password'}</span>
                </button>

                {showPasswordFields && (
                  <div className="space-y-3 mt-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#85312C]"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1">New Password (Min 6 chars)</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#85312C]"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#85312C]"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-[#85312C] hover:bg-[#702622] disabled:opacity-70 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Account Confirmation (CRUD Delete) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="font-serif text-2xl font-normal text-neutral-900 leading-snug">
              Delete your account?
            </h3>
            <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete your Zaika profile? This will erase all your dining preferences, saved favorites, and review history. This action cannot be reversed.
            </p>

            {deleteError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, delete account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
