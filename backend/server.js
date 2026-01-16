import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDatabase from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import barangRoutes from './routes/barangRoutes.js';
import peminjamanRoutes from './routes/peminjamanRoutes.js';
import pengembalianRoutes from './routes/pengembalianRoutes.js';
import notifikasiRoutes from './routes/notifikasiRoutes.js';
import statistikRoutes from './routes/statistikRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect Database
connectDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder untuk uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api/pengembalian', pengembalianRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/statistik', statistikRoutes);
app.use('/api/users', userRoutes);

// Welcome route
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

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});
