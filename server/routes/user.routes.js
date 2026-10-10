import { Router } from 'express';
import {
  createUser,
  getMyProfile,
  getUserById,
  getAllUsers,
  updateMyProfile,
  updateUserById,
  deleteMyProfile,
  deleteUserById,
} from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

// CREATE
router.post('/', createUser);

// READ (current authenticated user profile)
router.get('/profile', authenticateUser, getMyProfile);

// UPDATE (current authenticated user profile)
router.put('/profile', authenticateUser, updateMyProfile);
router.patch('/profile', authenticateUser, updateMyProfile);

// DELETE (current authenticated user profile & account)
router.delete('/profile', authenticateUser, deleteMyProfile);

// READ (all users)
router.get('/', authenticateUser, getAllUsers);

// READ, UPDATE, DELETE (by ID)
router.get('/:id', authenticateUser, getUserById);
router.put('/:id', authenticateUser, updateUserById);
router.patch('/:id', authenticateUser, updateUserById);
router.delete('/:id', authenticateUser, deleteUserById);

export default router;
