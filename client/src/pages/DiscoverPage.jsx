import { useState, useMemo, useEffect } from 'react'
import heroBg from '../assets/hero_bg.jpg'
import LocationPickerModal from '../components/LocationPickerModal'
import RestaurantDetailsModal from '../components/RestaurantDetailsModal'

// Helper function to calculate real geographical distance in km (Haversine formula)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}


export default function DiscoverPage({
  setCurrentPage: _setCurrentPage,
  initialQuery = '',
  onAddRecentSearch,
  favorites: externalFavorites,
  onToggleFavorite: externalOnToggleFavorite,
  selectedForCompare: externalSelectedForCompare,
  onToggleCompare: externalOnToggleCompare
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('zaika_selected_location')
      return saved
        ? JSON.parse(saved)
        : {
            name: 'Bengaluru',
            formattedAddress: 'Bengaluru, Karnataka, India',
            city: 'Bengaluru',
            lat: 12.9716,
            lon: 77.5946,
            isCurrentLocation: false,
          }
    } catch {
      return {
        name: 'Bengaluru',
        formattedAddress: 'Bengaluru, Karnataka, India',
        city: 'Bengaluru',
        lat: 12.9716,
        lon: 77.5946,
        isCurrentLocation: false,
      }
    }
  })
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [cuisineFilter, setCuisineFilter] = useState('All cuisines')
  const [budgetFilter, setBudgetFilter] = useState('Any budget')
  const [minRatingFilter, setMinRatingFilter] = useState(false)
  const [vegOnlyFilter, setVegOnlyFilter] = useState(false)
  const [distanceFilter, setDistanceFilter] = useState('Any distance')

  // Selected for comparison mapping
  const [internalSelectedForCompare, setInternalSelectedForCompare] = useState({})
  const selectedForCompare = externalSelectedForCompare !== undefined ? externalSelectedForCompare : internalSelectedForCompare

  // Favorites mapping
  const [internalFavorites, setInternalFavorites] = useState({})
  const favorites = externalFavorites !== undefined ? externalFavorites : internalFavorites

  const [selectedRestaurantDetails, setSelectedRestaurantDetails] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true)
  const [dataSource, setDataSource] = useState('loading') // 'google' | 'loading'
  const [apiNotice, setApiNotice] = useState('')

  // Fetch nearby restaurants from backend (Google Places API Nearby Search)
  useEffect(() => {
    let isMounted = true
    async function fetchNearby() {
      if (!selectedLocation?.lat || !selectedLocation?.lon) return
      setIsLoadingRestaurants(true)
      try {
        const queryParams = new URLSearchParams({
          lat: selectedLocation.lat.toString(),
          lng: selectedLocation.lon.toString(),
          radius: '5000',
          city: selectedLocation.city || 'Bengaluru',
        })
        if (cuisineFilter && cuisineFilter !== 'All cuisines') {
          queryParams.set('cuisine', cuisineFilter)
        }

        const res = await fetch(`http://localhost:5000/api/restaurants/nearby?${queryParams.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch nearby restaurants')
        const json = await res.json()

        if (isMounted) {
          if (json.message) {
            setApiNotice(json.message)
          } else {
            setApiNotice('')
          }

          if (json.success && Array.isArray(json.data)) {
            if (json.data.length > 0) {
              const processed = json.data.map((item) => {
                const rawPhotos = item.photos || (item.image ? [item.image] : [])
                const processedPhotos = rawPhotos.map((p) =>
                  p.startsWith('/api') ? `http://localhost:5000${p}` : p
                )
                return {
                  ...item,
                  image: item.image?.startsWith('/api')
                    ? `http://localhost:5000${item.image}`
                    : (item.image || heroBg),
                  photos: processedPhotos.length > 0 ? processedPhotos : [heroBg],
                }
              })
              setRestaurants(processed)
            } else {
              setRestaurants([])
            }
            setDataSource(json.source || 'google')
          }
        }
      } catch (err) {
        console.warn('[DiscoverPage] Live places fetch error:', err)
        if (isMounted) setRestaurants([])
      } finally {
        if (isMounted) {
          setIsLoadingRestaurants(false)
        }
      }
    }

    fetchNearby()
    return () => {
      isMounted = false
    }
  }, [selectedLocation.lat, selectedLocation.lon, selectedLocation.city, cuisineFilter])

  // Filter computation with real GPS coordinates & proximity calculation
  const filteredPlaces = useMemo(() => {
    return restaurants.map((item) => {
      // Calculate real distance from currently selected location coordinates
      const distKm = calculateHaversineDistance(
        selectedLocation.lat,
        selectedLocation.lon,
        item.lat,
        item.lon
      )

      let displayDistance = `${distKm.toFixed(1)} km away`
      if (distKm < 1.0) {
        displayDistance = `${Math.round(distKm * 1000)} m away`
      }

      return {
        ...item,
        distanceKm: distKm,
        displayDistance,
      }
    })
    .filter((item) => {
      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesCuisine = item.cuisine?.toLowerCase().includes(q)
        const matchesDesc = item.description?.toLowerCase().includes(q)
        const matchesLocality = item.locality?.toLowerCase().includes(q)
        const matchesCity = item.city?.toLowerCase().includes(q)
        const matchesCategory = item.category?.toLowerCase().includes(q)
        if (!matchesName && !matchesCuisine && !matchesDesc && !matchesLocality && !matchesCity && !matchesCategory) {
          return false
        }
      }

      // Cuisine filter
      if (cuisineFilter !== 'All cuisines') {
        const cf = cuisineFilter.toLowerCase()
        const matchesCuisineType = item.cuisineType?.toLowerCase().includes(cf)
        const matchesCuisine = item.cuisine?.toLowerCase().includes(cf)
        const matchesCategory = item.category?.toLowerCase().includes(cf)
        if (!matchesCuisineType && !matchesCuisine && !matchesCategory) {
          return false
        }
      }

      // Budget filter
      if (budgetFilter === 'Under ₹500') {
        if (item.budgetCategory !== 'budget') return false
      } else if (budgetFilter === '₹500 - ₹1500') {
        if (item.budgetCategory !== 'mid') return false
      } else if (budgetFilter === '₹1500+') {
        if (item.budgetCategory !== 'fine' && item.budgetCategory !== 'fine_dining') return false
      }

      // Rating filter (4.7+)
      if (minRatingFilter) {
        if (item.rating < 4.7) return false
      }

      // Vegetarian filter
      if (vegOnlyFilter) {
        if (!item.isVeg) return false
      }

      // Distance filter
      if (distanceFilter === '< 2 km') {
        if (item.distanceKm > 2.0) return false
      } else if (distanceFilter === '< 3 km') {
        if (item.distanceKm > 3.0) return false
      } else if (distanceFilter === '< 5 km') {
        if (item.distanceKm > 5.0) return false
      }

      return true
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [
    searchQuery,
    cuisineFilter,
    budgetFilter,
    minRatingFilter,
    vegOnlyFilter,
    distanceFilter,
    selectedLocation,
    restaurants
  ])

  const toggleSelected = (id) => {
    if (externalOnToggleCompare) {
      externalOnToggleCompare(id)
    } else {
      setInternalSelectedForCompare((prev) => ({ ...prev, [id]: !prev[id] }))
    }
  }

  const toggleFavorite = (id) => {
    if (externalOnToggleFavorite) {
      externalOnToggleFavorite(id)
    } else {
      setInternalFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim() && onAddRecentSearch) {
      onAddRecentSearch(searchQuery.trim())
    }
  }

  return (
    <main className="flex-1 w-full bg-[#FAF8F5] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-6">
        {/* 1. Header Section */}
        <div className="mb-6">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
            EXPLORE THE GOOD STUFF
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-neutral-900 font-normal leading-tight">
            Discover places you'll love.
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base mt-1.5">
            Find your kind of place, then see what's on the menu.
          </p>
        </div>

        {/* 2. Top Search & Location Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-2">
          {/* Search Input */}
          <div className="flex-1 relative flex items-center bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 shadow-2xs focus-within:border-[#85312C] focus-within:ring-1 focus-within:ring-[#85312C] transition-all">
            <svg className="w-5 h-5 text-neutral-400 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try: Italian dinner for 2 under ₹1500"
              className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
            />
          </div>

          {/* Google Maps Location Selector Button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 hover:border-[#85312C] rounded-lg px-3.5 py-2.5 text-sm text-neutral-800 shadow-2xs cursor-pointer transition-all group"
              title="Click to detect current location or search location on map"
            >
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#85312C] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedLocation.isCurrentLocation && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  )}
                </div>

                <span className="font-semibold text-neutral-900 group-hover:text-[#85312C] transition-colors truncate max-w-[140px] sm:max-w-[200px]">
                  {selectedLocation.name}
                </span>
              </div>

              <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-[#85312C] hover:bg-[#702622] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Active Location Indicator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 pt-0.5 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Curating spots near:</span>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#FAF1E8] hover:bg-[#F4E4D3] text-[#85312C] font-semibold px-2.5 py-1 rounded-full border border-[#85312C]/20 transition-colors cursor-pointer group"
            >
              <span>📍 {selectedLocation.name}</span>
              <span className="text-[11px] text-neutral-500 font-normal">({selectedLocation.city})</span>
              <span className="text-[10px] text-[#85312C] font-bold group-hover:underline">Change ↗</span>
            </button>
          </div>

          {selectedLocation.isCurrentLocation && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live GPS Located</span>
            </span>
          )}
        </div>

        {/* 3. Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5 pb-6 pt-1 text-xs">
          {/* Filter icon */}
          <div className="text-[#85312C] mr-1 p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M3 12h18M3 18h18" />
              <circle cx="8" cy="6" r="2" fill="#85312C" />
              <circle cx="16" cy="12" r="2" fill="#85312C" />
              <circle cx="10" cy="18" r="2" fill="#85312C" />
            </svg>
          </div>

          {/* Cuisine Dropdown */}
          <div className="relative">
            <select
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
              className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-800 font-medium outline-none cursor-pointer pr-6 appearance-none hover:border-neutral-400 transition-colors shadow-2xs"
            >
              <option value="All cuisines">All cuisines</option>
              <option value="Italian">Italian</option>
              <option value="Indian">Indian</option>
              <option value="Café">Café</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-2.5 text-neutral-400 text-[10px]">▼</span>
          </div>

          {/* Budget Dropdown */}
          <div className="relative">
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-800 font-medium outline-none cursor-pointer pr-6 appearance-none hover:border-neutral-400 transition-colors shadow-2xs"
            >
              <option value="Any budget">Any budget</option>
              <option value="Under ₹500">Under ₹500</option>
              <option value="₹500 - ₹1500">₹500 - ₹1500</option>
              <option value="₹1500+">₹1500+</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-2.5 text-neutral-400 text-[10px]">▼</span>
          </div>

          {/* 4.7+ rated Pill Toggle */}
          <button
            type="button"
            onClick={() => setMinRatingFilter(!minRatingFilter)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
              minRatingFilter
                ? 'bg-[#EFE9C9] border-[#DFD8B0] text-neutral-900 font-semibold shadow-2xs'
                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            4.7+ rated
          </button>

          {/* Vegetarian Pill Toggle */}
          <button
            type="button"
            onClick={() => setVegOnlyFilter(!vegOnlyFilter)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
              vegOnlyFilter
                ? 'bg-[#EFE9C9] border-[#DFD8B0] text-neutral-900 font-semibold shadow-2xs'
                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Vegetarian
          </button>

          {/* Distance Dropdown */}
          <div className="relative">
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-800 font-medium outline-none cursor-pointer pr-6 appearance-none hover:border-neutral-400 transition-colors shadow-2xs"
            >
              <option value="Any distance">Any distance</option>
              <option value="< 2 km">&lt; 2 km</option>
              <option value="< 3 km">&lt; 3 km</option>
              <option value="< 5 km">&lt; 5 km</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-2.5 text-neutral-400 text-[10px]">▼</span>
          </div>

          {/* Count Indicator & Google Places Live Badge on far right */}
          <div className="ml-auto flex items-center gap-2 text-xs text-neutral-500 font-normal self-center">
            {isLoadingRestaurants ? (
              <span className="flex items-center gap-1.5 text-xs text-[#85312C] font-medium bg-[#FAF1E8] px-2.5 py-1 rounded-full animate-pulse">
                <svg className="animate-spin w-3 h-3 text-[#85312C]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Fetching live places...
              </span>
            ) : dataSource === 'google' ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Google Places
              </span>
            ) : null}
            <span>{filteredPlaces.length} places</span>
          </div>
        </div>

        {/* 4. Restaurant Cards Grid */}
        {isLoadingRestaurants ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden p-4 space-y-3 animate-pulse">
                <div className="aspect-[4/3] bg-neutral-200 rounded-xl w-full"></div>
                <div className="h-5 bg-neutral-200 rounded-md w-2/3"></div>
                <div className="h-4 bg-neutral-100 rounded-md w-1/2"></div>
                <div className="h-10 bg-neutral-100 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-10 sm:p-14 text-center my-6">
            <div className="w-14 h-14 rounded-full bg-[#FAF1E8] text-[#85312C] flex items-center justify-center mx-auto mb-4 text-2xl shadow-2xs">
              {apiNotice ? '🔑' : '🔍'}
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900 mb-2">
              {apiNotice ? 'Google API Key Needed' : 'No matching places found'}
            </h3>
            <div className="text-xs sm:text-sm text-neutral-500 mb-5 max-w-lg mx-auto leading-relaxed">
              {apiNotice ? (
                <div>
                  All hardcoded mock data has been removed. To see live restaurants and cafes, please paste your Google Maps API key into{' '}
                  <code className="bg-neutral-100 text-[#85312C] px-1.5 py-0.5 rounded font-mono text-xs">server/.env</code> on line 20:
                  <div className="mt-2.5 font-mono text-xs bg-neutral-100 p-2.5 rounded-xl text-neutral-800 border border-neutral-200">
                    GOOGLE_MAPS_API_KEY=AIzaSy...
                  </div>
                </div>
              ) : (
                <p>No places matched your active filters. If &quot;4.7+ rated&quot; or cuisine filter is active, try resetting them below.</p>
              )}
            </div>
            <button
              onClick={() => {
                setSearchQuery('')
                setCuisineFilter('All cuisines')
                setBudgetFilter('Any budget')
                setMinRatingFilter(false)
                setVegOnlyFilter(false)
                setDistanceFilter('Any distance')
              }}
              className="bg-[#85312C] hover:bg-[#702622] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((restaurant) => {
              const isFav = favorites[restaurant.id]
              const isSelected = selectedForCompare[restaurant.id]

              return (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container with Badges */}
                  <div
                    onClick={() => setSelectedRestaurantDetails(restaurant)}
                    className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 cursor-pointer"
                  >
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />

                    {/* Category Pill Badge (Café vs Restaurant) */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-lg shadow-xs text-[#85312C] border border-neutral-100 flex items-center gap-1">
                      <span>{restaurant.category === 'Café' ? '☕' : '🍽️'}</span>
                      <span>{restaurant.category || 'Restaurant'}</span>
                    </div>

                    {/* Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(restaurant.id)
                      }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-neutral-700 hover:text-rose-600 hover:bg-white shadow-xs transition-all cursor-pointer z-10"
                      aria-label="Save to favorites"
                    >
                      <svg
                        className={`w-5 h-5 transition-colors ${
                          isFav ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current'
                        }`}
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    </button>

                    {/* Offer Badge & Photos Count Badge */}
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
                      <div className="bg-[#FAF1E8] text-[#85312C] text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs border border-[#F3E2D4]">
                        {restaurant.offer}
                      </div>

                      {restaurant.photos && restaurant.photos.length > 1 && (
                        <div className="bg-black/65 text-white text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                          <span>📸</span>
                          <span>{restaurant.photos.length} pics</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name & Rating + Google Reviews Count */}
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          onClick={() => setSelectedRestaurantDetails(restaurant)}
                          className="font-serif text-xl font-normal text-neutral-900 group-hover:text-[#85312C] transition-colors cursor-pointer truncate"
                        >
                          {restaurant.name}
                        </h3>
                        <button
                          onClick={() => setSelectedRestaurantDetails(restaurant)}
                          title="View Google Reviews"
                          className="flex items-center gap-1 text-sm font-semibold text-neutral-800 hover:text-[#85312C] transition-colors cursor-pointer shrink-0"
                        >
                          <span className="text-amber-500">★</span>
                          <span>{restaurant.rating}</span>
                          <span className="text-[11px] text-neutral-400 font-normal">
                            ({restaurant.userRatingsTotal || 120})
                          </span>
                        </button>
                      </div>

                      {/* Cuisine */}
                      <p className="text-xs text-neutral-500 mt-1 font-normal">
                        {restaurant.cuisine}
                      </p>

                      {/* Description */}
                      <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                        {restaurant.description}
                      </p>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="mt-5 pt-3 border-t border-neutral-100">
                      {/* Details row: Price & Distance */}
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3.5 font-normal">
                        <span>{restaurant.price}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-[#85312C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium text-neutral-700">
                            {restaurant.displayDistance || restaurant.distance}
                          </span>
                        </span>
                        {restaurant.locality && (
                          <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                            {restaurant.locality}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons: Reviews & Pics & Selected / Compare */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRestaurantDetails(restaurant)}
                          className="flex-1 border border-neutral-200 bg-white hover:bg-[#FAF1E8]/40 hover:border-[#85312C]/30 text-neutral-800 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer group/btn"
                        >
                          <span className="text-amber-500 text-xs">★</span>
                          <span>Reviews & Pics</span>
                          <span className="text-xs group-hover/btn:translate-x-0.5 transition-transform text-[#85312C]">→</span>
                        </button>

                        <button
                          onClick={() => toggleSelected(restaurant.id)}
                          className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#F6EEBE] hover:bg-[#ECE3AD] text-neutral-900'
                              : 'bg-[#85312C] hover:bg-[#702622] text-white shadow-xs'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <span>✓</span>
                              <span>Selected</span>
                            </>
                          ) : (
                            <>
                              <span>+</span>
                              <span>Compare</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Restaurant Details, Google Reviews & Photo Gallery Modal */}
      <RestaurantDetailsModal
        isOpen={Boolean(selectedRestaurantDetails)}
        onClose={() => setSelectedRestaurantDetails(null)}
        restaurant={selectedRestaurantDetails}
      />

      {/* Google Map-like Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={selectedLocation}
        onSelectLocation={(newLoc) => {
          setSelectedLocation(newLoc)
          try {
            localStorage.setItem('zaika_selected_location', JSON.stringify(newLoc))
          } catch (e) {
            console.warn(e)
          }
        }}
      />
    </main>
  )
}

