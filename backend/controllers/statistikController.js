import Peminjaman from '../models/Peminjaman.js';
import Barang from '../models/Barang.js';
import User from '../models/User.js';

// Get statistik untuk admin dashboard
const getStatistikAdmin = async (req, res) => {
  try {
    // Total barang
    const totalBarang = await Barang.countDocuments({ isActive: true });
    const totalBarangElektronik = await Barang.countDocuments({ kategori: 'elektronik', isActive: true });
    const totalBarangOlahraga = await Barang.countDocuments({ kategori: 'olahraga', isActive: true });

    // Total user
    const totalUser = await User.countDocuments({ role: 'user', isActive: true });

    // Dapatkan semua ID barang yang aktif
    const activeBarangIds = await Barang.find({ isActive: true }).distinct('_id');

    // Statistik peminjaman (hanya untuk barang yang masih aktif)
    const totalPeminjaman = await Peminjaman.countDocuments({ barangId: { $in: activeBarangIds } });
    const peminjamanMenunggu = await Peminjaman.countDocuments({
      barangId: { $in: activeBarangIds },
      status: 'menunggu'
    });
    const peminjamanDisetujui = await Peminjaman.countDocuments({
      barangId: { $in: activeBarangIds },
      status: 'disetujui'
    });
    const peminjamanDitolak = await Peminjaman.countDocuments({
      barangId: { $in: activeBarangIds },
      status: 'ditolak'
    });
    const peminjamanSelesai = await Peminjaman.countDocuments({
      barangId: { $in: activeBarangIds },
      status: 'selesai'
    });

    // Barang sedang dipinjam
    const barangDipinjam = await Peminjaman.countDocuments({
      barangId: { $in: activeBarangIds },
      status: 'disetujui',
      statusPengembalian: 'belum-kembali'
    });

    // Pengembalian terlambat
    const pengembalianTerlambat = await Peminjaman.countDocuments({
      barangId: { $in: activeBarangIds },
      statusPengembalian: 'terlambat'
    });

    // Peminjaman terbaru (5 terakhir)
    const peminjamanTerbaru = await Peminjaman.find()
      .populate('userId', 'nama kelas')
      .populate({
        path: 'barangId',
        match: { isActive: true },
        select: 'namaBarang kategori'
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Filter peminjaman yang barangnya masih aktif
    const peminjamanTerbaruFiltered = peminjamanTerbaru.filter(p => p.barangId !== null);

    // Barang paling sering dipinjam
    const barangPopular = await Peminjaman.aggregate([
      { $match: { status: { $in: ['disetujui', 'selesai'] } } },
      {
        $group: {
          _id: '$barangId',
          totalPeminjaman: { $sum: 1 }
        }
      },
      { $sort: { totalPeminjaman: -1 } },
      { $limit: 10 }
    ]);

    // Populate barang info dengan filter isActive
    const barangPopularDetails = await Barang.populate(barangPopular, {
      path: '_id',
      match: { isActive: true },
      select: 'namaBarang kategori foto'
    });

    // Filter hasil yang barangnya masih aktif dan batasi ke 5 teratas
    const barangPopularFiltered = barangPopularDetails
      .filter(item => item._id !== null)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        barang: {
          total: totalBarang,
          elektronik: totalBarangElektronik,
          olahraga: totalBarangOlahraga
        },
        user: {
          total: totalUser
        },
        peminjaman: {
          total: totalPeminjaman,
          menunggu: peminjamanMenunggu,
          disetujui: peminjamanDisetujui,
          ditolak: peminjamanDitolak,
          selesai: peminjamanSelesai
        },
        aktivitas: {
          sedangDipinjam: barangDipinjam,
          terlambat: pengembalianTerlambat
        },
        peminjamanTerbaru: peminjamanTerbaruFiltered,
        barangPopular: barangPopularFiltered
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get statistik untuk user dashboard
const getStatistikUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Dapatkan semua ID barang yang aktif
    const activeBarangIds = await Barang.find({ isActive: true }).distinct('_id');

    // Total peminjaman user (hanya untuk barang yang masih aktif)
    const totalPeminjaman = await Peminjaman.countDocuments({
      userId,
      barangId: { $in: activeBarangIds }
    });
    const peminjamanMenunggu = await Peminjaman.countDocuments({
      userId,
      barangId: { $in: activeBarangIds },
      status: 'menunggu'
    });
    const peminjamanDisetujui = await Peminjaman.countDocuments({
      userId,
      barangId: { $in: activeBarangIds },
      status: 'disetujui'
    });
    const peminjamanDitolak = await Peminjaman.countDocuments({
      userId,
      barangId: { $in: activeBarangIds },
      status: 'ditolak'
    });
    const peminjamanSelesai = await Peminjaman.countDocuments({
      userId,
      barangId: { $in: activeBarangIds },
      status: 'selesai'
    });

    // Peminjaman aktif (sedang dipinjam)
    const peminjamanAktif = await Peminjaman.countDocuments({
      userId,
      barangId: { $in: activeBarangIds },
      status: 'disetujui',
      statusPengembalian: 'belum-kembali'
    });

    res.json({
      success: true,
      data: {
        total: totalPeminjaman,
        menunggu: peminjamanMenunggu,
        disetujui: peminjamanDisetujui,
        ditolak: peminjamanDitolak,
        selesai: peminjamanSelesai,
        aktif: peminjamanAktif
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export { getStatistikAdmin, getStatistikUser };
