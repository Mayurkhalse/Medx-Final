import { Router } from 'express';
import {
  register,
  login,
  getMe,
  logout,
  googleAuth,
  googleCallback,
  updateProfile,
  deleteAccount
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

// Protected Authentication & Profile Management Endpoints
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.post('/delete-account', requireAuth, deleteAccount);

export default router;
