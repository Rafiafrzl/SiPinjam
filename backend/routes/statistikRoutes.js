import express from 'express';
import { getStatistikAdmin, getStatistikUser } from '../controllers/statistikController.js';
import { verifikasiToken, checkAdmin, checkUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', verifikasiToken, checkAdmin, getStatistikAdmin);
router.get('/user', verifikasiToken, checkUser, getStatistikUser);

export default router;
