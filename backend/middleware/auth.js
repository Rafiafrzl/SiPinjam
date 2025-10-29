import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware untuk verifikasi token
const verifikasiToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan atau tidak aktif.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid.'
    });
  }
};

// Middleware untuk cek role admin
const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang dapat mengakses.'
    });
  }
  next();
};

// Middleware untuk cek role user
const checkUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya user yang dapat mengakses.'
    });
  }
  next();
};

export { verifikasiToken, checkAdmin, checkUser };
