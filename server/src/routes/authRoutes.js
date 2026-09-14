import { Router } from 'express';
import {
  register,
  login,
  getMe,
  logout,
  googleAuth,
  googleCallback
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public Authentication Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Google OAuth Boundaries
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Protected Authentication Endpoints
router.get('/me', requireAuth, getMe);

export default router;
