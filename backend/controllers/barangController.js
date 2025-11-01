import Barang from '../models/Barang.js';
import fs from 'fs';
import path from 'path';

// Get semua barang (untuk user & admin)
const getAllBarang = async (req, res) => {
  try {
    const { kategori, search } = req.query;
    let query = { isActive: true };

    // Filter berdasarkan kategori
    if (kategori) {
      query.kategori = kategori;
    }

    // Search by nama barang
    if (search) {
      query.namaBarang = { $regex: search, $options: 'i' };
    }

    const barang = await Barang.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: barang.length,
      data: barang
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get barang by ID
const getBarangById = async (req, res) => {
  try {
    const barang = await Barang.findById(req.params.id);

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: barang
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get barang berdasarkan kategori
const getBarangByKategori = async (req, res) => {
  try {
    const { kategori } = req.params;

    const barang = await Barang.find({
      kategori,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: barang.length,
      data: barang
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create barang baru (admin only)
const createBarang = async (req, res) => {
  try {
    const { namaBarang, kategori, deskripsi, jumlahTotal, kondisi, lokasi } = req.body;

    const barang = await Barang.create({
      namaBarang,
      kategori,
      deskripsi,
      foto: req.file ? req.file.filename : 'default-barang.jpg',
      jumlahTotal,
      jumlahTersedia: jumlahTotal,
      kondisi,
      lokasi
    });

    res.status(201).json({
      success: true,
      message: 'Barang berhasil ditambahkan',
      data: barang
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update barang (admin only)
const updateBarang = async (req, res) => {
  try {
    const barang = await Barang.findById(req.params.id);

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }

    // Jika ada foto baru, hapus foto lama
    if (req.file && barang.foto !== 'default-barang.jpg') {
      const oldPhotoPath = path.join(process.cwd(), 'uploads', barang.foto);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    const updateData = {
      namaBarang: req.body.namaBarang || barang.namaBarang,
      kategori: req.body.kategori || barang.kategori,
      deskripsi: req.body.deskripsi || barang.deskripsi,
      jumlahTotal: req.body.jumlahTotal || barang.jumlahTotal,
      kondisi: req.body.kondisi || barang.kondisi,
      lokasi: req.body.lokasi || barang.lokasi
    };

    if (req.file) {
      updateData.foto = req.file.filename;
    }

    // Update jumlah tersedia jika jumlah total berubah
    if (req.body.jumlahTotal) {
      const selisih = req.body.jumlahTotal - barang.jumlahTotal;
      updateData.jumlahTersedia = barang.jumlahTersedia + selisih;
    }

    const updatedBarang = await Barang.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Barang berhasil diupdate',
      data: updatedBarang
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete barang (soft delete - admin only)
const deleteBarang = async (req, res) => {
  try {
    const barang = await Barang.findById(req.params.id);

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }

    // Soft delete
    barang.isActive = false;
    await barang.save();

    res.json({
      success: true,
      message: 'Barang berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export {
  getAllBarang,
  getBarangById,
  getBarangByKategori,
  createBarang,
  updateBarang,
  deleteBarang
};
