import { Router } from 'express';
import {
  getUserPreference,
  updateUserPreference,
  deleteUserPreference,
} from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

// All preference endpoints require authentication
router.use(authenticateUser);

// GET /api/preferences or /api/preference
router.get('/', getUserPreference);

// PUT /api/preferences or /api/preference
router.put('/', updateUserPreference);

// PATCH /api/preferences or /api/preference
router.patch('/', updateUserPreference);

// DELETE /api/preferences or /api/preference
router.delete('/', deleteUserPreference);

export default router;
