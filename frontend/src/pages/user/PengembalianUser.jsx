import { useState, useEffect } from 'react';
import { IoArrowBack, IoCheckmarkCircle, IoSend, IoAlertCircle, IoWarning } from 'react-icons/io5';
import { toast } from 'react-toastify';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import api from '../../utils/api';
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
      toast.error('Gagal memuat data');
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
      toast.error('Jumlah melebihi jumlah yang dipinjam');
      return;
    }
    try {
      setSubmitLoading(true);
      await api.post('/pengembalian', {
        peminjamanId: selectedPeminjaman._id,
        ...formData
      });
      toast.success('Pengembalian berhasil diajukan');
      setShowReturnModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengajukan pengembalian');
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Pengembalian Barang</h1>
        <p className="text-sm text-gray-500 mt-1">Kembalikan barang yang sudah dipinjam</p>
      </div>

      {/* Perlu Dikembalikan */}
      {peminjamanAktif.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <IoAlertCircle className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Perlu Dikembalikan</h2>
              <p className="text-xs text-gray-500">{peminjamanAktif.length} barang</p>
            </div>
          </div>
          <div className="space-y-3">
            {peminjamanAktif.map((item) => {
              const isLate = new Date() > new Date(item.tanggalKembali);
              return (
                <div key={item._id} className={`bg-white rounded-xl p-3 sm:p-4 border-2 ${isLate ? 'border-red-300 bg-red-50/50' : 'border-gray-100'}`}>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.barangId?.foto !== 'default-barang.jpg'
                          ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${item.barangId?.foto}`
                          : 'https://via.placeholder.com/80'}
                        alt={item.barangId?.namaBarang}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {item.barangId?.namaBarang}
                        </h3>
                        {isLate && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                            TERLAMBAT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{item.jumlahPinjam} unit</p>
                      <p className="text-xs text-gray-500">
                        Kembali: <span className={isLate ? 'text-red-600 font-bold' : ''}>
                          {format(new Date(item.tanggalKembali), 'dd MMM yyyy', { locale: id })}
                        </span>
                      </p>
                      <button
                        onClick={() => handleOpenReturnModal(item)}
                        className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all"
                      >
                        <IoArrowBack size={14} />
                        Kembalikan
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
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Riwayat Pengembalian</h2>
        {pengembalian.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <IoCheckmarkCircle className="mx-auto mb-4 text-gray-300" size={48} />
            <h3 className="text-lg font-bold text-gray-700 mb-1">Belum ada riwayat</h3>
            <p className="text-sm text-gray-500">Riwayat pengembalian akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pengembalian.map((item) => (
              <div key={item._id} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.peminjamanId?.barangId?.foto !== 'default-barang.jpg'
                        ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${item.peminjamanId?.barangId?.foto}`
                        : 'https://via.placeholder.com/80'}
                      alt={item.peminjamanId?.barangId?.namaBarang}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">
                        {item.peminjamanId?.barangId?.namaBarang}
                      </h3>
                      {getStatusBadge(item.statusVerifikasi)}
                    </div>
                    <p className="text-xs text-gray-500">{item.jumlahDikembalikan} unit • {item.kondisiBarang}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(item.tanggalDikembalikan), 'dd MMM yyyy', { locale: id })}
                    </p>
                    {item.denda > 0 && (
                      <p className="text-xs font-bold text-red-600 mt-1">Denda: Rp {item.denda.toLocaleString('id-ID')}</p>
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
          <form onSubmit={handleSubmitReturn} className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
              <img
                src={selectedPeminjaman.barangId?.foto !== 'default-barang.jpg'
                  ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${selectedPeminjaman.barangId?.foto}`
                  : 'https://via.placeholder.com/80'}
                alt={selectedPeminjaman.barangId?.namaBarang}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-gray-800">{selectedPeminjaman.barangId?.namaBarang}</h4>
                <p className="text-sm text-gray-500">Dipinjam: {selectedPeminjaman.jumlahPinjam} unit</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Dikembalikan</label>
              <input
                type="number"
                min="1"
                max={selectedPeminjaman.jumlahPinjam}
                value={formData.jumlahDikembalikan}
                onChange={(e) => setFormData({ ...formData, jumlahDikembalikan: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Barang</label>
              <select
                value={formData.kondisiBarang}
                onChange={(e) => setFormData({ ...formData, kondisiBarang: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                required
              >
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan (+Rp 10.000)</option>
                <option value="Rusak Berat">Rusak Berat (+Rp 50.000)</option>
                <option value="Hilang">Hilang (+Rp 100.000)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <textarea
                rows="2"
                value={formData.catatanPengembalian}
                onChange={(e) => setFormData({ ...formData, catatanPengembalian: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                placeholder="Opsional..."
              />
            </div>

            {new Date() > new Date(selectedPeminjaman.tanggalKembali) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <IoWarning className="text-red-500 flex-shrink-0" size={18} />
                <p className="text-xs text-red-700">
                  Anda terlambat mengembalikan. Denda Rp 5.000/hari akan diterapkan.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" fullWidth onClick={() => setShowReturnModal(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" fullWidth loading={submitLoading}>
                <IoSend size={16} />
                Ajukan
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default PengembalianUser;
