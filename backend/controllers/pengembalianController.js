import Pengembalian from '../models/Pengembalian.js';
import Peminjaman from '../models/Peminjaman.js';
import Barang from '../models/Barang.js';
import Notifikasi from '../models/Notifikasi.js';

// Create pengembalian (User mengembalikan barang)
const createPengembalian = async (req, res) => {
  try {
    const { peminjamanId, kondisiBarang, catatanPengembalian } = req.body;
    const userId = req.user._id;

    // Cek apakah peminjaman ada dan milik user ini
    const peminjaman = await Peminjaman.findById(peminjamanId).populate('barangId');
    if (!peminjaman) {
      return res.status(404).json({
        success: false,
        message: 'Peminjaman tidak ditemukan'
      });
    }

    if (peminjaman.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke peminjaman ini'
      });
    }

    if (peminjaman.status !== 'Disetujui') {
      return res.status(400).json({
        success: false,
        message: 'Hanya peminjaman yang disetujui yang bisa dikembalikan'
      });
    }

    // Cek apakah sudah ada pengembalian untuk peminjaman ini
    const existingPengembalian = await Pengembalian.findOne({ peminjamanId });
    if (existingPengembalian && existingPengembalian.statusVerifikasi !== 'Ditolak') {
      return res.status(400).json({
        success: false,
        message: 'Pengembalian untuk peminjaman ini sudah ada atau sedang diproses'
      });
    }

    // Buat pengembalian
    const pengembalian = new Pengembalian({
      peminjamanId,
      kondisiBarang: kondisiBarang.toLowerCase(),
      jumlahDikembalikan: peminjaman.jumlahPinjam,
      catatanPengembalian,
      dikembalikanOleh: userId
    });

    // Handle foto pengembalian
    if (req.file) {
      pengembalian.fotoPengembalian = req.file.path;
    }

    await pengembalian.save();

    // Update status peminjaman
    peminjaman.statusPengembalian = 'Menunggu Verifikasi';
    await peminjaman.save();

    // Buat notifikasi untuk user
    await Notifikasi.create({
      userId: userId,
      peminjamanId: peminjaman._id,
      judul: 'Permintaan Pengembalian Dikirim',
      pesan: `Permintaan pengembalian ${peminjaman.barangId.namaBarang} telah dikirim. Menunggu verifikasi admin.`,
      tipe: 'info'
    });

    res.status(201).json({
      success: true,
      message: 'Permintaan pengembalian berhasil dikirim',
      data: pengembalian
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verifikasi pengembalian (Admin)
const verifikasiPengembalian = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusVerifikasi, catatanAdmin, denda } = req.body;
    const adminId = req.user._id;

    const pengembalian = await Pengembalian.findById(id).populate('peminjamanId');
    if (!pengembalian) {
      return res.status(404).json({
        success: false,
        message: 'Pengembalian tidak ditemukan'
      });
    }

    if (pengembalian.statusVerifikasi !== 'Menunggu Verifikasi') {
      return res.status(400).json({
        success: false,
        message: 'Pengembalian sudah diverifikasi sebelumnya'
      });
    }

    pengembalian.statusVerifikasi = statusVerifikasi;
    pengembalian.catatanAdmin = catatanAdmin;
    pengembalian.diverifikasiOleh = adminId;

    if (denda) {
      pengembalian.denda = denda;
    }

    await pengembalian.save();

    const peminjaman = await Peminjaman.findById(pengembalian.peminjamanId).populate('barangId').populate({ path: 'userId', select: 'nama email kelas' });

    if (statusVerifikasi === 'Diterima') {
      // Update status di peminjaman
      peminjaman.statusPengembalian = 'Sudah Dikembalikan';
      peminjaman.status = 'Selesai';
      if (denda > 0) peminjaman.denda = denda;
      await peminjaman.save();

      // Kembalikan stok barang
      const barang = await Barang.findById(peminjaman.barangId);
      if (barang) {
        barang.jumlahTersedia += pengembalian.jumlahDikembalikan;
        await barang.save();
      }

      // Buat notifikasi untuk user
      let pesanNotif = `Pengembalian ${peminjaman.barangId.namaBarang} telah diterima dan diverifikasi.`;
      if (pengembalian.kondisiBarang === 'rusak ringan') {
        pesanNotif += ' ⚠️ Peringatan: Barang dikembalikan dalam kondisi rusak ringan.';
      } else if (pengembalian.kondisiBarang === 'rusak berat' && denda > 0) {
        pesanNotif += ` ❌ Barang dikembalikan dalam kondisi rusak berat. Denda: Rp ${denda.toLocaleString('id-ID')}`;
      }

      await Notifikasi.create({
        userId: pengembalian.dikembalikanOleh,
        peminjamanId: peminjaman._id,
        judul: 'Pengembalian Diterima',
        pesan: pesanNotif,
        tipe: pengembalian.kondisiBarang === 'rusak berat' ? 'warning' : 'success'
      });
    } else if (statusVerifikasi === 'Ditolak') {
      // Update status pengembalian di peminjaman agar bisa ajukan ulang
      peminjaman.statusPengembalian = 'Belum Dikembalikan';
      await peminjaman.save();

      // Buat notifikasi untuk user
      await Notifikasi.create({
        userId: pengembalian.dikembalikanOleh,
        peminjamanId: peminjaman._id,
        judul: 'Pengembalian Ditolak',
        pesan: `Pengembalian ${peminjaman.barangId.namaBarang} ditolak. ${catatanAdmin || 'Silakan ajukan kembali dengan data yang benar.'}`,
        tipe: 'error'
      });
    }

    res.json({
      success: true,
      message: `Pengembalian berhasil ${statusVerifikasi.toLowerCase()}`,
      data: pengembalian
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all pengembalian (Admin)
const getAllPengembalian = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) {
      query.statusVerifikasi = status;
    }

    const pengembalianList = await Pengembalian.find(query)
      .populate({
        path: 'peminjamanId',
        populate: {
          path: 'barangId userId',
          select: 'namaBarang nama email kelas'
        }
      })
      .populate('dikembalikanOleh', 'nama email kelas')
      .populate('diverifikasiOleh', 'nama email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Pengembalian.countDocuments(query);

    res.json({
      data: pengembalianList,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// Get pengembalian by user (User)
const getPengembalianByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pengembalianList = await Pengembalian.find({ dikembalikanOleh: userId })
      .populate({
        path: 'peminjamanId',
        populate: {
          path: 'barangId',
          select: 'namaBarang kategori foto'
        }
      })
      .populate('diverifikasiOleh', 'nama')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Pengembalian.countDocuments({ dikembalikanOleh: userId });

    res.json({
      data: pengembalianList,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// Get pengembalian by ID
const getPengembalianById = async (req, res) => {
  try {
    const { id } = req.params;

    const pengembalian = await Pengembalian.findById(id)
      .populate({
        path: 'peminjamanId',
        populate: {
          path: 'barangId userId',
          select: 'namaBarang kategori foto nama email kelas'
        }
      })
      .populate('dikembalikanOleh', 'nama email kelas noTelepon')
      .populate('diverifikasiOleh', 'nama email');

    if (!pengembalian) {
      return res.status(404).json({ message: 'Pengembalian tidak ditemukan' });
    }

    // Check authorization
    if (req.user.role !== 'admin' &&
      pengembalian.dikembalikanOleh._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke pengembalian ini' });
    }

    res.json({ data: pengembalian });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// Get pengembalian by peminjaman ID
const getPengembalianByPeminjamanId = async (req, res) => {
  try {
    const { peminjamanId } = req.params;

    const pengembalian = await Pengembalian.findOne({ peminjamanId })
      .populate('dikembalikanOleh', 'nama email')
      .populate('diverifikasiOleh', 'nama email');

    if (!pengembalian) {
      return res.status(404).json({ message: 'Pengembalian tidak ditemukan' });
    }

    res.json({ data: pengembalian });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

export {
  createPengembalian,
  verifikasiPengembalian,
  getAllPengembalian,
  getPengembalianByUser,
  getPengembalianById,
  getPengembalianByPeminjamanId
};
