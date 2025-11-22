import Barang from "../models/Barang.js";
import Peminjaman from "../models/Peminjaman.js";
import fs from "fs";
import path from "path";

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
      query.namaBarang = { $regex: search, $options: "i" };
    }

    const barang = await Barang.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: barang.length,
      data: barang,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Barang tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: barang,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get barang berdasarkan kategori
const getBarangByKategori = async (req, res) => {
  try {
    const { kategori } = req.params;

    const barang = await Barang.find({
      kategori,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: barang.length,
      data: barang,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create barang baru (admin only)
const createBarang = async (req, res) => {
  try {
    const { namaBarang, kategori, deskripsi, jumlahTotal, kondisi, lokasi } =
      req.body;

    console.log("Creating barang with data:", {
      namaBarang,
      kategori,
      deskripsi,
      jumlahTotal,
      kondisi,
      lokasi,
      hasFile: !!req.file,
    });

    const barang = await Barang.create({
      namaBarang,
      kategori,
      deskripsi: deskripsi || "",
      foto: req.file ? req.file.filename : "default-barang.jpg",
      jumlahTotal: parseInt(jumlahTotal) || 0,
      jumlahTersedia: parseInt(jumlahTotal) || 0,
      kondisi,
      lokasi,
    });

    res.status(201).json({
      success: true,
      message: "Barang berhasil ditambahkan",
      data: barang,
    });
  } catch (error) {
    console.error("Error creating barang:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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
        message: "Barang tidak ditemukan",
      });
    }

    // Jika ada foto baru, hapus foto lama
    if (req.file && barang.foto !== "default-barang.jpg") {
      const oldPhotoPath = path.join(process.cwd(), "uploads", barang.foto);
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
      lokasi: req.body.lokasi || barang.lokasi,
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
      message: "Barang berhasil diupdate",
      data: updatedBarang,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete barang (hard delete - admin only)
const deleteBarang = async (req, res) => {
  try {
    const barang = await Barang.findById(req.params.id);

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan",
      });
    }

    // Cek apakah ada peminjaman yang masih aktif (Menunggu/Disetujui)
    const activePeminjaman = await Peminjaman.find({
      barangId: req.params.id,
      status: { $in: ['Menunggu', 'Disetujui'] }
    });

    if (activePeminjaman.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus barang. Masih ada ${activePeminjaman.length} peminjaman yang aktif.`,
      });
    }

    // Hapus semua peminjaman terkait (yang sudah selesai/ditolak)
    await Peminjaman.deleteMany({ barangId: req.params.id });

    // Hapus foto barang jika bukan default
    if (barang.foto && barang.foto !== "default-barang.jpg") {
      try {
        const photoPath = path.join(process.cwd(), "uploads", barang.foto);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      } catch (fileError) {
        console.warn("Gagal menghapus foto barang:", fileError.message);
        // Lanjutkan proses penghapusan meskipun foto gagal dihapus
      }
    }

    // Hard delete barang
    await Barang.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Barang dan semua data terkait berhasil dihapus permanen",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getAllBarang,
  getBarangById,
  getBarangByKategori,
  createBarang,
  updateBarang,
  deleteBarang,
};
