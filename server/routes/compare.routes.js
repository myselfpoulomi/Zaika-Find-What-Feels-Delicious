import { Router } from 'express';
import {
  getComparison,
  saveComparison,
  clearComparison,
} from '../controllers/compare.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

// All compare operations require user authentication to ensure each user gets their own separate list
router.get('/', authenticateUser, getComparison);
router.post('/', authenticateUser, saveComparison);
router.put('/', authenticateUser, saveComparison);
router.delete('/', authenticateUser, clearComparison);

export default router;
