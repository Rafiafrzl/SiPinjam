import express from 'express';
import {
  getAllBarang,
  getBarangById,
  getBarangByKategori,
  createBarang,
  updateBarang,
  deleteBarang
} from '../controllers/barangController.js';
import { verifikasiToken, checkAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public & User routes
router.get('/', verifikasiToken, getAllBarang);
router.get('/:id', verifikasiToken, getBarangById);
router.get('/kategori/:kategori', verifikasiToken, getBarangByKategori);

// Admin only routes
router.post('/', verifikasiToken, checkAdmin, upload.single('foto'), createBarang);
router.put('/:id', verifikasiToken, checkAdmin, upload.single('foto'), updateBarang);
router.delete('/:id', verifikasiToken, checkAdmin, deleteBarang);

export default router;
