import saffronTableImg from '../assets/saffron_table.jpg'
import oliveHouseImg from '../assets/olive_house.jpg'
import goldenHourImg from '../assets/golden_hour.jpg'
import heroBg from '../assets/hero_bg.jpg'

export const ALL_RESTAURANTS = [
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
    distance: '1.2 km away',
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
    distance: '1.8 km away',
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
    distance: '0.8 km away',
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
    distance: '2.4 km away',
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
    distance: '2.1 km away',
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
    distance: '3.2 km away',
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
    distance: '3.6 km away',
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
    distance: '1.5 km away',
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
    distance: '4.1 km away',
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
    distance: '2.8 km away',
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
