/**
 * Location Service for Zaika
 * Manages isolated per-user map/discover locations via PostgreSQL and Cookies.
 * Defaults to null/empty if the user hasn't chosen a location yet.
 */

import { getApiUrl } from './apiConfig';

const PREFERENCE_BASE = getApiUrl('/api/preference');
const COOKIE_LOCATION_NAME = 'zaika_location';

export const DEFAULT_LOCATION = null;

/**
 * Read the location cookie
 */
export function getLocationCookie() {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + COOKIE_LOCATION_NAME + '=([^;]+)'));
    if (match) {
      const decoded = decodeURIComponent(match[2]);
      return JSON.parse(decoded);
    }
  } catch (err) {
    console.warn('Error reading location cookie:', err);
  }
  return null;
}

/**
 * Retrieve saved location specifically for a given userId
 * Returns null if the user hasn't set any location yet.
 */
export function getUserLocation(userId) {
  if (!userId) {
    return null;
  }

  // 1. Try reading from cookie for this user
  const cookie = getLocationCookie();
  if (cookie && cookie.userId === userId && cookie.lat && (cookie.lon || cookie.lng)) {
    return {
      name: cookie.name || cookie.city || '',
      formattedAddress: cookie.formattedAddress || `${cookie.city || ''}`,
      city: cookie.city || '',
      lat: Number(cookie.lat),
      lon: Number(cookie.lon || cookie.lng),
      isCurrentLocation: !!cookie.isCurrentLocation,
    };
  }

  // 2. Try user-scoped localStorage
  try {
    const saved = localStorage.getItem(`zaika_selected_location_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.lat && (parsed.lon || parsed.lng)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading user-scoped location:', err);
  }

  // If user hasn't set anything, return null (empty location)
  return null;
}

/**
 * Save user location to PostgreSQL, Cookie, and user-scoped localStorage
 */
export async function saveUserLocation(userId, location) {
  if (!userId || !location) return;

  const payload = {
    name: location.name || location.city || '',
    formattedAddress: location.formattedAddress || '',
    city: location.city || '',
    lat: Number(location.lat),
    lon: Number(location.lon || location.lng),
    isCurrentLocation: !!location.isCurrentLocation,
  };

  // 1. Save to user-scoped localStorage
  try {
    localStorage.setItem(`zaika_selected_location_${userId}`, JSON.stringify(payload));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }

  // 2. Save to cookie
  try {
    const cookiePayload = JSON.stringify({ userId, ...payload });
    document.cookie = `${COOKIE_LOCATION_NAME}=${encodeURIComponent(cookiePayload)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch (err) {
    console.warn('Cookie save error:', err);
  }

  // 3. Save to backend database preference
  try {
    await fetch(PREFERENCE_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        selectedLocation: payload,
      }),
    });
  } catch (err) {
    console.warn('Backend location sync error:', err);
  }
}

/**
 * Get recent searched locations scoped by user
 */
export function getUserRecentLocations(userId) {
  if (!userId) return [];
  try {
    const saved = localStorage.getItem(`zaika_recent_locations_${userId}`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Save recent searched locations scoped by user
 */
export function saveUserRecentLocations(userId, locations) {
  if (!userId || !Array.isArray(locations)) return;
  try {
    localStorage.setItem(`zaika_recent_locations_${userId}`, JSON.stringify(locations));
  } catch (err) {
    console.warn('Error saving recent locations:', err);
  }
}
