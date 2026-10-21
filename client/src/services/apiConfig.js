/**
 * Global API configuration for Zaika client.
 * In development, defaults to '' (proxied to http://localhost:5000 via vite.config.js) or VITE_API_BASE_URL.
 * In production on Vercel, uses VITE_API_BASE_URL.
 */
const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  '';

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Builds a complete URL given an API route path or external URL.
 * Handles paths like '/api/restaurants/nearby' or full URLs like 'https://...'.
 * 
 * @param {string} path - Endpoint path or full URL
 * @returns {string} Fully qualified URL or relative proxy path
 */
export function getApiUrl(path = '') {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
