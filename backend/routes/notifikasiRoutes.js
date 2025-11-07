import express from 'express';
import {
  getNotifikasiUser,
  markAsRead,
  markAllAsRead,
  deleteNotifikasi
} from '../controllers/notifikasiController.js';
import { verifikasiToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifikasiToken, getNotifikasiUser);
router.put('/:id/read', verifikasiToken, markAsRead);
router.put('/read-all', verifikasiToken, markAllAsRead);
router.delete('/:id', verifikasiToken, deleteNotifikasi);

export default router;
