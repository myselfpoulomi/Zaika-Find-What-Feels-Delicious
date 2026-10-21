import prisma from '../db/prisma.js';

const COOKIE_COMPARE_NAME = 'zaika_compare';

/**
 * Helper to serialize compare payload to cookie
 */
const setCompareCookie = (res, data, userId) => {
  try {
    const payload = JSON.stringify({
      userId,
      restaurantIds: data.restaurantIds || [],
      budget: data.budget ?? 1500,
      people: data.people ?? 2,
      cuisine: data.cuisine || 'Any cuisine',
      dietary: data.dietary || 'Vegetarian',
      drinksInput: data.drinksInput || '',
      craving: data.craving || '',
      anythingElse: data.anythingElse || '',
      dishQuantities: data.dishQuantities || {},
      lastComparison: data.lastComparison || null,
      updatedAt: new Date().toISOString(),
    });

    res.cookie(COOKIE_COMPARE_NAME, payload, {
      httpOnly: false, // Allows both client-side read and server-side sync
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  } catch (err) {
    console.error('Failed to set compare cookie:', err);
  }
};

/**
 * GET /api/compare
 * Fetch current authenticated user's comparison data
 */
export const getComparison = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch from Database
    let comparison = await prisma.comparison.findUnique({
      where: { userId },
    });

    // 2. If no record in DB yet, check if there is compare data in the cookie for this user
    if (!comparison) {
      let cookieData = null;
      try {
        if (req.cookies?.[COOKIE_COMPARE_NAME]) {
          const parsed = JSON.parse(req.cookies[COOKIE_COMPARE_NAME]);
          if (parsed && parsed.userId === userId) {
            cookieData = parsed;
          }
        }
      } catch (e) {
        // Ignore cookie parse error
      }

      if (cookieData && (Array.isArray(cookieData.restaurantIds) || cookieData.lastComparison)) {
        // Persist cookie data to DB
        comparison = await prisma.comparison.create({
          data: {
            userId,
            restaurantIds: cookieData.restaurantIds || [],
            budget: cookieData.budget ?? 1500,
            people: cookieData.people ?? 2,
            cuisine: cookieData.cuisine || 'Any cuisine',
            dietary: cookieData.dietary || 'Vegetarian',
            drinksInput: cookieData.drinksInput || '',
            craving: cookieData.craving || '',
            anythingElse: cookieData.anythingElse || 'Something filling, not too expensive.',
            dishQuantities: cookieData.dishQuantities || {},
            lastComparison: cookieData.lastComparison || null,
          },
        });
      } else {
        // Return blank default comparison structure
        comparison = {
          userId,
          restaurantIds: [],
          budget: 1500,
          people: 2,
          cuisine: 'Any cuisine',
          dietary: 'Vegetarian',
          drinksInput: '',
          craving: '',
          anythingElse: 'Something filling, not too expensive.',
          dishQuantities: {},
          lastComparison: null,
        };
      }
    }

    // Always keep cookie synced with user's data
    setCompareCookie(res, comparison, userId);

    return res.status(200).json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    console.error('Get Comparison Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve comparison data.',
    });
  }
};

/**
 * POST /api/compare
 * Save / Update current authenticated user's comparison data in DB and Cookie
 */
export const saveComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      restaurantIds = [],
      budget = 1500,
      people = 2,
      cuisine = 'Any cuisine',
      dietary = 'Vegetarian',
      drinksInput = '',
      craving = '',
      anythingElse = 'Something filling, not too expensive.',
      dishQuantities = {},
      lastComparison,
    } = req.body;

    const cleanRestaurantIds = Array.isArray(restaurantIds) ? restaurantIds.map(String) : [];

    const updateData = {
      restaurantIds: cleanRestaurantIds,
      budget: Number(budget) || 1500,
      people: Number(people) || 2,
      cuisine: String(cuisine || 'Any cuisine'),
      dietary: String(dietary || 'Vegetarian'),
      drinksInput: String(drinksInput || ''),
      craving: String(craving || ''),
      anythingElse: String(anythingElse || ''),
      dishQuantities: dishQuantities && typeof dishQuantities === 'object' ? dishQuantities : {},
    };

    if (lastComparison !== undefined) {
      updateData.lastComparison = lastComparison;
    }

    const updatedComparison = await prisma.comparison.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
        lastComparison: lastComparison || null,
      },
    });

    // Store in cookie
    setCompareCookie(res, updatedComparison, userId);

    return res.status(200).json({
      success: true,
      message: 'Comparison updated successfully.',
      data: updatedComparison,
    });
  } catch (error) {
    console.error('Save Comparison Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save comparison data.',
    });
  }
};

/**
 * DELETE /api/compare
 * Clear active comparison places for current user in DB and Cookie,
 * while preserving historical lastComparison for the Home page hero recap
 */
export const clearComparison = async (req, res) => {
  try {
    const userId = req.user.id;

    const existing = await prisma.comparison.findUnique({
      where: { userId },
    });

    const updatedComparison = await prisma.comparison.upsert({
      where: { userId },
      update: {
        restaurantIds: [],
        dishQuantities: {},
      },
      create: {
        userId,
        restaurantIds: [],
        dishQuantities: {},
        lastComparison: existing?.lastComparison || null,
      },
    });

    // Sync cookie with empty restaurantIds but preserve lastComparison
    setCompareCookie(res, updatedComparison, userId);

    return res.status(200).json({
      success: true,
      message: 'Active comparison places cleared successfully.',
      data: updatedComparison,
    });
  } catch (error) {
    console.error('Clear Comparison Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear comparison data.',
    });
  }
};
