import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
} from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/signup', register); // Alias for convenience
router.post('/login', login);
router.post('/logout', logout);

// Protected routes (require valid cookie)
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);

export default router;
