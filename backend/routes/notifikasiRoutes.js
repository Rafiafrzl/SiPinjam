import express from 'express';
import {
  getNotifikasiUser,
  markAsRead,
  markAllAsRead,
  deleteNotifikasi,
  bulkDeleteNotifikasi
} from '../controllers/notifikasiController.js';
import { verifikasiToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifikasiToken, getNotifikasiUser);
router.put('/:id/read', verifikasiToken, markAsRead);
router.put('/read-all', verifikasiToken, markAllAsRead);
router.delete('/bulk', verifikasiToken, bulkDeleteNotifikasi);
router.delete('/:id', verifikasiToken, deleteNotifikasi);

export default router;
