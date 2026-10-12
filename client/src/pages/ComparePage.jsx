import { useState, useMemo, useEffect } from 'react'
import { fetchLiveRestaurants, ensureRestaurantMenu, fetchAiComparison } from '../services/restaurantService'
import MenuModal from '../components/MenuModal'

export default function ComparePage({
  setCurrentPage,
  selectedForCompare = {},
  onToggleCompare,
  onClearCompare,
  customRestaurants = {},
  favorites = {},
  onToggleFavorite,
  discoveredRestaurants = [],
  onUpdateDiscoveredRestaurants
}) {
  // Step in the compare wizard: 1 = Your plans, 2 = Pick places (redirects to Discover), 3 = Compare menus
  const [currentStep, setCurrentStep] = useState(1)

  // If user is on Step 2 (Pick places), redirect directly to Discover page
  useEffect(() => {
    if (currentStep === 2) {
      if (setCurrentPage) {
        setCurrentPage('discover')
      }
    }
  }, [currentStep, setCurrentPage])

  // Step 1: User plan inputs
  const [budget, setBudget] = useState(1500)
  const [people, setPeople] = useState(2)
  const [cuisine, setCuisine] = useState('Any cuisine')
  const [dietary, setDietary] = useState('Vegetarian')
  const [drinksInput, setDrinksInput] = useState('')
  const [craving, setCraving] = useState('')
  const [anythingElse, setAnythingElse] = useState('Something filling, not too expensive.')
  const [viewingMenuRestaurant, setViewingMenuRestaurant] = useState(null)

  // Live restaurants from Discover page / Google Places API
  const [apiRestaurants, setApiRestaurants] = useState(() => {
    if (Array.isArray(discoveredRestaurants) && discoveredRestaurants.length > 0) {
      return discoveredRestaurants
    }
    try {
      const saved = localStorage.getItem('zaika_discovered_restaurants')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(() => {
    const hasProps = Array.isArray(discoveredRestaurants) && discoveredRestaurants.length > 0
    let hasLocal = false
    try {
      const saved = localStorage.getItem('zaika_discovered_restaurants')
      if (saved && JSON.parse(saved).length > 0) hasLocal = true
    } catch {
      hasLocal = false
    }
    return !hasProps && !hasLocal
  })

  useEffect(() => {
    if (Array.isArray(discoveredRestaurants) && discoveredRestaurants.length > 0) {
      setApiRestaurants(discoveredRestaurants)
      setIsLoadingPlaces(false)
      return
    }

    let isMounted = true
    async function loadPlaces() {
      // Get location from localStorage (same as DiscoverPage)
      let targetLoc = { lat: 12.9716, lng: 77.5946, city: 'Bengaluru' }
      try {
        const savedLoc = localStorage.getItem('zaika_selected_location')
        if (savedLoc) {
          const parsed = JSON.parse(savedLoc)
          targetLoc = {
            lat: parsed.lat || 12.9716,
            lng: parsed.lon || parsed.lng || 77.5946,
            city: parsed.city || 'Bengaluru'
          }
        }
      } catch (e) {
        console.warn(e)
      }

      setIsLoadingPlaces(true)
      try {
        const places = await fetchLiveRestaurants({
          lat: targetLoc.lat,
          lng: targetLoc.lng,
          radius: 5000,
          city: targetLoc.city
        })
        if (isMounted) {
          setApiRestaurants(places)
          if (onUpdateDiscoveredRestaurants) {
            onUpdateDiscoveredRestaurants(places)
          }
        }
      } catch (e) {
        console.warn('Error loading live places for ComparePage:', e)
      } finally {
        if (isMounted) {
          setIsLoadingPlaces(false)
        }
      }
    }

    loadPlaces()
    return () => {
      isMounted = false
    }
  }, [discoveredRestaurants, onUpdateDiscoveredRestaurants])

  // Combine live API restaurants with any customRestaurants selected by user
  const allAvailableRestaurants = useMemo(() => {
    const map = new Map()
    const pool = (Array.isArray(discoveredRestaurants) && discoveredRestaurants.length > 0)
      ? discoveredRestaurants
      : apiRestaurants

    pool.forEach((r) => {
      if (r && r.id) {
        map.set(String(r.id), ensureRestaurantMenu(r))
      }
    })

    if (customRestaurants && typeof customRestaurants === 'object') {
      Object.values(customRestaurants).forEach((cr) => {
        if (cr && cr.id) {
          map.set(String(cr.id), ensureRestaurantMenu(cr))
        }
      })
    }
    return Array.from(map.values())
  }, [discoveredRestaurants, apiRestaurants, customRestaurants])

  // Get active IDs chosen by user from app-level selectedForCompare
  const activeSelectedIds = useMemo(() => {
    return Object.keys(selectedForCompare)
      .filter((id) => selectedForCompare[id])
      .map((id) => (isNaN(Number(id)) ? id : Number(id)))
  }, [selectedForCompare])

  // Synchronized selected IDs state
  const [selectedIds, setSelectedIds] = useState(activeSelectedIds)

  useEffect(() => {
    setSelectedIds(activeSelectedIds)
  }, [activeSelectedIds])

  // Exact list of restaurants chosen by user
  const chosenRestaurants = useMemo(() => {
    return allAvailableRestaurants.filter((r) =>
      selectedIds.some((id) => String(id) === String(r.id))
    )
  }, [allAvailableRestaurants, selectedIds])

  // Active full menu modal
  const [activeMenuModal, setActiveMenuModal] = useState(null)

  // Dish customization without cascading effects:
  // Set of unselected dishes: { [`${restaurantId}_${dishName}`]: true }
  const [unselectedDishes, setUnselectedDishes] = useState({})
  // Extra dishes added from modal: { [restaurantId]: [dish, ...] }
  const [extraDishes, setExtraDishes] = useState({})
  // Custom dish quantities: { [`${restaurantId}_${dishName}`]: number }
  const [dishQuantities, setDishQuantities] = useState({})

  // Category filter in Step 2
  const [placeFilter, setPlaceFilter] = useState('All')

  // Drink suggestions chips
  const popularDrinks = [
    'Craft Cocktails',
    'Wine & Sangria',
    'Craft Beer',
    'Artisanal Coffee',
    'Mocktails & Coolers',
    'Mango Lassi',
    'Cold Brew',
    'Fresh Juices'
  ]

  // Cravings suggestions chips
  const popularCravings = [
    'Handmade Pasta',
    'Dal Makhani',
    'Wood-fired Pizza',
    'Tiramisu',
    'Sourdough & Coffee',
    'Saffron Paneer Tikka',
    'Dum Biryani',
    'Butter Garlic Naan'
  ]

  // Helper to toggle a chip item inside a comma-separated string
  const toggleChipInInput = (currentVal, item, setter) => {
    if (currentVal.includes(item)) {
      const updated = currentVal
        .replace(item, '')
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*|,\s*$/g, '')
        .trim()
      setter(updated)
    } else {
      setter(currentVal && currentVal.trim() ? `${currentVal.trim()}, ${item}` : item)
    }
  }

  // Toggle restaurant selection
  const toggleRestaurant = (id, restaurantObj = null) => {
    const isCurrentlySelected = selectedIds.some((item) => String(item) === String(id))

    if (isCurrentlySelected) {
      setSelectedIds((prev) => prev.filter((item) => String(item) !== String(id)))
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare up to 4 restaurants side-by-side.')
        return
      }
      setSelectedIds((prev) => [...prev, id])
    }
    if (onToggleCompare) {
      const obj = restaurantObj || allAvailableRestaurants.find((r) => String(r.id) === String(id))
      onToggleCompare(id, obj)
    }
  }

  // Clear all selected restaurants
  const handleClearAll = () => {
    setSelectedIds([])
    if (onClearCompare) {
      onClearCompare()
    }
  }

  // Quick 1-click popular comparison pairing
  const handleQuickPair = (id1, id2) => {
    const r1 = allAvailableRestaurants.find((r) => String(r.id) === String(id1))
    const r2 = allAvailableRestaurants.find((r) => String(r.id) === String(id2))
    setSelectedIds([id1, id2])
    if (onClearCompare) {
      onClearCompare()
    }
    if (onToggleCompare) {
      setTimeout(() => {
        onToggleCompare(id1, r1)
        onToggleCompare(id2, r2)
      }, 10)
    }
  }

  // AI Matching & Compatibility Scoring for each restaurant
  const scoredRestaurants = useMemo(() => {
    return allAvailableRestaurants.map((restaurant) => {
      let score = 75 // Base score

      // Cuisine match
      if (cuisine !== 'Any cuisine') {
        if (
          restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase()) ||
          restaurant.cuisineType.toLowerCase() === cuisine.toLowerCase()
        ) {
          score += 15
        } else {
          score -= 10
        }
      } else {
        score += 5
      }

      // Dietary match
      if (dietary === 'Vegetarian' && restaurant.isVeg) {
        score += 12
      } else if (dietary === 'Non-Vegetarian' && !restaurant.isVeg) {
        score += 8
      } else if (dietary === 'Vegan' && restaurant.isVeg) {
        score += 10
      }

      // Drink type match based on user's drinks input
      if (drinksInput && drinksInput.trim()) {
        const dQuery = drinksInput.toLowerCase().trim()
        const drinkWords = dQuery.split(/[,\s]+/).filter((w) => w.length > 2)
        const matchesDrink = restaurant.menu.some(
          (m) =>
            m.category === 'drink' &&
            drinkWords.some(
              (w) => m.name.toLowerCase().includes(w) || m.desc.toLowerCase().includes(w)
            )
        )
        if (matchesDrink) {
          score += 14
        }
      }

      // Food Craving match
      if (craving && craving.trim()) {
        const query = craving.toLowerCase().trim()
        const words = query.split(/[,\s]+/).filter((w) => w.length > 2)
        const matchesMenu = restaurant.menu.some(
          (m) =>
            words.some(
              (w) => m.name.toLowerCase().includes(w) || m.desc.toLowerCase().includes(w)
            )
        )
        if (matchesMenu) {
          score += 14
        }
      }

      // Normalize score between 74 and 99
      const finalScore = Math.min(99, Math.max(74, score))

      return {
        ...restaurant,
        aiScore: finalScore
      }
    })
  }, [allAvailableRestaurants, cuisine, dietary, drinksInput, craving])

  // Restaurants selected for side-by-side comparison
  const compareList = useMemo(() => {
    return scoredRestaurants.filter((r) =>
      selectedIds.some((id) => String(id) === String(r.id))
    )
  }, [scoredRestaurants, selectedIds])

  // AI-Curated Meal Plan for each selected restaurant based on budget and preferences
  const curatedPlans = useMemo(() => {
    const plans = {}

    compareList.forEach((restaurant) => {
      const menu = restaurant.menu || []
      const starters = menu.filter((m) => m.category === 'starter')
      const mains = menu.filter((m) => m.category === 'main')
      const drinks = menu.filter((m) => m.category === 'drink')
      const desserts = menu.filter((m) => m.category === 'dessert' || m.category === 'bread')

      // Select 1 starter
      const selectedStarter = starters[0] || menu[0]

      // Select mains based on people count (1 to 2 mains)
      const numMains = Math.max(1, Math.min(people, 2))
      const selectedMains = mains.slice(0, numMains)

      // Select drink: match user's drinks input keywords if possible
      let selectedDrink = drinks[0]
      if (drinksInput && drinksInput.trim()) {
        const dQuery = drinksInput.toLowerCase()
        const matched = drinks.find((d) =>
          dQuery
            .split(/[,\s]+/)
            .some(
              (w) =>
                w.length > 2 &&
                (d.name.toLowerCase().includes(w) || d.desc.toLowerCase().includes(w))
            )
        )
        if (matched) selectedDrink = matched
      }

      // Select dessert or bread
      const selectedDessert = desserts[0]

      const defaultDishes = [selectedStarter, ...selectedMains, selectedDrink, selectedDessert].filter(Boolean)

      // Deduplicate by dish name
      const uniqueDishes = []
      const seen = new Set()
      defaultDishes.forEach((d) => {
        if (!seen.has(d.name)) {
          seen.add(d.name)
          uniqueDishes.push(d)
        }
      })

      plans[restaurant.id] = uniqueDishes
    })

    return plans
  }, [compareList, people, drinksInput])

  // Helper to extract numeric price from dish
  const getDishPriceNum = (dish) => {
    if (!dish) return 0
    if (typeof dish.priceNum === 'number') return dish.priceNum
    if (typeof dish.price === 'number') return dish.price
    const parsed = Number(String(dish.price || '').replace(/[^0-9.]/g, ''))
    return isNaN(parsed) ? 0 : parsed
  }

  // Helper to get quantity of a dish
  const getDishQty = (restaurantId, dishName) => {
    const key = `${restaurantId}_${dishName}`
    if (unselectedDishes[key]) return 0
    return dishQuantities[key] !== undefined ? dishQuantities[key] : 1
  }

  // Toggle an individual dish inside the curated order for a restaurant
  const handleToggleDish = (restaurantId, dishName) => {
    const key = `${restaurantId}_${dishName}`
    const willBeUnselected = !unselectedDishes[key]
    setUnselectedDishes((prev) => ({
      ...prev,
      [key]: willBeUnselected
    }))
    if (!willBeUnselected && (dishQuantities[key] === undefined || dishQuantities[key] <= 0)) {
      setDishQuantities((prev) => ({
        ...prev,
        [key]: 1
      }))
    }
  }

  // Update quantity of a dish
  const handleQuantityChange = (restaurantId, dishName, newQty) => {
    const key = `${restaurantId}_${dishName}`
    const parsed = Math.max(0, Math.min(50, Number(newQty) || 0))

    if (parsed <= 0) {
      setUnselectedDishes((prev) => ({ ...prev, [key]: true }))
      setDishQuantities((prev) => ({ ...prev, [key]: 0 }))
    } else {
      setUnselectedDishes((prev) => {
        const copy = { ...prev }
        delete copy[key]
        return copy
      })
      setDishQuantities((prev) => ({ ...prev, [key]: parsed }))
    }
  }

  // Add an extra dish from menu to custom order
  const handleAddDish = (restaurantId, dish) => {
    const key = `${restaurantId}_${dish.name}`
    setUnselectedDishes((prev) => {
      const copy = { ...prev }
      delete copy[key]
      return copy
    })
    setDishQuantities((prev) => ({
      ...prev,
      [key]: prev[key] && prev[key] > 0 ? prev[key] : 1
    }))
    setExtraDishes((prev) => {
      const existing = prev[restaurantId] || []
      if (existing.some((d) => d.name === dish.name)) return prev
      return { ...prev, [restaurantId]: [...existing, dish] }
    })
  }

  // Calculate real bill for a restaurant based on active dishes and quantities
  const calculateBill = (restaurant) => {
    const baseCurated = curatedPlans[restaurant.id] || []
    const extras = extraDishes[restaurant.id] || []
    const allDishes = [...baseCurated, ...extras]

    // Active dishes (not in unselectedDishes and qty > 0)
    const activeDishes = allDishes.filter((d) => !unselectedDishes[`${restaurant.id}_${d.name}`])

    const subtotal = activeDishes.reduce((sum, d) => {
      const qty = getDishQty(restaurant.id, d.name)
      const unitPrice = getDishPriceNum(d)
      return sum + unitPrice * qty
    }, 0)

    const discount = subtotal > 0 ? (restaurant.offerAmount || 50) : 0
    const taxableAmount = Math.max(0, subtotal - discount)
    const gstAndCharges = Math.round(taxableAmount * 0.05) // 5% GST
    const total = taxableAmount + gstAndCharges
    const budgetDiff = budget - total

    return {
      activeDishes,
      subtotal,
      discount,
      gstAndCharges,
      total,
      budgetDiff
    }
  }

  // Live OpenAI comparison state
  const [liveAiComparison, setLiveAiComparison] = useState(null)
  const [isLoadingAiComparison, setIsLoadingAiComparison] = useState(false)

  // Fetch AI comparison from backend (powered by OpenAI gpt-4o-mini)
  useEffect(() => {
    if (compareList.length < 2) {
      setLiveAiComparison(null)
      return
    }

    let isMounted = true
    setIsLoadingAiComparison(true)

    const timer = setTimeout(async () => {
      try {
        const payload = {
          restaurants: compareList.map((r) => ({
            id: r.id,
            name: r.name,
            cuisine: r.cuisine || r.cuisineType || '',
            rating: r.rating || 4.2,
            offer: r.offer || '',
            signatureDish: r.signatureDish || ''
          })),
          budget,
          people,
          cuisine,
          dietary,
          drinksInput,
          craving
        }
        const data = await fetchAiComparison(payload)
        if (isMounted && data) {
          setLiveAiComparison(data)
        }
      } catch (err) {
        console.warn('AI comparison fetch error:', err)
      } finally {
        if (isMounted) {
          setIsLoadingAiComparison(false)
        }
      }
    }, 350)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [compareList.length, selectedIds.join(','), budget, people, cuisine, dietary, drinksInput, craving])

  // AI Comparing Animation States
  const [isAiComparingAnimation, setIsAiComparingAnimation] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [analysisMessageIndex, setAnalysisMessageIndex] = useState(0)
  const [hasRunInitialAiAnimation, setHasRunInitialAiAnimation] = useState(false)

  const aiAnalysisSteps = useMemo(() => [
    'Analyzing categorized menus & signature dishes...',
    `Evaluating flavor profiles against ${cuisine} & ${dietary} preferences...`,
    craving ? `Cross-referencing dishes for craving: "${craving}"...` : `Simulating meal combinations for ${people} people within ₹${budget}...`,
    'Calculating taste compatibility scores & real tax-inclusive bills...',
    'Synthesizing head-to-head comparison matrix & recommendations...'
  ], [cuisine, dietary, craving, people, budget])

  const triggerAiComparisonAnimation = () => {
    setIsAiComparingAnimation(true)
    setAiProgress(15)
    setAnalysisMessageIndex(0)
    setCurrentStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle animation timer and message steps
  useEffect(() => {
    if (!isAiComparingAnimation) return

    let current = 15
    const progressTimer = setInterval(() => {
      // Smooth progress over ~4.8 seconds
      current += Math.random() * 1.1 + 0.9
      if (current >= 96) current = 96
      setAiProgress(current)
    }, 60)

    const messageTimer = setInterval(() => {
      setAnalysisMessageIndex((prev) => (prev + 1) % aiAnalysisSteps.length)
    }, 950)

    const finishTimer = setTimeout(() => {
      setAiProgress(100)
      setTimeout(() => {
        setIsAiComparingAnimation(false)
      }, 400)
    }, 4800)

    return () => {
      clearInterval(progressTimer)
      clearInterval(messageTimer)
      clearTimeout(finishTimer)
    }
  }, [isAiComparingAnimation, aiAnalysisSteps.length])

  // Automatically trigger animation on first entry into Step 3 if 2+ places selected
  useEffect(() => {
    if (currentStep === 3 && compareList.length >= 2 && !hasRunInitialAiAnimation) {
      setHasRunInitialAiAnimation(true)
      setIsAiComparingAnimation(true)
      setAiProgress(15)
      setAnalysisMessageIndex(0)
    }
  }, [currentStep, compareList.length, hasRunInitialAiAnimation])

  // Find the AI Winner among the selected restaurants (prioritizing live OpenAI result if available)
  const aiWinner = useMemo(() => {
    if (compareList.length === 0) return null
    if (liveAiComparison?.winnerId) {
      const liveWin = compareList.find(
        (r) => String(r.id) === String(liveAiComparison.winnerId) || (r.name && liveAiComparison.winnerName && r.name.toLowerCase() === liveAiComparison.winnerName.toLowerCase())
      )
      if (liveWin) {
        return {
          ...liveWin,
          aiScore: liveAiComparison.matchScore || liveWin.aiScore
        }
      }
    }
    let best = compareList[0]
    compareList.forEach((r) => {
      if (r.aiScore > best.aiScore) {
        best = r
      }
    })
    return best
  }, [compareList, liveAiComparison])

  return (
    <div className="flex-1 w-full bg-[#FAF8F5]">
      {/* 1. TOP BANNER HEADER (Matches user reference screenshot) */}
      <section className="w-full bg-[#FAF5EA] border-b border-[#F0E6D2] pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Subtitle kicker */}
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1.5">
            THE SMARTER WAY TO EAT OUT
          </span>

          {/* Large Title */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] text-neutral-900 font-normal leading-tight">
            Compare before you order.
          </h1>

          {/* Subtitle */}
          <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-2xl font-normal">
            Pick your restaurants, choose what you want, and let Zaika work out the real bill.
          </p>

          {/* STEP PROGRESS INDICATOR (Matches user screenshot) */}
          <div className="flex items-center gap-4 sm:gap-6 mt-8 text-xs sm:text-sm">
            {/* Step 1 */}
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2.5 transition-colors cursor-pointer group"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  currentStep === 1
                    ? 'bg-[#85312C] text-white shadow-xs'
                    : currentStep > 1
                    ? 'bg-neutral-800 text-white'
                    : 'border border-neutral-300 text-neutral-500 bg-white'
                }`}
              >
                1
              </span>
              <span
                className={`font-semibold ${
                  currentStep === 1 ? 'text-[#85312C]' : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                Your plans
              </span>
            </button>

            <span className="text-neutral-400 font-light">&gt;</span>

            {/* Step 2 (Pick places in Discover) */}
            <button
              onClick={() => setCurrentPage && setCurrentPage('discover')}
              className="flex items-center gap-2.5 transition-colors cursor-pointer group"
              title="Pick places on Discover page"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  selectedIds.length >= 2
                    ? 'bg-neutral-800 text-white'
                    : 'border border-neutral-300 text-neutral-500 bg-white'
                }`}
              >
                2
              </span>
              <span className="font-semibold text-neutral-700 group-hover:text-neutral-900 flex items-center gap-1">
                <span>Pick places</span>
                <span className="text-[11px] text-[#85312C] font-normal">(Discover ↗)</span>
              </span>
              {selectedIds.length > 0 && (
                <span className="bg-[#FAF1E8] text-[#85312C] text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#F3E2D4]">
                  {selectedIds.length}
                </span>
              )}
            </button>

            <span className="text-neutral-400 font-light">&gt;</span>

            {/* Step 3 */}
            <button
              onClick={() => {
                if (selectedIds.length >= 2) {
                  setCurrentStep(3)
                } else {
                  alert('Please select at least 2 restaurants in Step 2 to compare menus.')
                }
              }}
              className="flex items-center gap-2.5 transition-colors cursor-pointer group"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  currentStep === 3
                    ? 'bg-[#85312C] text-white shadow-xs'
                    : 'border border-neutral-300 text-neutral-500 bg-white'
                }`}
              >
                3
              </span>
              <span
                className={`font-semibold flex items-center gap-1.5 ${
                  currentStep === 3 ? 'text-[#85312C]' : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                <span>Compare menus</span>
                <span className="text-[11px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full font-medium">
                  AI ✨
                </span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. BODY CONTENT */}
      <main className="w-full py-10 min-h-[500px]">
        <div className="max-w-7xl mx-auto px-6">
        {/* ============================================================ */}
        {/* STEP 1: YOUR PLANS (Matches user screenshot 1 & 2 + AI Inputs) */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in">
            {/* Section Header */}
            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
                01 / YOUR PLANS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal leading-tight">
                What are we working with?
              </h2>
              <p className="text-neutral-500 text-sm sm:text-base mt-1.5">
                Set your budget and dining preferences first, then let Zaika AI analyze and compare your chosen places.
              </p>
            </div>

            {/* If user already picked restaurants from Discover */}
            {chosenRestaurants.length > 0 && (
              <div className="bg-[#FAF1E8] border border-[#F0DFD0] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E8D4C0] text-[#85312C] font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-2xs">
                    {chosenRestaurants.length}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-[#85312C] block">
                      Places Selected From Discover
                    </span>
                    <h3 className="font-serif text-base sm:text-lg text-neutral-900 font-medium line-clamp-1">
                      {chosenRestaurants.map((r) => r.name).join(' vs ')}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Confirm your budget and preferences below, then continue to the AI side-by-side comparison.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrentPage && setCurrentPage('discover')}
                    className="border border-neutral-300 hover:bg-white bg-white/70 text-neutral-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Change in Discover ↗
                  </button>
                  {chosenRestaurants.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerAiComparisonAnimation()
                      }}
                      className="bg-[#85312C] hover:bg-[#702622] text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      Skip to Compare →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Form Card (Matches white card in user screenshot) */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs">
              <div className="space-y-6">
                {/* Row 1: Budget & People */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Your Budget */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-900 mb-2">
                      Your budget
                    </label>
                    <div className="relative rounded-lg border border-neutral-300 focus-within:border-[#85312C] focus-within:ring-1 focus-within:ring-[#85312C] bg-white transition-all overflow-hidden flex items-center">
                      <span className="pl-3.5 pr-1 text-neutral-500 font-medium text-base select-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="300"
                        step="100"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value) || 0)}
                        placeholder="1500"
                        className="w-full py-2.5 pr-3 text-neutral-900 font-medium text-sm sm:text-base focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Budget Pills */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {[800, 1500, 2500, 4000].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBudget(b)}
                          className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                            budget === b
                              ? 'bg-[#85312C] text-white border-[#85312C]'
                              : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          ₹{b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* People */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-900 mb-2">
                      People
                    </label>
                    <div className="flex items-center rounded-lg border border-neutral-300 focus-within:border-[#85312C] bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setPeople((p) => Math.max(1, p - 1))}
                        className="px-3.5 py-2.5 text-neutral-600 hover:bg-neutral-100 text-base font-bold transition-colors cursor-pointer"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={people}
                        onChange={(e) => setPeople(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full py-2.5 text-center text-neutral-900 font-medium text-sm sm:text-base focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setPeople((p) => p + 1)}
                        className="px-3.5 py-2.5 text-neutral-600 hover:bg-neutral-100 text-base font-bold transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[11px] text-neutral-500 mt-1 block">
                      Estimated ~₹{people > 0 ? Math.round(budget / people) : 0} per person
                    </span>
                  </div>
                </div>

                {/* Row 2: Cuisine & Dietary Preference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Cuisine */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-900 mb-2">
                      Cuisine
                    </label>
                    <select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-lg border border-neutral-300 focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] bg-white text-neutral-900 text-sm font-normal focus:outline-hidden cursor-pointer"
                    >
                      <option value="Any cuisine">Any cuisine</option>
                      <option value="Indian">Indian & Regional</option>
                      <option value="Italian">Italian & Pizzeria</option>
                      <option value="Café">Café, Breakfast & Bakery</option>
                    </select>
                  </div>

                  {/* Dietary Preference */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-900 mb-2">
                      Preference
                    </label>
                    <select
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-lg border border-neutral-300 focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] bg-white text-neutral-900 text-sm font-normal focus:outline-hidden cursor-pointer"
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Any dietary">Any dietary preference</option>
                    </select>
                  </div>
                </div>

                {/* Drink Types Input (Same structure as Food Input Section) */}
                <div className="pt-1 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-900">
                      Drink type & beverages (optional)
                    </label>
                    <span className="text-[10px] text-[#85312C] font-semibold uppercase tracking-wider">
                      AI Tailored
                    </span>
                  </div>
                  <input
                    type="text"
                    value={drinksInput}
                    onChange={(e) => setDrinksInput(e.target.value)}
                    placeholder="e.g. Cocktails, Wine, Craft Beer, Artisanal Coffee, Mocktails, Lassi..."
                    className="w-full py-2.5 px-3 rounded-lg border border-neutral-300 focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] bg-white text-neutral-900 text-sm font-normal focus:outline-hidden"
                  />
                  {/* Drink Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {popularDrinks.map((item) => {
                      const isActive = drinksInput.includes(item)

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleChipInInput(drinksInput, item, setDrinksInput)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#FAF1E8] text-[#85312C] border-[#85312C] font-semibold'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {isActive ? '✓ ' : '+ '}
                          {item}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Specific Foods / Cravings Input */}
                <div className="pt-1 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-900">
                      Specific foods or dishes you crave (optional)
                    </label>
                    <span className="text-[10px] text-[#85312C] font-semibold uppercase tracking-wider">
                      AI Tailored
                    </span>
                  </div>
                  <input
                    type="text"
                    value={craving}
                    onChange={(e) => setCraving(e.target.value)}
                    placeholder="e.g. Handmade Pasta, Wood-fired Pizza, Tiramisu, Dal Makhani..."
                    className="w-full py-2.5 px-3 rounded-lg border border-neutral-300 focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] bg-white text-neutral-900 text-sm font-normal focus:outline-hidden"
                  />
                  {/* Craving Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {popularCravings.map((item) => {
                      const isActive = craving.includes(item)

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleChipInInput(craving, item, setCraving)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#FAF1E8] text-[#85312C] border-[#85312C] font-semibold'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {isActive ? '✓ ' : '+ '}
                          {item}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Anything Else */}
                <div className="pt-1 border-t border-neutral-100">
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-900 mb-2">
                    Anything else?
                  </label>
                  <textarea
                    rows="3"
                    value={anythingElse}
                    onChange={(e) => setAnythingElse(e.target.value)}
                    placeholder="Something filling, not too expensive."
                    className="w-full py-2.5 px-3 rounded-lg border border-neutral-300 focus:border-[#85312C] focus:ring-1 focus:ring-[#85312C] bg-white text-neutral-900 text-sm font-normal focus:outline-hidden resize-y leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar (Matches screenshot button) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="text-[#85312C]">✨</span>
                <span>Zaika AI will curate your side-by-side dishes within your ₹{budget} budget.</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage && setCurrentPage('discover')}
                  className="border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{chosenRestaurants.length > 0 ? 'Edit Places in Discover' : '+ Add Places from Discover'}</span>
                  <span>↗</span>
                </button>

                {chosenRestaurants.length < 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      // Pick top 2 matches if none selected
                      if (selectedIds.length < 2) {
                        const top2 = scoredRestaurants.slice(0, 2).map((r) => r.id)
                        setSelectedIds(top2)
                      }
                      triggerAiComparisonAnimation()
                    }}
                    className="border border-[#85312C] text-[#85312C] hover:bg-[#FAF1E8] text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Quick AI Compare</span>
                    <span className="text-xs">⚡</span>
                  </button>
                )}

                {chosenRestaurants.length >= 2 ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerAiComparisonAnimation()
                    }}
                    className="bg-[#85312C] hover:bg-[#702622] text-white text-sm font-semibold py-2.5 px-6 rounded-lg shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <span>Proceed to AI Compare ({chosenRestaurants.length} places)</span>
                    <span className="text-base leading-none transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (setCurrentPage) setCurrentPage('discover')
                    }}
                    className="bg-[#85312C] hover:bg-[#702622] text-white text-sm font-semibold py-2.5 px-6 rounded-lg shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <span>Pick places in Discover ({chosenRestaurants.length}/2)</span>
                    <span className="text-base leading-none transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: REDIRECT TO DISCOVER PAGE */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-10 sm:p-14 text-center my-6 space-y-4 max-w-lg mx-auto shadow-xs animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-[#FAF1E8] text-[#85312C] flex items-center justify-center mx-auto text-2xl animate-pulse shadow-xs">
              📍
            </div>
            <h2 className="font-serif text-3xl text-neutral-900 font-normal">
              Redirecting to Discover...
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Explore and choose your favorite cafes and restaurants directly on the Discover page.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentPage && setCurrentPage('discover')}
                className="bg-[#85312C] hover:bg-[#702622] text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Go to Discover Page</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}


        {/* ============================================================ */}
        {/* STEP 3: COMPARE MENUS & AI BREAKDOWN */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
                  03 / COMPARE MENUS & AI BREAKDOWN
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal leading-tight">
                  Side-by-side comparison of your chosen places
                </h2>
                <p className="text-neutral-500 text-sm sm:text-base mt-1.5">
                  Comparing: <strong className="text-neutral-800 font-semibold">{chosenRestaurants.map((c) => c.name).join(' vs ')}</strong> for {people} {people === 1 ? 'person' : 'people'} within your ₹{budget} budget.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={triggerAiComparisonAnimation}
                  className="bg-[#85312C] hover:bg-[#702622] text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  title="Re-run AI Analysis Animation"
                >
                  <span>⚡ Re-Analyze with AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage && setCurrentPage('discover')}
                  className="border border-neutral-300 hover:bg-neutral-100 bg-white text-neutral-800 text-xs font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  Edit places in Discover ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="border border-neutral-300 hover:bg-neutral-100 bg-white text-neutral-800 text-xs font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  Edit plans (₹{budget})
                </button>
              </div>
            </div>

            {/* If fewer than 2 places selected in Step 3 */}
            {compareList.length < 2 && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 text-center my-6 space-y-4 max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#FAF1E8] text-[#85312C] flex items-center justify-center mx-auto text-3xl shadow-xs">
                  🍽️
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-normal">
                  Select at least 2 places to compare
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  To view the side-by-side menu comparison and AI bill breakdown, please select 2 or more restaurants from your Discover page.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage && setCurrentPage('discover')}
                    className="w-full sm:w-auto bg-[#85312C] hover:bg-[#702622] text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    + Browse & Add from Discover →
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Edit Plans (Step 1)
                  </button>
                </div>
              </div>
            )}

            {/* AI SCANNING & COMPARISON ANIMATION SCREEN */}
            {compareList.length >= 2 && isAiComparingAnimation ? (
              <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-8 sm:p-14 text-center my-6 space-y-8 max-w-2xl mx-auto overflow-hidden relative animate-fade-in">
                {/* Glow orbs */}
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#FAF1E8] rounded-full blur-3xl opacity-70 pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#F7EEDE] rounded-full blur-3xl opacity-70 pointer-events-none" />

                {/* Clean, Elegant Header (Removed square badge and black pill) */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF1E8] border border-[#EADBCC] text-[#85312C] text-xs font-semibold tracking-wide shadow-2xs mb-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#85312C] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#85312C]"></span>
                    </span>
                    <span>Zaika AI Comparison Engine</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-normal">
                    Comparing Taste Profiles & Real Bills...
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-md">
                    Scanning menus, calculating custom dish quantities, and scoring taste compatibility.
                  </p>
                </div>

                {/* Head-to-Head Venue Cards with Animated Scanner */}
                <div className="relative z-10 max-w-lg mx-auto">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 relative items-center">
                    {compareList.slice(0, 2).map((r, i) => (
                      <div
                        key={r.id}
                        className="bg-[#FAF8F5] rounded-2xl border border-neutral-200 p-3.5 text-left relative overflow-hidden group shadow-2xs"
                      >
                        {/* Animated Laser Scanning Shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#85312C]/15 to-transparent h-1/2 w-full animate-ai-scan pointer-events-none" />

                        <div className="flex items-center gap-2.5">
                          <img
                            src={r.image}
                            alt={r.name}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-neutral-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#85312C] block">
                              Venue #{i + 1}
                            </span>
                            <h4 className="font-serif text-xs sm:text-sm font-bold text-neutral-900 truncate">
                              {r.name}
                            </h4>
                            <span className="text-[10px] text-neutral-500 block truncate">
                              ★ {r.rating} · {r.cuisine}
                            </span>
                          </div>
                        </div>

                        {/* Micro data scan badges */}
                        <div className="mt-2.5 pt-2 border-t border-neutral-200/80 flex items-center justify-between text-[10px] text-neutral-600">
                          <span className="font-mono text-[#85312C]">Scanning items...</span>
                          <span className="font-semibold text-emerald-700">₹{budget} target</span>
                        </div>
                      </div>
                    ))}

                    {/* Central VS Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-900 text-white font-serif font-bold text-xs flex items-center justify-center border-2 border-white shadow-md z-20">
                      VS
                    </div>
                  </div>
                </div>

                {/* Live Progress Bar & Cycling Status Steps */}
                <div className="relative z-10 max-w-md mx-auto space-y-3">
                  {/* Percentage Bar */}
                  <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden border border-neutral-200/80 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#85312C] via-amber-600 to-[#85312C] rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${aiProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500 font-medium px-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#85312C] animate-ping" />
                      <span>Synthesizing culinary synergy...</span>
                    </span>
                    <span className="font-mono font-bold text-[#85312C]">{Math.round(aiProgress)}%</span>
                  </div>

                  {/* Dynamic Animated Status Message */}
                  <div className="bg-[#FAF5EA] border border-[#F0E6D2] rounded-xl py-2.5 px-4 text-xs text-neutral-700 font-medium min-h-[44px] flex items-center justify-center transition-all animate-fade-in shadow-2xs">
                    <span>{aiAnalysisSteps[analysisMessageIndex]}</span>
                  </div>
                </div>
              </div>
            ) : (
              <>

            {/* AI CONCIERGE VERDICT BANNER */}
            {compareList.length >= 2 && aiWinner && (
              <div className="bg-gradient-to-r from-[#FAF1E8] via-[#FAF5EA] to-[#F7EEDE] rounded-2xl border border-[#F0DFD0] p-6 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#85312C] uppercase flex-wrap">
                      <span className="text-amber-600 text-sm">✨</span>
                      <span>Zaika AI Taste & Bill Concierge Verdict</span>
                      {liveAiComparison ? (
                        <span className="bg-[#85312C] text-white text-[10px] px-2.5 py-0.5 rounded-full font-sans font-semibold tracking-normal">
                          OpenAI GPT-4o-mini
                        </span>
                      ) : isLoadingAiComparison ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-sans font-semibold tracking-normal animate-pulse">
                          Analyzing with AI...
                        </span>
                      ) : null}
                    </div>

                    <h3 className="font-serif text-2xl text-neutral-900 font-normal">
                      {liveAiComparison?.verdictTitle ? (
                        <>
                          {liveAiComparison.verdictTitle}:{' '}
                          <strong className="font-bold text-[#85312C] underline decoration-[#85312C]/30 decoration-2 underline-offset-4">
                            {aiWinner.name}
                          </strong>{' '}
                          ({aiWinner.aiScore}% Match)
                        </>
                      ) : (
                        <>
                          Top Match:{' '}
                          <strong className="font-bold text-[#85312C] underline decoration-[#85312C]/30 decoration-2 underline-offset-4">
                            {aiWinner.name}
                          </strong>{' '}
                          ({aiWinner.aiScore}% Match)
                        </>
                      )}
                    </h3>

                    <p className="text-neutral-700 text-sm max-w-3xl leading-relaxed">
                      {liveAiComparison?.verdictExplanation ? (
                        liveAiComparison.verdictExplanation
                      ) : (
                        <>
                          Based on your budget of <strong>₹{budget}</strong> for <strong>{people} {people === 1 ? 'person' : 'people'}</strong>, preference for <strong>{cuisine}</strong> ({dietary})
                          {drinksInput ? <>, drinks ({drinksInput})</> : null}
                          {craving ? <>, and food cravings ({craving})</> : null}:
                          <br className="hidden sm:inline" />
                          {' '}
                          <em>{aiWinner.name}</em> offers the ideal culinary synergy with signature specialty <strong>{aiWinner.signatureDish}</strong> and maximum savings after their {aiWinner.offer} discount.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <div className="bg-white/80 rounded-xl px-4 py-2.5 border border-[#E9D6C4] shadow-2xs text-xs text-neutral-800">
                      <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Menu Match</span>
                      <strong className="text-[#85312C] font-serif text-base font-bold">{aiWinner.aiScore}% Taste Fit</strong>
                    </div>
                    <div className="bg-white/80 rounded-xl px-4 py-2.5 border border-[#E9D6C4] shadow-2xs text-xs text-neutral-800">
                      <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Budget Impact</span>
                      <strong className="text-emerald-700 font-serif text-base font-bold">Within Budget</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIDE-BY-SIDE RESTAURANT COMPARISON COLUMNS */}
            <div
              className={`grid gap-6 ${
                compareList.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : compareList.length === 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {compareList.map((restaurant) => {
                const bill = calculateBill(restaurant)
                const isWinner = aiWinner?.id === restaurant.id
                const baseCurated = curatedPlans[restaurant.id] || []
                const extras = extraDishes[restaurant.id] || []
                const allDishes = [...baseCurated, ...extras]

                return (
                  <div
                    key={restaurant.id}
                    className={`bg-white rounded-2xl border shadow-xs flex flex-col overflow-hidden transition-all ${
                      isWinner ? 'border-[#85312C] ring-2 ring-[#85312C]/20 shadow-md' : 'border-neutral-200'
                    }`}
                  >
                    {/* Winner Ribbon */}
                    {isWinner && (
                      <div className="bg-[#85312C] text-white text-center py-1 text-[11px] font-bold tracking-wider uppercase">
                        ★ AI Top Recommendation
                      </div>
                    )}

                    {/* Column Header: Image & Info */}
                    <div className="relative aspect-[16/9] w-full bg-neutral-100 overflow-hidden">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-neutral-900 text-xs font-semibold px-2 py-0.5 rounded-md shadow-2xs">
                        ★ {restaurant.rating}
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-[#FAF1E8] text-[#85312C] text-[11px] font-bold px-2 py-0.5 rounded-md border border-[#F3E2D4]">
                        {restaurant.offer}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      {/* Name & Metadata */}
                      <div>
                        <div className="flex items-baseline justify-between gap-1 mb-1">
                          <h4 className="font-serif text-xl font-normal text-neutral-900 line-clamp-1">
                            {restaurant.name}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-bold text-[#85312C]">
                              {restaurant.aiScore}% Match
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleRestaurant(restaurant.id)}
                              className="w-5 h-5 rounded-full hover:bg-rose-50 text-neutral-400 hover:text-rose-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                              title={`Remove ${restaurant.name} from comparison`}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-500 mb-3">
                          {restaurant.cuisine} · {restaurant.distance}
                        </p>

                        {/* Signature Dish Pill */}
                        <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-neutral-100 text-xs text-neutral-700 mb-3 flex items-center justify-between">
                          <span className="text-neutral-500 text-[11px]">Signature Dish:</span>
                          <strong className="text-[#85312C] font-semibold">{restaurant.signatureDish}</strong>
                        </div>

                        {/* Live AI Insights if returned by OpenAI */}
                        {liveAiComparison?.restaurantInsights && (() => {
                          const insight = liveAiComparison.restaurantInsights.find(
                            (ins) => String(ins.id) === String(restaurant.id) || (ins.name && restaurant.name && ins.name.toLowerCase() === restaurant.name.toLowerCase())
                          )
                          if (!insight) return null
                          return (
                            <div className="mb-3 p-2.5 bg-[#FAF5EA] rounded-xl border border-[#F0E6D2] text-xs space-y-1">
                              <span className="text-[10px] uppercase font-bold text-[#85312C] tracking-wider block">
                                ✨ AI Highlights
                              </span>
                              {Array.isArray(insight.pros) && insight.pros.length > 0 && (
                                <ul className="text-neutral-700 text-[11px] list-disc list-inside space-y-0.5">
                                  {insight.pros.map((pro, pIdx) => (
                                    <li key={pIdx} className="leading-tight">{pro}</li>
                                  ))}
                                </ul>
                              )}
                              {insight.budgetFit && (
                                <div className="pt-1">
                                  <span className="inline-block text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {insight.budgetFit}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        })()}

                        {/* Curated Meal Plan Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                            Curated Meal Order
                          </span>
                          <span className="text-[10px] text-neutral-400">Toggle & change qty</span>
                        </div>

                        {/* List of Dishes with Checkboxes & Quantity Controls */}
                        <div className="space-y-2 text-xs">
                          {allDishes.map((dish) => {
                            const isChecked = !unselectedDishes[`${restaurant.id}_${dish.name}`]
                            const qty = getDishQty(restaurant.id, dish.name)
                            const unitPrice = getDishPriceNum(dish)
                            const lineTotal = unitPrice * (isChecked ? qty : 0)

                            return (
                              <div
                                key={dish.name}
                                className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                                  isChecked
                                    ? 'bg-[#FAF8F5] border-neutral-200 shadow-2xs'
                                    : 'bg-white border-dashed border-neutral-200 opacity-60 hover:opacity-85'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  {/* Left: Checkbox + Dish Info */}
                                  <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <input
                                      type="checkbox"
                                      id={`chk_${restaurant.id}_${dish.name}`}
                                      checked={isChecked}
                                      onChange={() => handleToggleDish(restaurant.id, dish.name)}
                                      className="mt-0.5 accent-[#85312C] rounded-sm cursor-pointer shrink-0 w-3.5 h-3.5"
                                    />
                                    <label
                                      htmlFor={`chk_${restaurant.id}_${dish.name}`}
                                      className="cursor-pointer select-none min-w-0 flex-1"
                                    >
                                      <span
                                        className={`font-medium block leading-tight text-xs sm:text-sm ${
                                          isChecked ? 'text-neutral-900' : 'text-neutral-500 line-through'
                                        }`}
                                      >
                                        {dish.name}
                                      </span>
                                      <span className="text-[10px] text-neutral-400 capitalize block mt-0.5">
                                        {dish.category} · {dish.price} each
                                      </span>
                                    </label>
                                  </div>

                                  {/* Right: Quantity Box & Price */}
                                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                    {isChecked ? (
                                      <div className="flex items-center border border-neutral-300 rounded-md bg-white overflow-hidden shadow-2xs">
                                        <button
                                          type="button"
                                          onClick={() => handleQuantityChange(restaurant.id, dish.name, qty - 1)}
                                          className="w-5 h-6 flex items-center justify-center text-neutral-600 hover:text-white hover:bg-[#85312C] text-xs font-bold transition-colors cursor-pointer select-none"
                                          title="Decrease quantity"
                                        >
                                          −
                                        </button>
                                        <input
                                          type="number"
                                          min="1"
                                          max="50"
                                          value={qty}
                                          onChange={(e) => handleQuantityChange(restaurant.id, dish.name, e.target.value)}
                                          className="w-7 h-6 text-center text-xs font-semibold text-neutral-900 bg-transparent border-x border-neutral-200 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          title="Quantity"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleQuantityChange(restaurant.id, dish.name, qty + 1)}
                                          className="w-5 h-6 flex items-center justify-center text-neutral-600 hover:text-white hover:bg-[#85312C] text-xs font-bold transition-colors cursor-pointer select-none"
                                          title="Increase quantity"
                                        >
                                          +
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-neutral-400 font-medium px-1.5 py-0.5 rounded bg-neutral-100">
                                        Off
                                      </span>
                                    )}

                                    <span
                                      className={`font-semibold font-serif text-xs sm:text-sm text-right min-w-[46px] ${
                                        isChecked ? 'text-neutral-900' : 'text-neutral-400'
                                      }`}
                                    >
                                      ₹{lineTotal}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Real Bill Breakdown Box */}
                      <div className="mt-6 pt-4 border-t border-neutral-200">
                        <div className="bg-[#FAF5EA] rounded-xl p-3.5 border border-[#F0E6D2] space-y-1.5 text-xs text-neutral-700">
                          <div className="flex justify-between">
                            <span>Dishes subtotal:</span>
                            <span className="font-medium text-neutral-900">₹{bill.subtotal}</span>
                          </div>
                          <div className="flex justify-between text-[#85312C]">
                            <span>Offer applied:</span>
                            <span className="font-medium">−₹{bill.discount}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500 text-[11px]">
                            <span>GST & taxes (5%):</span>
                            <span>+₹{bill.gstAndCharges}</span>
                          </div>
                          <div className="pt-2 border-t border-[#E8DCC4] flex justify-between items-baseline font-bold text-neutral-900">
                            <span className="font-sans text-xs">Total Real Bill:</span>
                            <span className="font-serif text-lg text-[#85312C]">₹{bill.total}</span>
                          </div>

                          {/* Budget Status Badge */}
                          <div className="pt-1">
                            {bill.budgetDiff >= 0 ? (
                              <span className="inline-block w-full text-center py-1 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                                ✓ ₹{bill.budgetDiff} under your ₹{budget} budget
                              </span>
                            ) : (
                              <span className="inline-block w-full text-center py-1 rounded-md bg-amber-100 text-amber-900 font-semibold text-[11px]">
                                ⚠ ₹{Math.abs(bill.budgetDiff)} over budget
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setActiveMenuModal(restaurant)}
                            className="w-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Full menu</span>
                            <span className="text-sm">→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Optional Add Place Card Slot in Step 3 */}
              {compareList.length < 4 && (
                <div
                  onClick={() => setCurrentPage && setCurrentPage('discover')}
                  className="rounded-2xl border-2 border-dashed border-neutral-300 hover:border-[#85312C] bg-white/70 hover:bg-white p-6 flex flex-col items-center justify-center text-center transition-all min-h-[400px] cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FAF1E8] text-[#85312C] group-hover:bg-[#85312C] group-hover:text-white transition-all flex items-center justify-center text-2xl font-light mb-3 shadow-xs">
                    +
                  </div>
                  <h4 className="font-serif text-xl font-normal text-neutral-900 group-hover:text-[#85312C] transition-colors">
                    Add another place from Discover
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
                    Compare up to 4 restaurants side-by-side. Browse places on the Discover page and add them to compare.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentPage && setCurrentPage('discover')
                    }}
                    className="mt-4 bg-[#85312C] hover:bg-[#702622] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    + Add Restaurant from Discover →
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-neutral-200/90 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentPage && setCurrentPage('discover')}
                className="text-neutral-700 hover:text-[#85312C] text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>← Change selected restaurants in Discover</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Zaika Comparison Summary:\nComparing: ${compareList.map((c) => c.name).join(' vs ')}\nBudget: ₹${budget} for ${people} people.\nAI Winner: ${aiWinner?.name} (${aiWinner?.aiScore}% Match)`
                    )
                    alert('Comparison summary copied to clipboard!')
                  }}
                  className="border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold py-2 px-3 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  📋 Copy Summary
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-[#85312C] hover:bg-[#702622] text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  New Comparison
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )}
        </div>
      </main>

      {/* FULL MENU MODAL */}
      {activeMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-neutral-100 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setActiveMenuModal(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-4 pb-3 border-b border-neutral-100">
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
                <div className="mt-1 text-xs text-[#85312C] font-semibold">
                  {activeMenuModal.offer}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#85312C]">
                Available Menu & Drinks
              </h4>
              <span className="text-[11px] text-neutral-400">Click to add to comparison</span>
            </div>

            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
              {activeMenuModal.menu.map((dish, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-neutral-300 transition-colors"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-semibold text-neutral-900">{dish.name}</h5>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-neutral-200 text-neutral-700 capitalize">
                        {dish.category}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{dish.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-serif font-semibold text-neutral-900 text-sm block">
                      {dish.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleAddDish(activeMenuModal.id, dish)
                        alert(`Added ${dish.name} to ${activeMenuModal.name} comparison order!`)
                      }}
                      className="mt-1 text-[11px] font-semibold text-[#85312C] hover:underline cursor-pointer"
                    >
                      + Add to order
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Signature: <strong className="text-[#85312C]">{activeMenuModal.signatureDish}</strong>
              </span>
              <button
                type="button"
                onClick={() => setActiveMenuModal(null)}
                className="bg-[#85312C] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#702622] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Full Digitized Menu Modal with Photos and Prices */}
      <MenuModal
        isOpen={Boolean(viewingMenuRestaurant)}
        onClose={() => setViewingMenuRestaurant(null)}
        restaurant={viewingMenuRestaurant}
      />
    </div>
  )
}
