import mongoose from 'mongoose';

const barangSchema = new mongoose.Schema({
  namaBarang: {
    type: String,
    required: [true, 'Nama barang harus diisi'],
    trim: true
  },
  kategori: {
    type: String,
    enum: ['elektronik', 'olahraga'],
    required: [true, 'Kategori harus dipilih']
  },
  deskripsi: {
    type: String,
    trim: true,
    required: false,
    default: ''
  },
  foto: {
    type: String,
    default: 'default-barang.jpg'
  },
  jumlahTotal: {
    type: Number,
    required: [true, 'Jumlah total harus diisi'],
    min: 0
  },
  jumlahTersedia: {
    type: Number,
    required: true,
    min: 0
  },
  kondisi: {
    type: String,
    enum: ['baik', 'rusak ringan', 'rusak berat'],
    default: 'baik'
  },
  lokasi: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual untuk status ketersediaan
barangSchema.virtual('statusKetersediaan').get(function() {
  if (this.jumlahTersedia === 0) return 'tidak-tersedia';
  if (this.jumlahTersedia <= 3) return 'terbatas';
  return 'tersedia';
});

barangSchema.set('toJSON', { virtuals: true });
barangSchema.set('toObject', { virtuals: true });

const Barang = mongoose.model('Barang', barangSchema);

export default Barang;
