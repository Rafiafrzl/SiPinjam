import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoArrowBack, IoCheckmarkCircle, IoSend, IoAlertCircle, IoWarning } from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const PengembalianUser = () => {
  const [pengembalian, setPengembalian] = useState([]);
  const [peminjamanAktif, setPeminjamanAktif] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    kondisiBarang: 'Baik',
    jumlahDikembalikan: 1,
    catatanPengembalian: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pengembalianRes, peminjamanRes] = await Promise.all([
        api.get('/pengembalian/my'),
        api.get('/peminjaman/user/my-peminjaman', { params: { status: 'Disetujui' } })
      ]);
      setPengembalian(pengembalianRes.data.data);
      const aktive = peminjamanRes.data.data.filter(p => p.statusPengembalian === 'Belum Dikembalikan');
      setPeminjamanAktif(aktive);
    } catch (err) {
      Toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturnModal = (peminjaman) => {
    setSelectedPeminjaman(peminjaman);
    setFormData({
      kondisiBarang: 'Baik',
      jumlahDikembalikan: peminjaman.jumlahPinjam,
      catatanPengembalian: ''
    });
    setShowReturnModal(true);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (formData.jumlahDikembalikan > selectedPeminjaman.jumlahPinjam) {
      Toast.error('Jumlah melebihi jumlah yang dipinjam');
      return;
    }
    try {
      setSubmitLoading(true);
      await api.post('/pengembalian', {
        peminjamanId: selectedPeminjaman._id,
        ...formData
      });
      Toast.success('Pengembalian berhasil diajukan');
      setShowReturnModal(false);
      fetchData();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Gagal mengajukan pengembalian');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'Menunggu Verifikasi': 'bg-amber-500 text-white',
      'Diterima': 'bg-emerald-500 text-white',
      'Ditolak': 'bg-red-500 text-white'
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full ${config[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat data..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Pengembalian Barang</h1>
        <p className="text-sm text-gray-500 mt-1">Kembalikan barang yang sudah dipinjam</p>
      </div>

      {/* Perlu Dikembalikan */}
      {peminjamanAktif.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <IoAlertCircle className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white">Perlu Dikembalikan</h2>
              <p className="text-xs text-gray-400">{peminjamanAktif.length} barang</p>
            </div>
          </div>
          <div className="space-y-3">
            {peminjamanAktif.map((item) => {
              const isLate = new Date() > new Date(item.tanggalKembali);
              return (
                <div key={item._id} className={`bg-neutral-900 rounded-xl p-3 sm:p-4 border-2 transition-all group ${isLate ? 'border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/5' : 'border-neutral-800 hover:border-purple-500/50'}`}>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                      <img
                        src={getImageUrl(item.barangId?.foto, 'https://via.placeholder.com/80')}
                        alt={item.barangId?.namaBarang}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-white text-sm sm:text-base truncate group-hover:text-purple-400 transition-colors">
                          {item.barangId?.namaBarang}
                        </h3>
                        {isLate && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-lg shadow-red-500/30">
                            TERLAMBAT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{item.jumlahPinjam} unit</p>
                      <p className="text-xs text-gray-400">
                        Kembali: <span className={isLate ? 'text-red-400 font-bold' : ''}>
                          {format(new Date(item.tanggalKembali), 'dd MMM yyyy', { locale: id })}
                        </span>
                      </p>
                      <button
                        onClick={() => handleOpenReturnModal(item)}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                      >
                        <IoArrowBack size={14} />
                        Kembalikan Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Riwayat Pengembalian */}
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
        <h2 className="text-lg font-bold text-white mb-4">Riwayat Pengembalian</h2>
        {pengembalian.length === 0 ? (
          <div className="bg-neutral-900 rounded-2xl p-10 text-center border border-neutral-800 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-800 rounded-full mb-4">
              <IoCheckmarkCircle className="text-neutral-600" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-400 mb-1">Belum ada riwayat</h3>
            <p className="text-sm text-gray-500">Riwayat pengembalian Anda akan muncul secara otomatis di sini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pengembalian.map((item) => (
              <div key={item._id} className="bg-neutral-900 rounded-xl p-3 sm:p-4 border border-neutral-800 hover:border-neutral-700 transition-all">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                    <img
                      src={getImageUrl(item.peminjamanId?.barangId?.foto, 'https://via.placeholder.com/80')}
                      alt={item.peminjamanId?.barangId?.namaBarang}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {item.peminjamanId?.barangId?.namaBarang}
                      </h3>
                      {getStatusBadge(item.statusVerifikasi)}
                    </div>
                    <p className="text-xs text-gray-400">{item.jumlahDikembalikan} unit • {item.kondisiBarang}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      {format(new Date(item.tanggalDikembalikan), 'dd MMM yyyy', { locale: id })}
                    </p>
                    {item.denda > 0 && (
                      <div className="inline-flex items-center px-2 py-0.5 bg-red-500/10 text-red-500 rounded mt-1 border border-red-500/20">
                        <span className="text-[10px] font-bold">Denda: Rp {item.denda.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Return */}
      <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title="Kembalikan Barang" size="md">
        {selectedPeminjaman && (
          <form onSubmit={handleSubmitReturn} className="space-y-5 py-2">
            <div className="flex items-center gap-4 p-4 bg-neutral-800 rounded-xl border border-neutral-700/50">
              <img
                src={getImageUrl(selectedPeminjaman.barangId?.foto, 'https://via.placeholder.com/80')}
                alt={selectedPeminjaman.barangId?.namaBarang}
                className="w-16 h-16 object-cover rounded-lg shadow-md"
              />
              <div>
                <h4 className="font-bold text-white text-base">{selectedPeminjaman.barangId?.namaBarang}</h4>
                <p className="text-sm text-gray-400">Jumlah dipinjam: <span className="text-purple-400 font-semibold">{selectedPeminjaman.jumlahPinjam} unit</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Jumlah Dikembalikan</label>
                <input
                  type="number"
                  min="1"
                  max={selectedPeminjaman.jumlahPinjam}
                  value={formData.jumlahDikembalikan}
                  onChange={(e) => setFormData({ ...formData, jumlahDikembalikan: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Kondisi Barang</label>
                <select
                  value={formData.kondisiBarang}
                  onChange={(e) => setFormData({ ...formData, kondisiBarang: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                  required
                >
                  <option value="Baik" className="bg-neutral-900">✅ Baik</option>
                  <option value="Rusak Ringan" className="bg-neutral-900">⚠️ Rusak Ringan (+Rp 10.000)</option>
                  <option value="Rusak Berat" className="bg-neutral-900">🆘 Rusak Berat (+Rp 50.000)</option>
                  <option value="Hilang" className="bg-neutral-900">❌ Hilang (+Rp 100.000)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Catatan Pengembalian</label>
                <textarea
                  rows="3"
                  value={formData.catatanPengembalian}
                  onChange={(e) => setFormData({ ...formData, catatanPengembalian: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                  placeholder="Ceritakan kondisi barang (opsional)..."
                />
              </div>
            </div>

            {new Date() > new Date(selectedPeminjaman.tanggalKembali) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-pulse">
                <IoWarning className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-xs text-red-200 leading-relaxed font-medium">
                  Anda terlambat mengembalikan barang ini. Denda keterlambatan sebesar <span className="font-bold text-red-100 italic">Rp 5.000/hari</span> akan diterapkan secara otomatis.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" fullWidth onClick={() => setShowReturnModal(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" fullWidth loading={submitLoading}>
                <IoSend size={16} />
                Ajukan Pengembalian
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  );
};

export default PengembalianUser;
