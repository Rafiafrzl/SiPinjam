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

router.get('/', verifikasiToken, getAllBarang);
router.get('/:id', verifikasiToken, getBarangById);
router.get('/kategori/:kategori', verifikasiToken, getBarangByKategori);

router.post('/', verifikasiToken, checkAdmin, handleUpload, createBarang);
router.put('/:id', verifikasiToken, checkAdmin, handleUpload, updateBarang);
router.delete('/:id', verifikasiToken, checkAdmin, deleteBarang);

export default router;
