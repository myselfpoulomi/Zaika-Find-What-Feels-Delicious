import bcrypt from 'bcryptjs';
import prisma from '../db/prisma.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

// Standard safe fields to return for user profile
export const SAFE_USER_SELECT = {
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
};

/**
 * CREATE a user / profile
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

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        bio: bio ? bio.trim() : null,
        favoriteCuisine: favoriteCuisine || 'Italian',
        typicalBudget: typicalBudget ? String(typicalBudget) : '1500',
        dietaryPref: dietaryPref || 'Vegetarian',
      },
      select: SAFE_USER_SELECT,
    });

    // Optionally set session cookie if requested or newly registered
    const token = generateToken(newUser.id);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'User profile created successfully!',
      user: newUser,
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
 * READ currently authenticated user's profile
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
      user,
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
      user,
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
      users,
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
 * UPDATE authenticated user's profile
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

    const updateData = {};

    if (name !== undefined && name.trim()) {
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }

    if (bio !== undefined) {
      updateData.bio = bio ? bio.trim() : null;
    }

    if (favoriteCuisine !== undefined) {
      updateData.favoriteCuisine = favoriteCuisine;
    }

    if (typicalBudget !== undefined) {
      updateData.typicalBudget = String(typicalBudget);
    }

    if (dietaryPref !== undefined) {
      updateData.dietaryPref = dietaryPref;
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
      select: SAFE_USER_SELECT,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
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

    // Users can only update their own profile unless privileged
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
 * DELETE /api/users/profile or DELETE /api/user/profile
 */
export const deleteMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user from database
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear auth cookie
    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Account and profile deleted successfully.',
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

    // Users can only delete their own profile unless privileged
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
