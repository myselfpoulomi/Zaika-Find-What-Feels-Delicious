import express from 'express';
import {
  getNearbyRestaurants,
  getRestaurantPhoto,
  getRestaurantDetails,
  getRestaurantMenu
} from '../controllers/restaurant.controller.js';

const router = express.Router();

// GET /api/restaurants/nearby?lat=...&lng=...&radius=...&keyword=...
router.get('/nearby', getNearbyRestaurants);

// GET /api/restaurants/photo?photo_reference=...&maxwidth=800
router.get('/photo', getRestaurantPhoto);

// GET /api/restaurants/:id/details - Fetch Google Reviews & full photo gallery
router.get('/:id/details', getRestaurantDetails);
router.get('/details', getRestaurantDetails);

// GET /api/restaurants/:id/menu - Fetch authentic categorized menu with photos & prices
router.get('/:id/menu', getRestaurantMenu);
router.get('/menu', getRestaurantMenu);

export default router;
