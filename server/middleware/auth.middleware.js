import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import { COOKIE_NAME } from '../utils/token.js';

/**
 * Authentication middleware to verify user identity via HTTP-only cookie.
 * Also checks standard Authorization Bearer header as a fallback.
 */
export const authenticateUser = async (req, res, next) => {
  try {
    // 1. Retrieve token from HTTP-only cookie
    let token = req.cookies?.[COOKIE_NAME];

    // Fallback: check Authorization Bearer header if cookie is missing
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No auth cookie or token provided.',
      });
    }

    // 2. Verify token
    const secret = process.env.JWT_SECRET || 'zaika_delish_fallback_secret_key_2025';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    // 3. Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        favoriteCuisine: true,
        typicalBudget: true,
        dietaryPref: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};
