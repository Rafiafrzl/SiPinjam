import mongoose from 'mongoose';

const notifikasiSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  peminjamanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Peminjaman'
  },
  judul: {
    type: String,
    required: true,
    trim: true
  },
  pesan: {
    type: String,
    required: true
  },
  tipe: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'notifikasi'
});

// Index untuk query notifikasi user
notifikasiSchema.index({ userId: 1, isRead: 1 });
notifikasiSchema.index({ createdAt: -1 });

const Notifikasi = mongoose.model('Notifikasi', notifikasiSchema);

export default Notifikasi;
