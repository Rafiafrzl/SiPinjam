import Notifikasi from '../models/Notifikasi.js';

// Get notifikasi user yang login
const getNotifikasiUser = async (req, res) => {
  try {
    const { isRead } = req.query;
    let query = { userId: req.user._id };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifikasi = await Notifikasi.find(query)
      .populate('peminjamanId', 'status')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notifikasi.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      count: notifikasi.length,
      unreadCount,
      data: notifikasi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Tandai notifikasi sebagai sudah dibaca
const markAsRead = async (req, res) => {
  try {
    const notifikasi = await Notifikasi.findById(req.params.id);

    if (!notifikasi) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan'
      });
    }

    // Cek authorization
    if (notifikasi.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke notifikasi ini'
      });
    }

    notifikasi.isRead = true;
    await notifikasi.save();

    res.json({
      success: true,
      message: 'Notifikasi ditandai sebagai sudah dibaca',
      data: notifikasi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Tandai semua notifikasi sebagai sudah dibaca
const markAllAsRead = async (req, res) => {
  try {
    await Notifikasi.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Semua notifikasi ditandai sebagai sudah dibaca'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Hapus notifikasi
const deleteNotifikasi = async (req, res) => {
  try {
    const notifikasi = await Notifikasi.findById(req.params.id);

    if (!notifikasi) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan'
      });
    }

    // Cek authorization
    if (notifikasi.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke notifikasi ini'
      });
    }

    await notifikasi.deleteOne();

    res.json({
      success: true,
      message: 'Notifikasi berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Hapus banyak notifikasi sekaligus
const bulkDeleteNotifikasi = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs notifikasi tidak valid'
      });
    }

    // Hapus hanya notifikasi milik user yang login
    const result = await Notifikasi.deleteMany({
      _id: { $in: ids },
      userId: req.user._id
    });

    res.json({
      success: true,
      message: `${result.deletedCount} notifikasi berhasil dihapus`,
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
  getNotifikasiUser,
  markAsRead,
  markAllAsRead,
  deleteNotifikasi,
  bulkDeleteNotifikasi
};
