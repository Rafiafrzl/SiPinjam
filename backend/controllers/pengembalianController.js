import Pengembalian from '../models/Pengembalian.js';
import Peminjaman from '../models/Peminjaman.js';
import Barang from '../models/Barang.js';
import Notifikasi from '../models/Notifikasi.js';

// Create pengembalian (User mengembalikan barang)
const createPengembalian = async (req, res) => {
  try {
    const { peminjamanId, kondisiBarang, jumlahDikembalikan, catatanPengembalian } = req.body;
    const userId = req.user.id;

    // Cek apakah peminjaman ada dan milik user ini
    const peminjaman = await Peminjaman.findById(peminjamanId).populate('barangId');
    if (!peminjaman) {
      return res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
    }

    if (peminjaman.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke peminjaman ini' });
    }

    if (peminjaman.status !== 'Disetujui') {
      return res.status(400).json({ message: 'Peminjaman belum disetujui' });
    }

    // Cek apakah sudah ada pengembalian untuk peminjaman ini
    const existingPengembalian = await Pengembalian.findOne({ peminjamanId });
    if (existingPengembalian) {
      return res.status(400).json({ message: 'Pengembalian untuk peminjaman ini sudah ada' });
    }

    // Validasi jumlah dikembalikan
    if (jumlahDikembalikan > peminjaman.jumlahPinjam) {
      return res.status(400).json({
        message: 'Jumlah yang dikembalikan melebihi jumlah yang dipinjam'
      });
    }

    // Hitung denda hanya jika kondisi rusak atau hilang (tidak ada denda untuk keterlambatan)
    let denda = 0;

    if (kondisiBarang === 'Rusak Ringan') {
      denda = 10000;
    } else if (kondisiBarang === 'Rusak Berat') {
      denda = 50000;
    } else if (kondisiBarang === 'Hilang') {
      denda = 100000;
    }

    // Buat pengembalian
    const pengembalian = new Pengembalian({
      peminjamanId,
      kondisiBarang,
      jumlahDikembalikan,
      catatanPengembalian,
      denda,
      dikembalikanOleh: userId
    });

    await pengembalian.save();

    // Update status peminjaman
    peminjaman.statusPengembalian = 'Menunggu Verifikasi';
    await peminjaman.save();

    // Buat notifikasi untuk admin
    await Notifikasi.create({
      userId: peminjaman.disetujuiOleh || peminjaman.userId, // Kirim ke admin yang approve
      peminjamanId,
      judul: 'Pengembalian Barang Baru',
      pesan: `User ${req.user.nama} telah mengembalikan ${peminjaman.barangId.namaBarang}. Mohon verifikasi.`,
      tipe: 'pengembalian'
    });

    res.status(201).json({
      message: 'Pengembalian berhasil dibuat. Menunggu verifikasi admin.',
      data: pengembalian
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// Verifikasi pengembalian (Admin)
const verifikasiPengembalian = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusVerifikasi, catatanAdmin } = req.body;
    const adminId = req.user.id;

    const pengembalian = await Pengembalian.findById(id).populate('peminjamanId');
    if (!pengembalian) {
      return res.status(404).json({ message: 'Pengembalian tidak ditemukan' });
    }

    if (pengembalian.statusVerifikasi !== 'Menunggu Verifikasi') {
      return res.status(400).json({ message: 'Pengembalian sudah diverifikasi' });
    }

    pengembalian.statusVerifikasi = statusVerifikasi;
    pengembalian.diverifikasiOleh = adminId;
    await pengembalian.save();

    const peminjaman = pengembalian.peminjamanId;

    if (statusVerifikasi === 'Diterima') {
      // Update status pengembalian di peminjaman
      peminjaman.statusPengembalian = 'Sudah Dikembalikan';
      await peminjaman.save();

      // Kembalikan stok barang
      const barang = await Barang.findById(peminjaman.barangId);
      if (barang) {
        barang.jumlahTersedia += pengembalian.jumlahDikembalikan;
        await barang.save();
      }

      // Buat notifikasi untuk user
      await Notifikasi.create({
        userId: pengembalian.dikembalikanOleh,
        peminjamanId: peminjaman._id,
        judul: 'Pengembalian Diterima',
        pesan: `Pengembalian barang Anda telah diterima${pengembalian.denda > 0 ? ` dengan denda Rp ${pengembalian.denda.toLocaleString('id-ID')}` : ''}.`,
        tipe: 'pengembalian'
      });
    } else if (statusVerifikasi === 'Ditolak') {
      // Update status pengembalian di peminjaman
      peminjaman.statusPengembalian = 'Dipinjam';
      await peminjaman.save();

      // Buat notifikasi untuk user
      await Notifikasi.create({
        userId: pengembalian.dikembalikanOleh,
        peminjamanId: peminjaman._id,
        judul: 'Pengembalian Ditolak',
        pesan: `Pengembalian barang Anda ditolak. ${catatanAdmin || 'Silakan hubungi admin.'}`,
        tipe: 'pengembalian'
      });
    }

    res.json({
      message: `Pengembalian berhasil ${statusVerifikasi.toLowerCase()}`,
      data: pengembalian
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
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
          select: 'namaBarang nama email'
        }
      })
      .populate('dikembalikanOleh', 'nama email')
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
