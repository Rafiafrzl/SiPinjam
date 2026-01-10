import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, changePassword } from '../controllers/authController.js';
import { verifikasiToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', verifikasiToken, getProfile);
router.put('/profile', verifikasiToken, updateProfile);
router.put('/change-password', verifikasiToken, changePassword);

export default router;
