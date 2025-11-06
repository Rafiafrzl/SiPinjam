import express from 'express';
import {
  createPeminjaman,
  getPeminjamanUser,
  getRiwayatPeminjaman,
  getPeminjamanById,
  getAllPeminjaman,
  approvePeminjaman,
  rejectPeminjaman,
  markAsReturned
} from '../controllers/peminjamanController.js';
import { verifikasiToken, checkAdmin, checkUser } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', verifikasiToken, checkUser, createPeminjaman);
router.get('/user/my-peminjaman', verifikasiToken, checkUser, getPeminjamanUser);
router.get('/user/riwayat', verifikasiToken, checkUser, getRiwayatPeminjaman);

// Admin routes
router.get('/admin/all', verifikasiToken, checkAdmin, getAllPeminjaman);
router.put('/admin/:id/approve', verifikasiToken, checkAdmin, approvePeminjaman);
router.put('/admin/:id/reject', verifikasiToken, checkAdmin, rejectPeminjaman);
router.put('/admin/:id/return', verifikasiToken, checkAdmin, markAsReturned);

// Shared routes (user & admin)
router.get('/:id', verifikasiToken, getPeminjamanById);

export default router;
