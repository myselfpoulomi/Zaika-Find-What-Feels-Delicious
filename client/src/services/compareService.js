/**
 * Compare Service for Zaika
 * Handles per-user comparison synchronization with PostgreSQL and Cookies.
 */

const COMPARE_BASE = '/api/compare';
const COOKIE_NAME = 'zaika_compare';

/**
 * Read the compare cookie directly from browser cookies
 */
export function getCompareCookie() {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
    if (match) {
      const decoded = decodeURIComponent(match[2]);
      return JSON.parse(decoded);
    }
  } catch (err) {
    console.warn('Error reading compare cookie:', err);
  }
  return null;
}

/**
 * Set the compare cookie in browser cookies
 */
export function setCompareCookie(data, userId) {
  try {
    const payload = JSON.stringify({
      userId: userId || null,
      restaurantIds: data.restaurantIds || [],
      budget: data.budget ?? 1500,
      people: data.people ?? 2,
      cuisine: data.cuisine || 'Any cuisine',
      dietary: data.dietary || 'Vegetarian',
      drinksInput: data.drinksInput || '',
      craving: data.craving || '',
      anythingElse: data.anythingElse || '',
      dishQuantities: data.dishQuantities || {},
      updatedAt: new Date().toISOString(),
    });

    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(payload)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch (err) {
    console.warn('Error setting compare cookie:', err);
  }
}

/**
 * Remove the compare cookie
 */
export function removeCompareCookie() {
  try {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch (err) {
    console.warn('Error removing compare cookie:', err);
  }
}

/**
 * Fetch authenticated user's comparison data from server & sync cookie
 */
export async function fetchUserCompare() {
  try {
    const res = await fetch(COMPARE_BASE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch comparison from backend, using cookie fallback:', err);
  }

  // Fallback to cookie
  return getCompareCookie();
}

/**
 * Save / Update user's comparison data to server & sync cookie
 */
export async function saveUserCompare(compareData) {
  try {
    const res = await fetch(COMPARE_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(compareData),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Failed to save comparison to backend:', err);
  }

  // Fallback to cookie
  if (compareData?.userId) {
    setCompareCookie(compareData, compareData.userId);
  }
  return compareData;
}

/**
 * Clear user's comparison list
 */
export async function clearUserCompare() {
  try {
    await fetch(COMPARE_BASE, {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (err) {
    console.warn('Failed to clear compare on server:', err);
  }

  removeCompareCookie();
}
