import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, changePassword } from '../controllers/authController.js';
import { verifikasiToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

const handleUpload = (req, res, next) => {
    upload.single('foto')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || err.name || 'Gagal upload file'
            });
        }
        next();
    });
};

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', verifikasiToken, getProfile);
router.put('/profile', verifikasiToken, handleUpload, updateProfile);
router.put('/change-password', verifikasiToken, changePassword);

export default router;
