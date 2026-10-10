import bcrypt from 'bcryptjs';
import prisma from '../db/prisma.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user and connected preference in database
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        preference: {
          create: {
            favoriteCuisine: 'Italian',
            typicalBudget: '1500',
            dietaryPref: 'Vegetarian',
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        preference: {
          select: {
            id: true,
            userId: true,
            favoriteCuisine: true,
            typicalBudget: true,
            dietaryPref: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      bio: newUser.bio,
      preference: newUser.preference,
      favoriteCuisine: newUser.preference?.favoriteCuisine || 'Italian',
      typicalBudget: newUser.preference?.typicalBudget || '1500',
      dietaryPref: newUser.preference?.dietaryPref || 'Vegetarian',
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    // Generate token and set HTTP-only cookie
    const token = generateToken(newUser.id);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: safeUser,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
};

/**
 * Log in an existing user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email including connected preference
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        preference: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate token and set HTTP-only cookie
    const token = generateToken(user.id);
    setAuthCookie(res, token);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      bio: user.bio || null,
      preference: user.preference || null,
      favoriteCuisine: user.preference?.favoriteCuisine || 'Italian',
      typicalBudget: user.preference?.typicalBudget || '1500',
      dietaryPref: user.preference?.dietaryPref || 'Vegetarian',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      user: safeUser,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

/**
 * Log out the user by clearing the HTTP-only cookie
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    clearAuthCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout.',
    });
  }
};

/**
 * Get current authenticated user details from cookie
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * Update authenticated user's profile details
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const updateData = {};

    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password.',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.',
        });
      }

      // Fetch user with password hash
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.',
        });
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update.',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        preference: {
          select: {
            id: true,
            userId: true,
            favoriteCuisine: true,
            typicalBudget: true,
            dietaryPref: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const safeUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || null,
      bio: updatedUser.bio || null,
      preference: updatedUser.preference || null,
      favoriteCuisine: updatedUser.preference?.favoriteCuisine || 'Italian',
      typicalBudget: updatedUser.preference?.typicalBudget || '1500',
      dietaryPref: updatedUser.preference?.dietaryPref || 'Vegetarian',
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: safeUser,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile.',
    });
  }
};
