import express from 'express';
import {
  createPeminjaman,
  getPeminjamanUser,
  getRiwayatPeminjaman,
  getPeminjamanById,
  getAllPeminjaman,
  approvePeminjaman,
  rejectPeminjaman,
  markAsReturned,
  submitReturn,
  verifyReturn,
  bulkDeletePeminjaman
} from '../controllers/peminjamanController.js';
import { verifikasiToken, checkAdmin, checkUser } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// User routes
router.post('/', verifikasiToken, checkUser, createPeminjaman);
router.get('/user/my-peminjaman', verifikasiToken, checkUser, getPeminjamanUser);
router.get('/user/riwayat', verifikasiToken, checkUser, getRiwayatPeminjaman);
router.put('/user/:id/submit-return', verifikasiToken, checkUser, upload.single('foto'), submitReturn);

// Admin routes
router.get('/admin/all', verifikasiToken, checkAdmin, getAllPeminjaman);
router.put('/admin/:id/approve', verifikasiToken, checkAdmin, approvePeminjaman);
router.put('/admin/:id/reject', verifikasiToken, checkAdmin, rejectPeminjaman);
router.put('/admin/:id/return', verifikasiToken, checkAdmin, markAsReturned);
router.put('/admin/:id/verify-return', verifikasiToken, checkAdmin, verifyReturn);
router.delete('/admin/bulk-delete', verifikasiToken, checkAdmin, bulkDeletePeminjaman);

// Shared routes (user & admin)
router.get('/:id', verifikasiToken, getPeminjamanById);

export default router;
