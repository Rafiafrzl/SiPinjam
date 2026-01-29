import mongoose from 'mongoose';

const peminjamanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  barangId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barang',
    required: true
  },
  jumlahPinjam: {
    type: Number,
    required: [true, 'Jumlah pinjam harus diisi'],
    min: 1
  },
  tanggalPinjam: {
    type: Date,
    required: [true, 'Tanggal pinjam harus diisi']
  },
  tanggalKembali: {
    type: Date,
    required: [true, 'Tanggal kembali harus diisi']
  },
  waktuPinjam: {
    type: String,
    required: [true, 'Waktu pinjam harus diisi']
  },
  alasanPeminjaman: {
    type: String,
    required: [true, 'Alasan peminjaman harus diisi'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Menunggu', 'Disetujui', 'Ditolak', 'Selesai'],
    default: 'Menunggu'
  },
  statusPengembalian: {
    type: String,
    enum: ['Belum Dikembalikan', 'Menunggu Verifikasi', 'Sudah Dikembalikan'],
    default: 'Belum Dikembalikan'
  },
  catatanAdmin: {
    type: String,
    trim: true
  },
  alasanPenolakan: {
    type: String,
    trim: true
  },
  disetujuiOleh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tanggalDisetujui: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'peminjaman'
});

// Index untuk query yang sering digunakan
peminjamanSchema.index({ userId: 1, status: 1 });
peminjamanSchema.index({ barangId: 1, status: 1 });
peminjamanSchema.index({ tanggalPinjam: 1 });

const Peminjaman = mongoose.model('Peminjaman', peminjamanSchema);

export default Peminjaman;
