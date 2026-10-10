import { useState, useMemo } from 'react'
import saffronTableImg from '../assets/saffron_table.jpg'
import oliveHouseImg from '../assets/olive_house.jpg'
import goldenHourImg from '../assets/golden_hour.jpg'
import heroBg from '../assets/hero_bg.jpg'
import LocationPickerModal from '../components/LocationPickerModal'

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

// 10 Restaurant Records matching reference screenshots 1, 2, and 3 with real GPS coordinates
const ALL_RESTAURANTS = [
  {
    id: 1,
    name: 'Saffron Table',
    rating: 4.8,
    cuisine: 'Indian · North Indian',
    cuisineType: 'Indian',
    description: 'Familiar Indian flavors, thoughtfully reimagined for the modern table.',
    offer: 'Up to ₹100 off',
    price: '₹₹',
    budgetCategory: 'mid',
    city: 'Bengaluru',
    locality: 'Indiranagar',
    lat: 12.9784,
    lon: 77.6408,
    distanceKm: 1.2,
    image: saffronTableImg,
    isVeg: true,
    menu: [
      { name: 'Saffron Paneer Tikka', price: '₹260', desc: 'Charred cottage cheese, saffron marinade, bell peppers' },
      { name: 'Dal Makhani Slow Simmered', price: '₹210', desc: 'Overnight cooked black lentils with white butter' },
      { name: 'Butter Garlic Naan (2 pcs)', price: '₹90', desc: 'Fresh tandoor-baked flatbread' },
      { name: 'Dum Biryani Royale', price: '₹290', desc: 'Long grain fragrant rice with seasonal vegetables' }
    ]
  },
  {
    id: 2,
    name: 'Olive House',
    rating: 4.7,
    cuisine: 'Italian · Pizzeria',
    cuisineType: 'Italian',
    description: 'A little corner of Italy with handmade pastas and really good pizza.',
    offer: 'Up to ₹50 off',
    price: '₹₹',
    budgetCategory: 'mid',
    city: 'Bengaluru',
    locality: 'Koramangala',
    lat: 12.9352,
    lon: 77.6245,
    distanceKm: 1.8,
    image: oliveHouseImg,
    isVeg: false,
    menu: [
      { name: 'Classic Margherita Pizza', price: '₹340', desc: 'San Marzano tomatoes, fresh mozzarella, basil' },
      { name: 'Handmade Fettuccine Alfredo', price: '₹310', desc: 'Creamy parmesan emulsion with cracked black pepper' },
      { name: 'Herbed Garlic Bread', price: '₹140', desc: 'Toasted sourdough with roasted garlic butter' },
      { name: 'Tiramisu Tradizionale', price: '₹190', desc: 'Espresso-soaked savoiardi, mascarpone cream' }
    ]
  },
  {
    id: 3,
    name: 'The Golden Hour',
    rating: 4.9,
    cuisine: 'Café · Breakfast',
    cuisineType: 'Café',
    description: 'Slow mornings, good coffee, and something lovely on your plate.',
    offer: 'Up to ₹75 off',
    price: '₹₹',
    budgetCategory: 'budget',
    city: 'Bengaluru',
    locality: 'Central Bengaluru',
    lat: 12.9716,
    lon: 77.5946,
    distanceKm: 0.8,
    image: goldenHourImg,
    isVeg: true,
    menu: [
      { name: 'Artisan Avocado Sourdough', price: '₹240', desc: 'Hass avocado mash, microgreens, soft boiled egg, seeds' },
      { name: 'Butter Croissant', price: '₹120', desc: 'Flaky golden laminated pastry with French butter' },
      { name: 'Specialty Rosetta Cappuccino', price: '₹160', desc: 'Double shot espresso with silky steamed whole milk' },
      { name: 'Granola & Berry Parfait', price: '₹180', desc: 'Greek yogurt, wild blossom honey, toasted almonds' }
    ]
  },
  {
    id: 4,
    name: 'Pasta Room',
    rating: 4.6,
    cuisine: 'Italian · Pasta',
    cuisineType: 'Italian',
    description: 'Fresh pasta made daily, served the way it should be.',
    offer: 'Up to ₹80 off',
    price: '₹₹',
    budgetCategory: 'mid',
    city: 'Bengaluru',
    locality: 'HSR Layout',
    lat: 12.9121,
    lon: 77.6446,
    distanceKm: 2.4,
    image: heroBg,
    isVeg: false,
    menu: [
      { name: 'Tagliatelle al Tartufo', price: '₹380', desc: 'Fresh pasta ribbons with black truffle cream and parmesan' },
      { name: 'Rigatoni all’Arrabbiata', price: '₹280', desc: 'Spicy San Marzano tomato sauce, roasted garlic, fresh basil' },
      { name: 'Crisp Rosemary Focaccia', price: '₹130', desc: 'Olive oil brushed hearth bread with sea salt' }
    ]
  },
  {
    id: 5,
    name: 'Little Fern Café',
    rating: 4.8,
    cuisine: 'Café · Vegetarian',
    cuisineType: 'Café',
    description: 'A leafy neighborhood café for coffee, conversation, and comfort.',
    offer: 'Up to ₹40 off',
    price: '₹₹',
    budgetCategory: 'budget',
    city: 'Bengaluru',
    locality: 'Whitefield',
    lat: 12.9698,
    lon: 77.7500,
    distanceKm: 2.1,
    image: goldenHourImg,
    isVeg: true,
    menu: [
      { name: 'Wild Mushroom Tartine', price: '₹260', desc: 'Sautéed forest mushrooms, thyme cream on sourdough' },
      { name: 'Spanish Latte with Oat Milk', price: '₹170', desc: 'Espresso with textured condensed milk' },
      { name: 'Matcha Ricotta Hotcakes', price: '₹240', desc: 'Fluffy Japanese style hotcakes with maple syrup' }
    ]
  },
  {
    id: 6,
    name: 'Masala Social',
    rating: 4.5,
    cuisine: 'Indian · Contemporary',
    cuisineType: 'Indian',
    description: 'Big-hearted plates made for sharing with your favorite people.',
    offer: 'Up to ₹120 off',
    price: '₹₹',
    budgetCategory: 'mid',
    city: 'Mumbai',
    locality: 'Bandra West',
    lat: 19.0596,
    lon: 72.8295,
    distanceKm: 3.2,
    image: saffronTableImg,
    isVeg: false,
    menu: [
      { name: 'Amritsari Paneer Tikka', price: '₹270', desc: 'Carom seed and mustard oil spiced cottage cheese' },
      { name: 'Railway Mutton Curry', price: '₹390', desc: 'Heritage colonial slow cooked spiced lamb curry' },
      { name: 'Lachedar Paratha', price: '₹75', desc: 'Crispy layered whole wheat bread with ghee' }
    ]
  },
  {
    id: 7,
    name: 'Basil & Brick',
    rating: 4.7,
    cuisine: 'Italian · Wood-fired',
    cuisineType: 'Italian',
    description: 'Wood-fired classics and a dining room worth lingering in.',
    offer: 'Up to ₹150 off',
    price: '₹₹₹',
    budgetCategory: 'fine',
    city: 'Mumbai',
    locality: 'Juhu',
    lat: 19.1075,
    lon: 72.8263,
    distanceKm: 3.6,
    image: oliveHouseImg,
    isVeg: false,
    menu: [
      { name: 'Quattro Formaggi Pizza', price: '₹460', desc: 'Gorgonzola, fontina, mozzarella, parmesan, rosemary honey' },
      { name: 'Burrata Pugliese', price: '₹390', desc: 'Whole artisan burrata with heirloom tomato carpaccio' },
      { name: 'Cannoli Siciliani', price: '₹220', desc: 'Crispy pastry shells stuffed with sweet ricotta cream' }
    ]
  },
  {
    id: 8,
    name: 'The Breakfast Club',
    rating: 4.6,
    cuisine: 'Café · Brunch',
    cuisineType: 'Café',
    description: 'All-day breakfasts, bright interiors, and your usual coffee order.',
    offer: 'Up to ₹60 off',
    price: '₹₹',
    budgetCategory: 'budget',
    city: 'Delhi NCR',
    locality: 'Connaught Place',
    lat: 28.6315,
    lon: 77.2167,
    distanceKm: 1.5,
    image: goldenHourImg,
    isVeg: true,
    menu: [
      { name: 'Classic Eggs Benedict', price: '₹270', desc: 'Poached eggs, hollandaise, toasted brioche' },
      { name: 'Cinnamon French Toast', price: '₹230', desc: 'Brioche bread soaked in vanilla custard with berry compote' },
      { name: 'Flat White Single Origin', price: '₹160', desc: 'Velvety microfoam over double espresso' }
    ]
  },
  {
    id: 9,
    name: 'Tamarind Kitchen',
    rating: 4.8,
    cuisine: 'Indian · Regional',
    cuisineType: 'Indian',
    description: 'Regional recipes with fresh ingredients and a generous spirit.',
    offer: 'Up to ₹90 off',
    price: '₹₹',
    budgetCategory: 'mid',
    city: 'Hyderabad',
    locality: 'Jubilee Hills',
    lat: 17.4319,
    lon: 78.4073,
    distanceKm: 4.1,
    image: saffronTableImg,
    isVeg: false,
    menu: [
      { name: 'Ghee Roast Paneer', price: '₹280', desc: 'Mangalorean byadagi chili and clarified butter sauté' },
      { name: 'Malabar Parotta with Kurma', price: '₹210', desc: 'Flaky spiral bread with coconut vegetable stew' },
      { name: 'Elaneer Payasam', price: '₹160', desc: 'Tender coconut pudding with cardamom milk' }
    ]
  },
  {
    id: 10,
    name: 'Trattoria Rustica',
    rating: 4.7,
    cuisine: 'Italian · Tuscan',
    cuisineType: 'Italian',
    description: 'Warm Tuscan recipes, handmade focaccia, and comforting pastas.',
    offer: 'Up to ₹70 off',
    price: '₹₹',
    budgetCategory: 'mid',
    city: 'Kolkata',
    locality: 'Park Street',
    lat: 22.5510,
    lon: 88.3524,
    distanceKm: 2.8,
    image: heroBg,
    isVeg: false,
    menu: [
      { name: 'Pappardelle al Cinghiale', price: '₹420', desc: 'Wide hand-cut noodles with slow simmered herb ragù' },
      { name: 'Wood-Fired Calzone Rustico', price: '₹360', desc: 'Folded pizza stuffed with ricotta, salami, mozzarella' },
      { name: 'Panna Cotta ai Frutti di Bosco', price: '₹190', desc: 'Chilled cooked cream with wild berry glaze' }
    ]
  }
]

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
  const [minRatingFilter, setMinRatingFilter] = useState(true) // 4.7+ active by default in reference
  const [vegOnlyFilter, setVegOnlyFilter] = useState(false)
  const [distanceFilter, setDistanceFilter] = useState('Any distance')

  // Selected for comparison mapping
  const [internalSelectedForCompare, setInternalSelectedForCompare] = useState({
    1: true,
    2: true,
    3: true,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false
  })
  const selectedForCompare = externalSelectedForCompare !== undefined ? externalSelectedForCompare : internalSelectedForCompare

  // Favorites mapping
  const [internalFavorites, setInternalFavorites] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false
  })
  const favorites = externalFavorites !== undefined ? externalFavorites : internalFavorites

  const [activeMenuModal, setActiveMenuModal] = useState(null)

  // Filter computation with real GPS coordinates & proximity calculation
  const filteredPlaces = useMemo(() => {
    return ALL_RESTAURANTS.map((item) => {
      // Calculate real distance from currently selected location coordinates
      let distKm = calculateHaversineDistance(
        selectedLocation.lat,
        selectedLocation.lon,
        item.lat,
        item.lon
      )

      // If restaurant is in a different city, scale distance for display
      const isSameCity = item.city.toLowerCase() === selectedLocation.city.toLowerCase()
      if (!isSameCity) {
        distKm = Math.max(distKm, 12.0)
      }

      let displayDistance = `${distKm.toFixed(1)} km away`
      if (distKm < 1.0) {
        displayDistance = `${Math.round(distKm * 1000)} m away`
      }

      return {
        ...item,
        distanceKm: distKm,
        displayDistance,
        isSameCity,
      }
    })
    .filter((item) => {
      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesCuisine = item.cuisine.toLowerCase().includes(q)
        const matchesDesc = item.description.toLowerCase().includes(q)
        const matchesLocality = item.locality?.toLowerCase().includes(q)
        const matchesCity = item.city?.toLowerCase().includes(q)
        if (!matchesName && !matchesCuisine && !matchesDesc && !matchesLocality && !matchesCity) {
          return false
        }
      }

      // Cuisine filter
      if (cuisineFilter !== 'All cuisines') {
        if (!item.cuisineType.toLowerCase().includes(cuisineFilter.toLowerCase())) {
          return false
        }
      }

      // Budget filter
      if (budgetFilter === 'Under ₹500') {
        if (item.budgetCategory !== 'budget') return false
      } else if (budgetFilter === '₹500 - ₹1500') {
        if (item.budgetCategory !== 'mid') return false
      } else if (budgetFilter === '₹1500+') {
        if (item.budgetCategory !== 'fine') return false
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
    .sort((a, b) => {
      // Prioritize places in the same city, then sort by physical distance
      if (a.isSameCity && !b.isSameCity) return -1
      if (!a.isSameCity && b.isSameCity) return 1
      return a.distanceKm - b.distanceKm
    })
  }, [
    searchQuery,
    cuisineFilter,
    budgetFilter,
    minRatingFilter,
    vegOnlyFilter,
    distanceFilter,
    selectedLocation
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

          {/* Count Indicator on far right */}
          <div className="ml-auto text-xs text-neutral-500 font-normal self-center">
            {filteredPlaces.length} places
          </div>
        </div>

        {/* 4. Restaurant Cards Grid */}
        {filteredPlaces.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center my-6">
            <div className="w-12 h-12 rounded-full bg-[#FAF1E8] text-[#85312C] flex items-center justify-center mx-auto mb-3 text-xl">
              🔍
            </div>
            <h3 className="font-serif text-2xl font-normal text-neutral-900 mb-1">
              No matching places found
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Try adjusting your rating or cuisine filter to see more delicious options.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setCuisineFilter('All cuisines')
                setBudgetFilter('Any budget')
                setMinRatingFilter(false)
                setVegOnlyFilter(false)
                setDistanceFilter('Any distance')
              }}
              className="text-xs font-semibold text-[#85312C] hover:underline cursor-pointer"
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
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />

                    {/* Heart Button */}
                    <button
                      onClick={() => toggleFavorite(restaurant.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-neutral-700 hover:text-rose-600 hover:bg-white shadow-xs transition-all cursor-pointer"
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

                    {/* Offer Badge */}
                    <div className="absolute bottom-3 left-3 bg-[#FAF1E8] text-[#85312C] text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs border border-[#F3E2D4]">
                      {restaurant.offer}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name & Rating */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif text-xl font-normal text-neutral-900 group-hover:text-[#85312C] transition-colors">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm font-semibold text-neutral-800">
                          <span className="text-amber-500">★</span>
                          <span>{restaurant.rating}</span>
                        </div>
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

                      {/* Action Buttons: View Menu & Selected / Compare */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveMenuModal(restaurant)}
                          className="flex-1 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>View menu</span>
                          <span className="text-sm">→</span>
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

      {/* Menu Viewer Modal */}
      {activeMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-neutral-100">
            <button
              onClick={() => setActiveMenuModal(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={activeMenuModal.image}
                alt={activeMenuModal.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-serif text-2xl font-normal text-neutral-900">
                  {activeMenuModal.name}
                </h3>
                <p className="text-xs text-neutral-500">
                  {activeMenuModal.cuisine} · {activeMenuModal.distance}
                </p>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-[#85312C] mb-3">
              Highlighted Menu
            </h4>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activeMenuModal.menu.map((dish, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div>
                    <h5 className="text-sm font-semibold text-neutral-900">{dish.name}</h5>
                    <p className="text-xs text-neutral-500 mt-0.5">{dish.desc}</p>
                  </div>
                  <span className="font-serif font-semibold text-neutral-900 text-sm ml-3">
                    {dish.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Offer: <strong className="text-[#85312C] font-semibold">{activeMenuModal.offer}</strong>
              </span>
              <button
                onClick={() => setActiveMenuModal(null)}
                className="bg-[#85312C] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#702622] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

