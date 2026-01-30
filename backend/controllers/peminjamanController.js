import Peminjaman from '../models/Peminjaman.js';
import Barang from '../models/Barang.js';
import Notifikasi from '../models/Notifikasi.js';

// Buat peminjaman baru (user)
const createPeminjaman = async (req, res) => {
  try {
    const { barangId, jumlahPinjam, tanggalPinjam, tanggalKembali, waktuPinjam, alasanPeminjaman } = req.body;

    // Cek ketersediaan barang
    const barang = await Barang.findById(barangId);

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }

    if (barang.jumlahTersedia < jumlahPinjam) {
      return res.status(400).json({
        success: false,
        message: `Barang tidak tersedia. Tersisa ${barang.jumlahTersedia} unit`
      });
    }

    // Buat peminjaman
    const peminjaman = await Peminjaman.create({
      userId: req.user._id,
      barangId,
      jumlahPinjam,
      tanggalPinjam,
      tanggalKembali,
      waktuPinjam,
      alasanPeminjaman
    });

    // Kurangi jumlah tersedia
    barang.jumlahTersedia -= jumlahPinjam;
    await barang.save();

    // Buat notifikasi
    await Notifikasi.create({
      userId: req.user._id,
      peminjamanId: peminjaman._id,
      judul: 'Peminjaman Berhasil Diajukan',
      pesan: `Peminjaman ${barang.namaBarang} sebanyak ${jumlahPinjam} unit telah diajukan. Menunggu persetujuan admin.`,
      tipe: 'info'
    });

    const peminjamanData = await Peminjaman.findById(peminjaman._id)
      .populate('userId', 'nama email kelas')
      .populate('barangId', 'namaBarang kategori foto');

    res.status(201).json({
      success: true,
      message: 'Peminjaman berhasil diajukan',
      data: peminjamanData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get peminjaman user yang login
const getPeminjamanUser = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    const peminjaman = await Peminjaman.find(query)
      .populate({
        path: 'barangId',
        match: { isActive: true }, // Hanya populate barang yang masih aktif
        select: 'namaBarang kategori foto'
      })
      .sort({ createdAt: -1 });

    // Filter peminjaman yang barang-nya sudah dihapus
    const filteredPeminjaman = peminjaman.filter(p => p.barangId !== null);

    res.json({
      success: true,
      count: filteredPeminjaman.length,
      data: filteredPeminjaman
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get riwayat peminjaman user
const getRiwayatPeminjaman = async (req, res) => {
  try {
    const peminjaman = await Peminjaman.find({
      userId: req.user._id,
      status: { $in: ['Disetujui', 'Ditolak', 'Selesai'] }
    })
      .populate({
        path: 'barangId',
        match: { isActive: true }, // Hanya populate barang yang masih aktif
        select: 'namaBarang kategori foto'
      })
      .sort({ createdAt: -1 });

    // Filter peminjaman yang barang-nya sudah dihapus
    const filteredPeminjaman = peminjaman.filter(p => p.barangId !== null);

    res.json({
      success: true,
      count: filteredPeminjaman.length,
      data: filteredPeminjaman
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get detail peminjaman by ID
const getPeminjamanById = async (req, res) => {
  try {
    const peminjaman = await Peminjaman.findById(req.params.id)
      .populate('userId', 'nama email kelas noTelepon')
      .populate('barangId', 'namaBarang kategori foto deskripsi')
      .populate('disetujuiOleh', 'nama email');

    if (!peminjaman) {
      return res.status(404).json({
        success: false,
        message: 'Peminjaman tidak ditemukan'
      });
    }

    // Cek authorization
    if (req.user.role === 'user' && peminjaman.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke peminjaman ini'
      });
    }

    res.json({
      success: true,
      data: peminjaman
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get semua peminjaman (admin)
const getAllPeminjaman = async (req, res) => {
  try {
    const { status, kategori } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const peminjaman = await Peminjaman.find(query)
      .populate('userId', 'nama email kelas noTelepon')
      .populate({
        path: 'barangId',
        match: { isActive: true }, // Hanya populate barang yang masih aktif
        select: 'namaBarang kategori foto'
      })
      .sort({ createdAt: -1 });

    // Filter peminjaman yang barang-nya sudah dihapus (null setelah populate dengan match)
    let filteredPeminjaman = peminjaman.filter(p => p.barangId !== null);

    // Filter by kategori barang jika ada
    if (kategori) {
      filteredPeminjaman = filteredPeminjaman.filter(p => p.barangId.kategori === kategori);
    }

    res.json({
      success: true,
      count: filteredPeminjaman.length,
      data: filteredPeminjaman
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Approve peminjaman (admin)
const approvePeminjaman = async (req, res) => {
  try {
    const { catatanAdmin } = req.body;
    const peminjaman = await Peminjaman.findById(req.params.id).populate('barangId userId');

    if (!peminjaman) {
      return res.status(404).json({
        success: false,
        message: 'Peminjaman tidak ditemukan'
      });
    }

    // Cek apakah barang masih ada dan aktif
    if (!peminjaman.barangId || !peminjaman.barangId.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Barang telah dihapus dan tidak dapat disetujui'
      });
    }

    // Handle kapitalisasi status (case-insensitive)
    if (peminjaman.status && peminjaman.status !== 'Menunggu') {
      return res.status(400).json({
        success: false,
        message: 'Peminjaman sudah diproses sebelumnya'
      });
    }

    peminjaman.status = 'Disetujui';
    peminjaman.catatanAdmin = catatanAdmin;
    peminjaman.disetujuiOleh = req.user._id;
    peminjaman.tanggalDisetujui = new Date();

    await peminjaman.save();

    // Buat notifikasi untuk user
    await Notifikasi.create({
      userId: peminjaman.userId._id,
      peminjamanId: peminjaman._id,
      judul: 'Peminjaman Disetujui',
      pesan: `Peminjaman ${peminjaman.barangId.namaBarang} Anda telah disetujui! ${catatanAdmin ? `Catatan: ${catatanAdmin}` : ''}`,
      tipe: 'success'
    });

    res.json({
      success: true,
      message: 'Peminjaman berhasil disetujui',
      data: peminjaman
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reject peminjaman (admin)
const rejectPeminjaman = async (req, res) => {
  try {
    const { alasanPenolakan } = req.body;
    const peminjaman = await Peminjaman.findById(req.params.id).populate('barangId userId');

    if (!peminjaman) {
      return res.status(404).json({
        success: false,
        message: 'Peminjaman tidak ditemukan'
      });
    }

    // Cek apakah barang masih ada dan aktif
    if (!peminjaman.barangId || !peminjaman.barangId.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Barang telah dihapus. Peminjaman akan ditolak otomatis.'
      });
    }

    // Handle kapitalisasi status (case-insensitive)
    if (peminjaman.status && peminjaman.status !== 'Menunggu') {
      return res.status(400).json({
        success: false,
        message: 'Peminjaman sudah diproses sebelumnya'
      });
    }

    peminjaman.status = 'Ditolak';
    peminjaman.alasanPenolakan = alasanPenolakan;
    peminjaman.disetujuiOleh = req.user._id;

    await peminjaman.save();

    // Kembalikan jumlah tersedia barang
    const barang = await Barang.findById(peminjaman.barangId);
    barang.jumlahTersedia += peminjaman.jumlahPinjam;
    await barang.save();

    // Buat notifikasi untuk user
    await Notifikasi.create({
      userId: peminjaman.userId._id,
      peminjamanId: peminjaman._id,
      judul: 'Peminjaman Ditolak',
      pesan: `Peminjaman ${peminjaman.barangId.namaBarang} Anda ditolak. Alasan: ${alasanPenolakan}`,
      tipe: 'error'
    });

    res.json({
      success: true,
      message: 'Peminjaman berhasil ditolak',
      data: peminjaman
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Tandai sebagai sudah dikembalikan (admin)
const markAsReturned = async (req, res) => {
  try {
    const peminjaman = await Peminjaman.findById(req.params.id).populate('barangId userId');

    if (!peminjaman) {
      return res.status(404).json({
        success: false,
        message: 'Peminjaman tidak ditemukan'
      });
    }

    if (peminjaman.status !== 'disetujui') {
      return res.status(400).json({
        success: false,
        message: 'Hanya peminjaman yang disetujui yang bisa dikembalikan'
      });
    }

    const today = new Date();
    const tanggalKembali = new Date(peminjaman.tanggalKembali);

    peminjaman.status = 'selesai';
    peminjaman.statusPengembalian = today > tanggalKembali ? 'terlambat' : 'sudah-kembali';
    peminjaman.tanggalDikembalikan = today;

    await peminjaman.save();

    // Kembalikan jumlah tersedia barang
    const barang = await Barang.findById(peminjaman.barangId);
    barang.jumlahTersedia += peminjaman.jumlahPinjam;
    await barang.save();

    // Buat notifikasi untuk user
    await Notifikasi.create({
      userId: peminjaman.userId._id,
      peminjamanId: peminjaman._id,
      judul: 'Pengembalian Dikonfirmasi',
      pesan: `Pengembalian ${peminjaman.barangId.namaBarang} telah dikonfirmasi. ${peminjaman.statusPengembalian === 'terlambat' ? 'Lain kali, mohon kembalikan tepat waktu ya.' : 'Terima kasih telah mengembalikan tepat waktu!'}`,
      tipe: peminjaman.statusPengembalian === 'terlambat' ? 'warning' : 'success'
    });

    res.json({
      success: true,
      message: 'Barang berhasil ditandai sebagai sudah dikembalikan',
      data: peminjaman
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// User submit permintaan pengembalian dengan kondisi dan foto
const submitReturn = async (req, res) => {
  try {
    const { kondisi } = req.body;
    const peminjaman = await Peminjaman.findById(req.params.id).populate('barangId userId');

    if (!peminjaman) {
      return res.status(404).json({
        success: false,
        message: 'Peminjaman tidak ditemukan'
      });
    }


    if (peminjaman.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk mengembalikan peminjaman ini'
      });
    }

    // Cek status hanya yang disetujui yang bisa dikembalikan
    if (peminjaman.status !== 'Disetujui') {
      return res.status(400).json({
        success: false,
        message: 'Hanya peminjaman yang disetujui yang bisa dikembalikan'
      });
    }

    // Cek apakah sudah pernah submit pengembalian
    if (peminjaman.statusPengembalian === 'Menunggu Verifikasi' || peminjaman.statusPengembalian === 'Sudah Dikembalikan') {
      return res.status(400).json({
        success: false,
        message: 'Pengembalian sudah diproses sebelumnya'
      });
    }


    // Simpan kondisi pengembalian
    peminjaman.kondisiPengembalian = kondisi;

    // Simpan foto jika ada - Cloudinary menggunakan req.file.path untuk URL
    if (req.file) {
      peminjaman.fotoPengembalian = req.file.path; // URL lengkap dari Cloudinary
    }

    // Update status pengembalian
    peminjaman.statusPengembalian = 'Menunggu Verifikasi';

    await peminjaman.save();

    // Buat notifikasi untuk user
    await Notifikasi.create({
      userId: peminjaman.userId._id,
      peminjamanId: peminjaman._id,
      judul: 'Permintaan Pengembalian Dikirim',
      pesan: `Permintaan pengembalian ${peminjaman.barangId.namaBarang} telah dikirim. Menunggu verifikasi admin.`,
      tipe: 'info'
    });

    res.json({
      success: true,
      message: 'Permintaan pengembalian berhasil dikirim',
      data: peminjaman
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin verifikasi permintaan pengembalian
const verifyReturn = async (req, res) => {
  try {
    const { statusVerifikasi, catatanAdmin, denda } = req.body;
    const peminjaman = await Peminjaman.findById(req.params.id).populate('barangId userId');

    if (!peminjaman) {
      return res.status(404).json({
        success: false,
        message: 'Peminjaman tidak ditemukan'
      });
    }

    // Cek apakah sudah menunggu verifikasi
    if (peminjaman.statusPengembalian !== 'Menunggu Verifikasi') {
      return res.status(400).json({
        success: false,
        message: 'Pengembalian ini tidak dalam status menunggu verifikasi'
      });
    }

    if (statusVerifikasi === 'Diterima') {
      // Terima pengembalian - kembalikan stok dan ubah status
      peminjaman.statusPengembalian = 'Sudah Dikembalikan';
      peminjaman.status = 'Selesai';

      // Simpan denda jika ada
      if (denda && denda > 0) {
        peminjaman.denda = denda;
      }

      // Kembalikan jumlah tersedia barang
      const barang = await Barang.findById(peminjaman.barangId);
      if (barang) {
        barang.jumlahTersedia += peminjaman.jumlahPinjam;
        await barang.save();
      }

      // Buat notifikasi untuk user
      let pesanNotif = `Pengembalian ${peminjaman.barangId.namaBarang} telah diterima dan diverifikasi.`;

      if (peminjaman.kondisiPengembalian === 'rusak ringan') {
        pesanNotif += ' ⚠️ Peringatan: Barang dikembalikan dalam kondisi rusak ringan. Harap lebih berhati-hati dalam menggunakan barang kedepannya.';
      } else if (peminjaman.kondisiPengembalian === 'rusak berat' && denda > 0) {
        pesanNotif += ` ❌ Barang dikembalikan dalam kondisi rusak berat. Denda: Rp ${denda.toLocaleString('id-ID')}`;
      }

      if (catatanAdmin) {
        pesanNotif += ` Catatan: ${catatanAdmin}`;
      }

      await Notifikasi.create({
        userId: peminjaman.userId._id,
        peminjamanId: peminjaman._id,
        judul: 'Pengembalian Diterima',
        pesan: pesanNotif,
        tipe: peminjaman.kondisiPengembalian === 'rusak berat' ? 'warning' : 'success'
      });
    } else if (statusVerifikasi === 'Ditolak') {
      // Tolak pengembalian - kembalikan status ke belum dikembalikan
      peminjaman.statusPengembalian = 'Belum Dikembalikan';

      // Buat notifikasi untuk user
      await Notifikasi.create({
        userId: peminjaman.userId._id,
        peminjamanId: peminjaman._id,
        judul: 'Pengembalian Ditolak',
        pesan: `Pengembalian ${peminjaman.barangId.namaBarang} ditolak. ${catatanAdmin ? `Alasan: ${catatanAdmin}` : 'Silakan ajukan kembali dengan data yang benar.'}`,
        tipe: 'error'
      });
    }

    if (catatanAdmin) {
      peminjaman.catatanAdmin = catatanAdmin;
    }

    await peminjaman.save();

    res.json({
      success: true,
      message: `Pengembalian berhasil ${statusVerifikasi.toLowerCase()}`,
      data: peminjaman
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk delete peminjaman (admin)
const bulkDeletePeminjaman = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs tidak valid'
      });
    }

    const result = await Peminjaman.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `Berhasil menghapus ${result.deletedCount} peminjaman`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export {
  createPeminjaman,
  getPeminjamanUser,
  getRiwayatPeminjaman,
  getPeminjamanById,
  getAllPeminjaman,
  approvePeminjaman,
  rejectPeminjaman,
  markAsReturned,
  submitReturn,
  verifyReturn,
  bulkDeletePeminjaman
};
