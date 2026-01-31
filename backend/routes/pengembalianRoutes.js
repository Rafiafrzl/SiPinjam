import express from 'express';
import * as pengembalianController from '../controllers/pengembalianController.js';
import { verifikasiToken, checkAdmin, checkUser } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// User routes - harus login
router.post('/', verifikasiToken, checkUser, upload.single('foto'), pengembalianController.createPengembalian);
router.get('/my', verifikasiToken, checkUser, pengembalianController.getPengembalianByUser);
router.get('/:id', verifikasiToken, pengembalianController.getPengembalianById);
router.get('/peminjaman/:peminjamanId', verifikasiToken, pengembalianController.getPengembalianByPeminjamanId);

// Admin routes - harus login dan role admin
router.get('/', verifikasiToken, checkAdmin, pengembalianController.getAllPengembalian);
router.put('/:id/verifikasi', verifikasiToken, checkAdmin, pengembalianController.verifikasiPengembalian);

export default router;
