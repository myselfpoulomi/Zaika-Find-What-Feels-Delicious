import jwt from 'jsonwebtoken';

export const COOKIE_NAME = process.env.COOKIE_NAME || 'zaika_token';

/**
 * Generate a signed JWT for the given user ID.
 */
export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'zaika_delish_fallback_secret_key_2025';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ userId }, secret, { expiresIn });
};

/**
 * Get cookie configuration options based on the current environment.
 */
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // Prevents client-side scripts from reading the cookie
    secure: isProduction, // HTTPS required in production
    sameSite: isProduction ? 'none' : 'lax', // Support cross-origin cookies in prod if needed, lax in dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
};

/**
 * Set the authentication cookie on the Express response.
 */
export const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

/**
 * Clear the authentication cookie from the Express response.
 */
export const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
};
