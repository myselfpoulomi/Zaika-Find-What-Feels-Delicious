import { useState, useMemo } from 'react'
import { ALL_RESTAURANTS } from '../data/restaurants'

export default function ComparePage({
  setCurrentPage,
  selectedForCompare = {},
  onToggleCompare,
  favorites = {},
  onToggleFavorite
}) {
  // Step in the compare wizard: 1 = Your plans, 2 = Pick places, 3 = Compare menus
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: User plan inputs
  const [budget, setBudget] = useState(1500)
  const [people, setPeople] = useState(2)
  const [cuisine, setCuisine] = useState('Any cuisine')
  const [dietary, setDietary] = useState('Vegetarian')
  const [drinksInput, setDrinksInput] = useState('')
  const [craving, setCraving] = useState('')
  const [anythingElse, setAnythingElse] = useState('Something filling, not too expensive.')

  // Local selection of restaurant IDs for comparison (seeded from app-level selectedForCompare)
  const [selectedIds, setSelectedIds] = useState(() => {
    const ids = Object.keys(selectedForCompare)
      .filter((id) => selectedForCompare[id])
      .map(Number)
    return ids.length >= 2 ? ids.slice(0, 4) : [1, 2]
  })

  // Active full menu modal
  const [activeMenuModal, setActiveMenuModal] = useState(null)

  // Dish customization without cascading effects:
  // Set of unselected dishes: { [`${restaurantId}_${dishName}`]: true }
  const [unselectedDishes, setUnselectedDishes] = useState({})
  // Extra dishes added from modal: { [restaurantId]: [dish, ...] }
  const [extraDishes, setExtraDishes] = useState({})

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

  // Toggle restaurant selection in Step 2
  const toggleRestaurant = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id))
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare up to 4 restaurants side-by-side.')
        return
      }
      setSelectedIds((prev) => [...prev, id])
    }
    if (onToggleCompare) {
      onToggleCompare(id)
    }
  }

  // AI Matching & Compatibility Scoring for each restaurant (focusing on budget, cuisine, dietary, drinks, and food cravings)
  const scoredRestaurants = useMemo(() => {
    return ALL_RESTAURANTS.map((restaurant) => {
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
  }, [cuisine, dietary, drinksInput, craving])

  // Restaurants selected for side-by-side comparison
  const compareList = useMemo(() => {
    return scoredRestaurants.filter((r) => selectedIds.includes(r.id))
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

  // Toggle an individual dish inside the curated order for a restaurant
  const handleToggleDish = (restaurantId, dishName) => {
    const key = `${restaurantId}_${dishName}`
    setUnselectedDishes((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Add an extra dish from menu to custom order
  const handleAddDish = (restaurantId, dish) => {
    const key = `${restaurantId}_${dish.name}`
    setUnselectedDishes((prev) => {
      const copy = { ...prev }
      delete copy[key]
      return copy
    })
    setExtraDishes((prev) => {
      const existing = prev[restaurantId] || []
      if (existing.some((d) => d.name === dish.name)) return prev
      return { ...prev, [restaurantId]: [...existing, dish] }
    })
  }

  // Calculate real bill for a restaurant based on active dishes
  const calculateBill = (restaurant) => {
    const baseCurated = curatedPlans[restaurant.id] || []
    const extras = extraDishes[restaurant.id] || []
    const allDishes = [...baseCurated, ...extras]

    // Active dishes (not in unselectedDishes)
    const activeDishes = allDishes.filter((d) => !unselectedDishes[`${restaurant.id}_${d.name}`])

    const subtotal = activeDishes.reduce((sum, d) => sum + (d.priceNum || 0), 0)
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

  // Find the AI Winner among the selected restaurants
  const aiWinner = useMemo(() => {
    if (compareList.length === 0) return null
    let best = compareList[0]
    compareList.forEach((r) => {
      if (r.aiScore > best.aiScore) {
        best = r
      }
    })
    return best
  }, [compareList])

  return (
    <div className="flex-1 w-full bg-[#FAF8F5]">
      {/* 1. TOP BANNER HEADER (Matches user reference screenshot) */}
      <section className="bg-[#FAF5EA] border-b border-[#F0E6D2] pt-10 pb-8 px-6 sm:px-10 lg:px-16">
        <div className="max-w-6xl mx-auto">
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

            {/* Step 2 */}
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2.5 transition-colors cursor-pointer group"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  currentStep === 2
                    ? 'bg-[#85312C] text-white shadow-xs'
                    : currentStep > 2
                    ? 'bg-neutral-800 text-white'
                    : 'border border-neutral-300 text-neutral-500 bg-white'
                }`}
              >
                2
              </span>
              <span
                className={`font-semibold ${
                  currentStep === 2 ? 'text-[#85312C]' : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                Pick places
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
      <main className="max-w-6xl mx-auto py-10 px-6 sm:px-10 lg:px-16 min-h-[500px]">
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
                A few details help us find the right kind of meal and let the Zaika AI find the best match.
              </p>
            </div>

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

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // Pick top 2 matches if none selected
                    if (selectedIds.length < 2) {
                      const top2 = scoredRestaurants.slice(0, 2).map((r) => r.id)
                      setSelectedIds(top2)
                    }
                    setCurrentStep(3)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="border border-[#85312C] text-[#85312C] hover:bg-[#FAF1E8] text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Quick AI Compare</span>
                  <span className="text-xs">⚡</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="bg-[#85312C] hover:bg-[#702622] text-white text-sm font-semibold py-2.5 px-6 rounded-lg shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>Find my options</span>
                  <span className="text-base leading-none transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: PICK PLACES (Choose 2 or more restaurants) */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#85312C] uppercase block mb-1">
                  02 / PICK PLACES
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal leading-tight">
                  Choose restaurants to compare
                </h2>
                <p className="text-neutral-500 text-sm sm:text-base mt-1.5">
                  Pick 2 to 4 places. We’ve ranked them based on your ₹{budget} budget for {people}{' '}
                  {people === 1 ? 'person' : 'people'} and your taste preferences.
                </p>
              </div>

              {/* Selection Counter Badge & Discover Link */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage && setCurrentPage('discover')}
                  className="text-xs text-[#85312C] hover:underline font-medium cursor-pointer hidden sm:inline"
                >
                  Explore more in Discover →
                </button>
                <span className="text-xs sm:text-sm font-medium text-neutral-700 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <strong className="text-[#85312C] font-bold">{selectedIds.length}</strong> of 4 places selected{' '}
                  <span className="text-neutral-400">({selectedIds.length >= 2 ? 'Ready' : 'Min 2 required'})</span>
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['All', 'Italian', 'Indian', 'Café', 'Favorites'].map((filterName) => (
                <button
                  key={filterName}
                  onClick={() => setPlaceFilter(filterName)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer shrink-0 font-medium ${
                    placeFilter === filterName
                      ? 'bg-[#85312C] text-white border-[#85312C]'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {filterName === 'Favorites'
                    ? `Favorites (${Object.values(favorites).filter(Boolean).length})`
                    : filterName}
                </button>
              ))}
            </div>

            {/* Restaurant Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scoredRestaurants
                .filter((r) => {
                  if (placeFilter === 'Italian') return r.cuisineType === 'Italian'
                  if (placeFilter === 'Indian') return r.cuisineType === 'Indian'
                  if (placeFilter === 'Café') return r.cuisineType === 'Café'
                  if (placeFilter === 'Favorites') return favorites[r.id]
                  return true
                })
                .map((restaurant) => {
                  const isSelected = selectedIds.includes(restaurant.id)

                  return (
                    <div
                      key={restaurant.id}
                      className={`bg-white rounded-2xl border overflow-hidden shadow-xs transition-all duration-300 flex flex-col group relative ${
                        isSelected
                          ? 'border-[#85312C] ring-2 ring-[#85312C]/20 shadow-md'
                          : 'border-neutral-200/80 hover:border-neutral-300 hover:shadow-md'
                      }`}
                    >
                      {/* Image Container with Badges */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />

                        {/* AI Match Badge */}
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#85312C] text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs border border-neutral-100 flex items-center gap-1">
                          <span>✨</span>
                          <span>{restaurant.aiScore}% Match</span>
                        </div>

                        {/* Favorite button */}
                        <button
                          type="button"
                          onClick={() => onToggleFavorite && onToggleFavorite(restaurant.id)}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-pointer ${
                            favorites[restaurant.id] ? 'text-rose-500' : 'text-neutral-400 hover:text-neutral-600'
                          }`}
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        </button>

                        {/* Offer Badge */}
                        <div className="absolute bottom-3 left-3 bg-[#FAF1E8] text-[#85312C] text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs border border-[#F3E2D4]">
                          {restaurant.offer}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-serif text-xl text-neutral-900 font-normal">
                              {restaurant.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm font-semibold text-neutral-800">
                              <span className="text-amber-500">★</span>
                              <span>{restaurant.rating}</span>
                            </div>
                          </div>

                          <p className="text-xs text-neutral-500 mt-0.5">{restaurant.cuisine}</p>

                          <p className="text-neutral-600 text-xs sm:text-sm mt-2.5 line-clamp-2 leading-relaxed">
                            {restaurant.description}
                          </p>

                          {/* Signature Dish Highlight */}
                          <div className="mt-3 bg-[#FAF8F5] p-2 rounded-lg border border-neutral-100 flex items-start gap-1.5 text-xs text-neutral-700">
                            <span className="text-[#85312C] text-xs">🍽️</span>
                            <span className="line-clamp-1 text-[11px]">
                              Signature: <strong className="font-semibold text-neutral-900">{restaurant.signatureDish}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Action row */}
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                          <div className="text-xs text-neutral-500">
                            <span>{restaurant.distance}</span> · <span>{restaurant.price}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleRestaurant(restaurant.id)}
                            className={`text-xs font-semibold py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#F6EEBE] text-neutral-900 font-bold hover:bg-[#ECE3AD]'
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
                  )
                })}
            </div>

            {/* Bottom Floating Bar */}
            <div className="sticky bottom-4 z-30 bg-neutral-900 text-white rounded-2xl p-4 shadow-xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-neutral-400 hover:text-white text-xs font-medium cursor-pointer"
                >
                  ← Back to plans
                </button>
                <div className="h-4 w-px bg-neutral-700 hidden sm:block" />
                <span className="text-xs font-medium text-neutral-300">
                  {selectedIds.length === 0 && 'Select 2 or more restaurants to compare.'}
                  {selectedIds.length === 1 && 'Pick 1 more restaurant to enable comparison.'}
                  {selectedIds.length >= 2 && (
                    <span>
                      Comparing <strong className="text-[#F6EEBE] font-bold">{selectedIds.length}</strong> restaurants
                      for ₹{budget} budget
                    </span>
                  )}
                </span>
              </div>

              <button
                type="button"
                disabled={selectedIds.length < 2}
                onClick={() => {
                  setCurrentStep(3)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`text-sm font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  selectedIds.length >= 2
                    ? 'bg-[#85312C] hover:bg-[#9B3831] text-white shadow-md'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <span>Compare menus with Zaika AI</span>
                <span className="text-base leading-none">✨ →</span>
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
                  Side-by-side menu & real bill comparison
                </h2>
                <p className="text-neutral-500 text-sm sm:text-base mt-1.5">
                  Customized orders curated by Zaika AI for {people} {people === 1 ? 'person' : 'people'} within your ₹{budget} budget.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="border border-neutral-300 hover:bg-neutral-100 bg-white text-neutral-800 text-xs font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  Edit places ({selectedIds.length})
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

            {/* AI CONCIERGE VERDICT BANNER */}
            {aiWinner && (
              <div className="bg-gradient-to-r from-[#FAF1E8] via-[#FAF5EA] to-[#F7EEDE] rounded-2xl border border-[#F0DFD0] p-6 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#85312C] uppercase">
                      <span className="text-amber-600 text-sm">✨</span>
                      <span>Zaika AI Taste & Bill Concierge Verdict</span>
                    </div>

                    <h3 className="font-serif text-2xl text-neutral-900 font-normal">
                      Top Match:{' '}
                      <strong className="font-bold text-[#85312C] underline decoration-[#85312C]/30 decoration-2 underline-offset-4">
                        {aiWinner.name}
                      </strong>{' '}
                      ({aiWinner.aiScore}% Match)
                    </h3>

                    <p className="text-neutral-700 text-sm max-w-3xl leading-relaxed">
                      Based on your budget of <strong>₹{budget}</strong> for <strong>{people} {people === 1 ? 'person' : 'people'}</strong>, preference for <strong>{cuisine}</strong> ({dietary})
                      {drinksInput ? <>, drinks ({drinksInput})</> : null}
                      {craving ? <>, and food cravings ({craving})</> : null}:
                      <br className="hidden sm:inline" />
                      {' '}
                      <em>{aiWinner.name}</em> offers the ideal culinary synergy with signature specialty <strong>{aiWinner.signatureDish}</strong> and maximum savings after their {aiWinner.offer} discount.
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
                          <h4 className="font-serif text-xl font-normal text-neutral-900">
                            {restaurant.name}
                          </h4>
                          <span className="text-xs font-bold text-[#85312C]">
                            {restaurant.aiScore}% Match
                          </span>
                        </div>

                        <p className="text-xs text-neutral-500 mb-3">
                          {restaurant.cuisine} · {restaurant.distance}
                        </p>

                        {/* Signature Dish Pill */}
                        <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-neutral-100 text-xs text-neutral-700 mb-4 flex items-center justify-between">
                          <span className="text-neutral-500 text-[11px]">Signature Dish:</span>
                          <strong className="text-[#85312C] font-semibold">{restaurant.signatureDish}</strong>
                        </div>

                        {/* Curated Meal Plan Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                            Curated Meal Order
                          </span>
                          <span className="text-[10px] text-neutral-400">Toggle dishes</span>
                        </div>

                        {/* List of Dishes with Checkboxes */}
                        <div className="space-y-2 text-xs">
                          {allDishes.map((dish) => {
                            const isChecked = !unselectedDishes[`${restaurant.id}_${dish.name}`]

                            return (
                              <label
                                key={dish.name}
                                className={`flex items-start justify-between gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                                  isChecked
                                    ? 'bg-[#FAF8F5] border-neutral-200'
                                    : 'bg-white border-dashed border-neutral-200 opacity-50 hover:opacity-80'
                                }`}
                              >
                                <div className="flex items-start gap-2 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleDish(restaurant.id, dish.name)}
                                    className="mt-0.5 accent-[#85312C] rounded-sm cursor-pointer"
                                  />
                                  <div>
                                    <span
                                      className={`font-medium block leading-tight ${
                                        isChecked ? 'text-neutral-900' : 'text-neutral-500 line-through'
                                      }`}
                                    >
                                      {dish.name}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 capitalize block mt-0.5">
                                      {dish.category}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`font-semibold font-serif shrink-0 ${
                                    isChecked ? 'text-neutral-900' : 'text-neutral-400'
                                  }`}
                                >
                                  {dish.price}
                                </span>
                              </label>
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
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveMenuModal(restaurant)}
                            className="flex-1 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Full menu</span>
                            <span className="text-sm">→</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              alert(
                                `Booking table at ${restaurant.name} for ${people} people! An SMS confirmation will be sent.`
                              )
                            }}
                            className="flex-1 bg-[#85312C] hover:bg-[#702622] text-white text-xs font-semibold py-2 px-2.5 rounded-lg shadow-2xs transition-colors cursor-pointer text-center"
                          >
                            Reserve Table
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-neutral-200/90 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-neutral-700 hover:text-[#85312C] text-sm font-medium transition-colors cursor-pointer"
              >
                ← Change selected restaurants
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
          </div>
        )}
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
    </div>
  )
}
