import heroBg from '../assets/hero_bg.jpg'
import { getApiUrl } from './apiConfig'

export function ensureRestaurantMenu(restaurant) {
  if (!restaurant) return null
  if (restaurant.menu && restaurant.menu.length > 0) return restaurant

  const isVeg = Boolean(restaurant.isVeg)
  const cuisineType = restaurant.cuisineType || 'Continental'
  let sampleMenu = []

  if (cuisineType === 'Indian') {
    sampleMenu = [
      { name: isVeg ? 'Saffron Paneer Tikka' : 'Tandoori Chicken Tikka', price: '₹280', priceNum: 280, category: 'starter', desc: 'Charcoal grilled kebabs with mint chutney' },
      { name: isVeg ? 'Dal Makhani Slow Simmered' : 'Butter Chicken Royale', price: '₹320', priceNum: 320, category: 'main', desc: 'Slow simmered rich aromatic gravy' },
      { name: 'Butter Garlic Naan (2 pcs)', price: '₹90', priceNum: 90, category: 'bread', desc: 'Fresh tandoor-baked flatbread' },
      { name: 'Saffron Cardamom Lassi', price: '₹140', priceNum: 140, category: 'drink', desc: 'Chilled creamy yogurt beverage' },
      { name: 'Gulab Jamun with Rabri', price: '₹130', priceNum: 130, category: 'dessert', desc: 'Warm milk dumplings soaked in syrup' }
    ]
  } else if (cuisineType === 'Italian') {
    sampleMenu = [
      { name: 'Classic Margherita Pizza', price: '₹340', priceNum: 340, category: 'main', desc: 'San Marzano tomatoes, fresh mozzarella, basil' },
      { name: 'Handmade Fettuccine Alfredo', price: '₹310', priceNum: 310, category: 'main', desc: 'Creamy parmesan emulsion with cracked black pepper' },
      { name: 'Herbed Garlic Bread', price: '₹140', priceNum: 140, category: 'starter', desc: 'Toasted sourdough with roasted garlic butter' },
      { name: 'Signature Aperol Spritz', price: '₹290', priceNum: 290, category: 'drink', desc: 'Sparkling citrus refresher' },
      { name: 'Tiramisu Tradizionale', price: '₹190', priceNum: 190, category: 'dessert', desc: 'Espresso savoiardi with mascarpone' }
    ]
  } else if (cuisineType === 'Café') {
    sampleMenu = [
      { name: 'Artisan Avocado Sourdough', price: '₹240', priceNum: 240, category: 'main', desc: 'Hass avocado on toasted artisan sourdough' },
      { name: 'Specialty Rosetta Cappuccino', price: '₹160', priceNum: 160, category: 'drink', desc: 'Single-origin espresso with steamed milk' },
      { name: 'Butter Croissant Flaky', price: '₹120', priceNum: 120, category: 'starter', desc: 'Freshly baked golden layered pastry' },
      { name: 'Granola & Berry Parfait', price: '₹180', priceNum: 180, category: 'dessert', desc: 'Greek yogurt with toasted almonds and berries' }
    ]
  } else if (cuisineType === 'Pan-Asian') {
    sampleMenu = [
      { name: 'Steamed Crystal Dim Sums', price: '₹260', priceNum: 260, category: 'starter', desc: 'Translucent parcels served with fiery chili oil' },
      { name: 'Pan-Seared Dan Dan Noodles', price: '₹310', priceNum: 310, category: 'main', desc: 'Spiced sesame broth with scallions and peanuts' },
      { name: 'Crispy Lotus Stem Bites', price: '₹210', priceNum: 210, category: 'starter', desc: 'Honey chili tossed crisp lotus root' },
      { name: 'Matcha Iced Latte', price: '₹170', priceNum: 170, category: 'drink', desc: 'Stone-ground ceremonial green tea with oat milk' },
      { name: 'Panko Fried Banana with Honey', price: '₹160', priceNum: 160, category: 'dessert', desc: 'Crisp warm bananas with vanilla bean drizzle' }
    ]
  } else if (cuisineType === 'Fast Food') {
    sampleMenu = [
      { name: 'Smash Burger Supreme', price: '₹240', priceNum: 240, category: 'main', desc: 'Double toasted brioche bun, cheese, secret sauce' },
      { name: 'Truffle Parmesan Fries', price: '₹160', priceNum: 160, category: 'starter', desc: 'Crispy cut potatoes tossed in white truffle oil' },
      { name: 'Loaded Nacho Bowl', price: '₹210', priceNum: 210, category: 'starter', desc: 'Corn chips layered with molten cheese and salsa' },
      { name: 'Thick Belgian Chocolate Shake', price: '₹180', priceNum: 180, category: 'drink', desc: 'Rich chocolate blended with real dairy ice cream' }
    ]
  } else {
    sampleMenu = [
      { name: 'Signature Chef Special Plate', price: '₹320', priceNum: 320, category: 'main', desc: 'Signature preparation with seasonal sides' },
      { name: 'Crisp Appetizer Platter', price: '₹220', priceNum: 220, category: 'starter', desc: 'Golden roasted specialty bites' },
      { name: 'House Cooler Refresher', price: '₹150', priceNum: 150, category: 'drink', desc: 'Fresh fruit infused sparkling cooler' },
      { name: 'Dessert of the Day', price: '₹160', priceNum: 160, category: 'dessert', desc: 'Chef confection served chilled' }
    ]
  }

  const sampleDishes = sampleMenu.slice(0, 3).map((m) => m.name).join(' · ')
  const totalEst = sampleMenu.slice(0, 3).reduce((sum, m) => sum + (m.priceNum || 200), 0)

  return {
    ...restaurant,
    signatureDish: restaurant.signatureDish || sampleMenu[0]?.name || 'Chef Special',
    offer: restaurant.offer || 'Up to ₹50 off',
    offerAmount: restaurant.offerAmount || 50,
    sampleDishes: restaurant.sampleDishes || sampleDishes,
    estimatedPrice: restaurant.estimatedPrice || `₹${totalEst}`,
    menu: sampleMenu
  }
}

export async function fetchLiveRestaurants({
  lat = null,
  lng = null,
  radius = 5000,
  city = '',
  cuisine = ''
} = {}) {
  if (!lat || !lng) return []
  try {
    const queryParams = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      city
    })
    if (cuisine && cuisine !== 'All cuisines' && cuisine !== 'Any cuisine') {
      queryParams.set('cuisine', cuisine)
    }

    const res = await fetch(getApiUrl(`/api/restaurants/nearby?${queryParams.toString()}`))
    if (!res.ok) throw new Error('Failed to fetch nearby restaurants')
    const json = await res.json()

    if (json.success && Array.isArray(json.data)) {
      return json.data.map((item) => {
        const rawPhotos = item.photos || (item.image ? [item.image] : [])
        const processedPhotos = rawPhotos.map((p) =>
          p.startsWith('/api') ? getApiUrl(p) : p
        )
        return ensureRestaurantMenu({
          ...item,
          distance: item.displayDistance || (item.distanceKm ? `${item.distanceKm} km away` : '1.5 km away'),
          image: item.image?.startsWith('/api')
            ? getApiUrl(item.image)
            : (item.image || heroBg),
          photos: processedPhotos.length > 0 ? processedPhotos : [heroBg]
        })
      })
    }
    return []
  } catch (error) {
    console.warn('[restaurantService] fetchLiveRestaurants error:', error)
    return []
  }
}

export async function fetchRestaurantMenu(restaurant) {
  if (!restaurant) return null
  try {
    const queryParams = new URLSearchParams({
      name: restaurant.name || '',
      city: restaurant.city || '',
      cuisine: restaurant.cuisine || restaurant.cuisineType || '',
      category: restaurant.category || ''
    })
    const placeId = restaurant.id || restaurant.googlePlaceId || 'general'
    const res = await fetch(getApiUrl(`/api/restaurants/${encodeURIComponent(placeId)}/menu?${queryParams.toString()}`))
    if (!res.ok) throw new Error('Failed to fetch menu')
    const json = await res.json()
    if (json.success) {
      return json
    }
    return null
  } catch (err) {
    console.warn('[restaurantService] fetchRestaurantMenu error:', err)
    return null
  }
}

export async function fetchAiComparison({
  restaurants = [],
  budget = 1500,
  people = 2,
  cuisine = 'Any',
  dietary = 'Vegetarian',
  drinksInput = '',
  craving = ''
} = {}) {
  try {
    const res = await fetch(getApiUrl('/api/restaurants/ai-compare'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurants,
        budget,
        people,
        cuisine,
        dietary,
        drinksInput,
        craving
      })
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json.success && json.data) {
      return json.data
    }
    return null
  } catch (err) {
    console.warn('[restaurantService] fetchAiComparison error:', err)
    return null
  }
}
