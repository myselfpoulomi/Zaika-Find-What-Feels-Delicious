import bcrypt from 'bcryptjs';
import prisma from '../db/prisma.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

// Standard safe fields to return for user profile including connected preference
export const SAFE_USER_SELECT = {
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
};

/**
 * Format user object to have convenient top-level preference properties
 * while preserving the nested `preference` relation object
 */
export const formatUserWithPreference = (user) => {
  if (!user) return null;
  const pref = user.preference || {};
  return {
    ...user,
    favoriteCuisine: pref.favoriteCuisine || 'Italian',
    typicalBudget: pref.typicalBudget || '1500',
    dietaryPref: pref.dietaryPref || 'Vegetarian',
  };
};

/**
 * CREATE a user and connected preference
 * POST /api/users
 */
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      bio,
      favoriteCuisine,
      typicalBudget,
      dietaryPref,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
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
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and connected preference in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        bio: bio ? bio.trim() : null,
        preference: {
          create: {
            favoriteCuisine: favoriteCuisine || 'Italian',
            typicalBudget: typicalBudget ? String(typicalBudget) : '1500',
            dietaryPref: dietaryPref || 'Vegetarian',
          },
        },
      },
      select: SAFE_USER_SELECT,
    });

    const formatted = formatUserWithPreference(newUser);

    // Set HTTP-only auth cookie
    const token = generateToken(newUser.id);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'User and preferences created successfully!',
      user: formatted,
    });
  } catch (error) {
    console.error('Create User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating user profile.',
    });
  }
};

/**
 * READ currently authenticated user's profile with connected preference
 * GET /api/users/profile or GET /api/user/profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: formatUserWithPreference(user),
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile.',
    });
  }
};

/**
 * READ user profile by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      user: formatUserWithPreference(user),
    });
  } catch (error) {
    console.error('Get User By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user.',
    });
  }
};

/**
 * READ all user profiles
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(formatUserWithPreference),
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching users.',
    });
  }
};

/**
 * UPDATE authenticated user's profile and connected preference
 * PUT /api/users/profile or PUT /api/user/profile
 */
export const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      bio,
      favoriteCuisine,
      typicalBudget,
      dietaryPref,
      currentPassword,
      newPassword,
    } = req.body;

    const userUpdateData = {};

    if (name !== undefined && name.trim()) {
      userUpdateData.name = name.trim();
    }

    if (phone !== undefined) {
      userUpdateData.phone = phone ? phone.trim() : null;
    }

    if (bio !== undefined) {
      userUpdateData.bio = bio ? bio.trim() : null;
    }

    // Handle password update if requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change your password.',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.',
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      const isMatch = await bcrypt.compare(currentPassword, existingUser.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match.',
        });
      }

      userUpdateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Update user table if user fields changed
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: userUpdateData,
      });
    }

    // Update or create connected preference record using userId foreign key
    const hasPrefUpdate =
      favoriteCuisine !== undefined ||
      typicalBudget !== undefined ||
      dietaryPref !== undefined;

    if (hasPrefUpdate) {
      await prisma.preference.upsert({
        where: { userId: req.user.id },
        create: {
          userId: req.user.id,
          favoriteCuisine: favoriteCuisine || 'Italian',
          typicalBudget: typicalBudget ? String(typicalBudget) : '1500',
          dietaryPref: dietaryPref || 'Vegetarian',
        },
        update: {
          ...(favoriteCuisine !== undefined && { favoriteCuisine }),
          ...(typicalBudget !== undefined && { typicalBudget: String(typicalBudget) }),
          ...(dietaryPref !== undefined && { dietaryPref }),
        },
      });
    }

    // Return the updated user along with preference relation
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: SAFE_USER_SELECT,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile and preferences updated successfully!',
      user: formatUserWithPreference(updatedUser),
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile.',
    });
  }
};

/**
 * UPDATE user by ID
 * PUT /api/users/:id
 */
export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile.',
      });
    }

    return updateMyProfile(req, res);
  } catch (error) {
    console.error('Update User By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating user.',
    });
  }
};

/**
 * DELETE authenticated user's profile and account
 * Cascades deletion of connected preference in PostgreSQL!
 * DELETE /api/users/profile or DELETE /api/user/profile
 */
export const deleteMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user from database (Preference is automatically cascade-deleted)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear auth cookie
    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Account, profile, and preferences deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting account.',
    });
  }
};

/**
 * DELETE user by ID
 * DELETE /api/users/:id
 */
export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own profile.',
      });
    }

    return deleteMyProfile(req, res);
  } catch (error) {
    console.error('Delete User By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting user.',
    });
  }
};

// =============================================================
// DEDICATED PREFERENCE CRUD CONTROLLERS
// =============================================================

/**
 * READ user's preference
 * GET /api/user/preference or GET /api/preferences
 */
export const getUserPreference = async (req, res) => {
  try {
    let preference = await prisma.preference.findUnique({
      where: { userId: req.user.id },
    });

    // If preference hasn't been created yet, initialize default
    if (!preference) {
      preference = await prisma.preference.create({
        data: {
          userId: req.user.id,
          favoriteCuisine: 'Italian',
          typicalBudget: '1500',
          dietaryPref: 'Vegetarian',
        },
      });
    }

    return res.status(200).json({
      success: true,
      preference,
    });
  } catch (error) {
    console.error('Get Preference Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching preferences.',
    });
  }
};

/**
 * CREATE or UPDATE user's preference using userId as foreign key
 * PUT /api/user/preference or PUT /api/preferences
 */
export const updateUserPreference = async (req, res) => {
  try {
    const { favoriteCuisine, typicalBudget, dietaryPref } = req.body;

    const preference = await prisma.preference.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        favoriteCuisine: favoriteCuisine || 'Italian',
        typicalBudget: typicalBudget ? String(typicalBudget) : '1500',
        dietaryPref: dietaryPref || 'Vegetarian',
      },
      update: {
        ...(favoriteCuisine !== undefined && { favoriteCuisine }),
        ...(typicalBudget !== undefined && { typicalBudget: String(typicalBudget) }),
        ...(dietaryPref !== undefined && { dietaryPref }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully!',
      preference,
    });
  } catch (error) {
    console.error('Update Preference Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating preferences.',
    });
  }
};

/**
 * DELETE / RESET user's preference
 * DELETE /api/user/preference or DELETE /api/preferences
 */
export const deleteUserPreference = async (req, res) => {
  try {
    await prisma.preference.deleteMany({
      where: { userId: req.user.id },
    });

    return res.status(200).json({
      success: true,
      message: 'Preferences reset successfully.',
    });
  } catch (error) {
    console.error('Delete Preference Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error resetting preferences.',
    });
  }
};
