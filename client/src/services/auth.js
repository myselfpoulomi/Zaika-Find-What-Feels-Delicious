/**
 * Authentication service for communicating with the Zaika backend API.
 * Uses HTTP-only cookie-based authentication with `credentials: 'include'`.
 */

const API_BASE = '/api/auth';

/**
 * Fetch helper with credentials enabled for cookie exchange
 */
async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Ensures HTTP-only cookies are sent and stored
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Register a new user
 * @param {Object} param0 - { name, email, password }
 */
export async function registerUser({ name, email, password }) {
  return apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Log in an existing user
 * @param {Object} param0 - { email, password }
 */
export async function loginUser({ email, password }) {
  return apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Fetch the authenticated user's profile using the HTTP-only cookie
 */
export async function getCurrentUser() {
  try {
    const data = await apiRequest('/me', {
      method: 'GET',
    });
    return data.user || null;
  } catch (err) {
    // 401 indicates user is not logged in or cookie expired - return null safely
    if (err.status === 401) {
      return null;
    }
    // If backend is not reached yet, log quietly and return null
    console.warn('Could not verify session with backend:', err.message);
    return null;
  }
}

/**
 * Log out user by clearing the HTTP-only cookie on the server
 */
export async function logoutUser() {
  try {
    return await apiRequest('/logout', {
      method: 'POST',
    });
  } catch (err) {
    console.error('Logout error:', err);
    return { success: true };
  }
}

/**
 * Update user profile details
 */
export async function updateUserProfile(updateData) {
  return apiRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}
