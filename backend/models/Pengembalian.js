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
    enum: ['baik', 'rusak ringan', 'rusak berat', 'hilang'],
    required: true,
    trim: true,
    lowercase: true
  },
  fotoPengembalian: {
    type: String,
    trim: true
  },
  jumlahDikembalikan: {
    type: Number,
    required: true,
    min: 1
  },
  catatanPengembalian: {
    type: String,
    default: '',
    trim: true
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
  catatanAdmin: {
    type: String,
    trim: true
  },
  statusVerifikasi: {
    type: String,
    enum: ['Menunggu Verifikasi', 'Diterima', 'Ditolak'],
    default: 'Menunggu Verifikasi'
  }
}, {
  timestamps: true,
  collection: 'pengembalian'
});

// Index untuk query yang sering digunakan
pengembalianSchema.index({ peminjamanId: 1 });
pengembalianSchema.index({ dikembalikanOleh: 1 });
pengembalianSchema.index({ diverifikasiOleh: 1 });
pengembalianSchema.index({ statusVerifikasi: 1 });

const Pengembalian = mongoose.model('Pengembalian', pengembalianSchema);

export default Pengembalian;
