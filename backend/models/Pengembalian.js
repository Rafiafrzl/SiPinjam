import mongoose from 'mongoose';

const pengembalianSchema = new mongoose.Schema({
  peminjamanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Peminjaman',
    required: true
  },
  tanggalDikembalikan: {
    type: Date,
    required: true,
    default: Date.now
  },
  kondisiBarang: {
    type: String,
    enum: ['Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang'],
    required: true
  },
  jumlahDikembalikan: {
    type: Number,
    required: true,
    min: 1
  },
  catatanPengembalian: {
    type: String,
    default: ''
  },
  denda: {
    type: Number,
    default: 0,
    min: 0
  },
  dikembalikanOleh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diverifikasiOleh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  statusVerifikasi: {
    type: String,
    enum: ['Menunggu Verifikasi', 'Diterima', 'Ditolak'],
    default: 'Menunggu Verifikasi'
  }
}, {
  timestamps: true
});

// Index untuk query yang sering digunakan
pengembalianSchema.index({ peminjamanId: 1 });
pengembalianSchema.index({ dikembalikanOleh: 1 });
pengembalianSchema.index({ diverifikasiOleh: 1 });
pengembalianSchema.index({ statusVerifikasi: 1 });

const Pengembalian = mongoose.model('Pengembalian', pengembalianSchema);

export default Pengembalian;
