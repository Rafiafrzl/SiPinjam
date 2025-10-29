import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Register user baru
const registerUser = async (req, res) => {
  try {
    const { nama, email, password, kelas, noTelepon } = req.body;

    // Cek apakah email sudah terdaftar
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Buat user baru
    const user = await User.create({
      nama,
      email,
      password,
      kelas,
      noTelepon,
      role: 'user'
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          id: user._id,
          nama: user.nama,
          email: user.email,
          kelas: user.kelas,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login user/admin
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Cek password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Cek apakah user aktif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda tidak aktif. Hubungi admin.'
      });
    }

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        id: user._id,
        nama: user.nama,
        email: user.email,
        kelas: user.kelas,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get profile user yang sedang login
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update profile user
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.nama = req.body.nama || user.nama;
      user.kelas = req.body.kelas || user.kelas;
      user.noTelepon = req.body.noTelepon || user.noTelepon;

      // Update password jika ada
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: 'Profile berhasil diupdate',
        data: {
          id: updatedUser._id,
          nama: updatedUser.nama,
          email: updatedUser.email,
          kelas: updatedUser.kelas,
          noTelepon: updatedUser.noTelepon,
          role: updatedUser.role
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export { registerUser, loginUser, getProfile, updateProfile };
