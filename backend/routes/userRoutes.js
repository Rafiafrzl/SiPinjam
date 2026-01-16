import express from 'express';
import { getAllUsers, getUserById, toggleUserStatus, deleteUser } from '../controllers/userController.js';
import { verifikasiToken, checkAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.get('/', verifikasiToken, checkAdmin, getAllUsers);
router.get('/:id', verifikasiToken, checkAdmin, getUserById);
router.put('/:id/toggle-status', verifikasiToken, checkAdmin, toggleUserStatus);
router.delete('/:id', verifikasiToken, checkAdmin, deleteUser);

export default router;
