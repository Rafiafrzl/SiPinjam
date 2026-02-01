import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDatabase from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import barangRoutes from './routes/barangRoutes.js';
import peminjamanRoutes from './routes/peminjamanRoutes.js';
import pengembalianRoutes from './routes/pengembalianRoutes.js';
import notifikasiRoutes from './routes/notifikasiRoutes.js';
import statistikRoutes from './routes/statistikRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

connectDatabase();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api/pengembalian', pengembalianRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/statistik', statistikRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to API Peminjaman Barang Sekolah',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      barang: '/api/barang',
      peminjaman: '/api/peminjaman',
      pengembalian: '/api/pengembalian',
      notifikasi: '/api/notifikasi',
      statistik: '/api/statistik'
    }
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});

export default app;
