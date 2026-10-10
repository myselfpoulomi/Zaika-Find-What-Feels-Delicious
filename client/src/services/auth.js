/**
 * Authentication and User Profile service for Zaika.
 * Handles complete CRUD operations using HTTP-only cookie authentication.
 */

const AUTH_BASE = '/api/auth';
const USER_BASE = '/api/user';

/**
 * Fetch helper with credentials enabled for cookie exchange
 */
async function apiRequest(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
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

// -------------------------------------------------------------
// 1. CREATE
// -------------------------------------------------------------

/**
 * Register / Create a new user account
 * @param {Object} userData - { name, email, password, phone, bio, favoriteCuisine, typicalBudget, dietaryPref }
 */
export async function registerUser(userData) {
  return apiRequest(`${AUTH_BASE}/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Create a user profile (CRUD Create endpoint)
 */
export async function createUserProfile(userData) {
  return apiRequest('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// -------------------------------------------------------------
// 2. READ
// -------------------------------------------------------------

/**
 * Fetch the authenticated user's session and profile via HTTP-only cookie
 */
export async function getCurrentUser() {
  try {
    const data = await apiRequest(`${AUTH_BASE}/me`, {
      method: 'GET',
    });
    return data.user || null;
  } catch (err) {
    if (err.status === 401) {
      return null;
    }
    console.warn('Could not verify session with backend:', err.message);
    return null;
  }
}

/**
 * Read current user profile details
 */
export async function getUserProfile() {
  const data = await apiRequest(`${USER_BASE}/profile`, {
    method: 'GET',
  });
  return data.user;
}

/**
 * Read user profile by ID
 */
export async function getUserById(id) {
  const data = await apiRequest(`/api/users/${id}`, {
    method: 'GET',
  });
  return data.user;
}

// -------------------------------------------------------------
// 3. UPDATE
// -------------------------------------------------------------

/**
 * Update authenticated user profile details (preferences, bio, phone, name, password)
 */
export async function updateUserProfile(updateData) {
  const data = await apiRequest(`${USER_BASE}/profile`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
  return data.user;
}

// -------------------------------------------------------------
// 4. DELETE
// -------------------------------------------------------------

/**
 * Delete current user account and profile, clearing authentication cookies
 */
export async function deleteUserProfile() {
  return apiRequest(`${USER_BASE}/profile`, {
    method: 'DELETE',
  });
}

/**
 * Delete user by ID
 */
export async function deleteUserById(id) {
  return apiRequest(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

// -------------------------------------------------------------
// AUTH UTILITIES
// -------------------------------------------------------------

/**
 * Log in an existing user
 */
export async function loginUser({ email, password }) {
  return apiRequest(`${AUTH_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Log out user by clearing the HTTP-only cookie on the server
 */
export async function logoutUser() {
  try {
    return await apiRequest(`${AUTH_BASE}/logout`, {
      method: 'POST',
    });
  } catch (err) {
    console.error('Logout error:', err);
    return { success: true };
  }
}
