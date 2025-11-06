import express from 'express';
import * as pengembalianController from '../controllers/pengembalianController.js';
import { verifikasiToken } from '../middleware/auth.js';

const router = express.Router();

// User routes - harus login
router.post('/', verifikasiToken, pengembalianController.createPengembalian);
router.get('/my', verifikasiToken, pengembalianController.getPengembalianByUser);
router.get('/:id', verifikasiToken, pengembalianController.getPengembalianById);
router.get('/peminjaman/:peminjamanId', verifikasiToken, pengembalianController.getPengembalianByPeminjamanId);

// Admin routes - harus login dan role admin
router.get('/', verifikasiToken, pengembalianController.getAllPengembalian);
router.put('/:id/verifikasi', verifikasiToken, pengembalianController.verifikasiPengembalian);

export default router;
