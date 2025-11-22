import { useState, useEffect } from 'react';
import { IoArrowBack, IoCheckmarkCircle, IoSend } from 'react-icons/io5';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
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

  // Form state
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
        api.get('/peminjaman/user/my-peminjaman', {
          params: { status: 'Disetujui' }
        })
      ]);

      setPengembalian(pengembalianRes.data.data);

      // Filter peminjaman yang belum dikembalikan atau menunggu verifikasi
      const aktivePeminjaman = peminjamanRes.data.data.filter(
        p => p.statusPengembalian === 'Belum Dikembalikan'
      );
      setPeminjamanAktif(aktivePeminjaman);
    } catch (err) {
      toast.error('Gagal memuat data');
      console.error(err);
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
      toast.error('Jumlah yang dikembalikan tidak boleh melebihi jumlah yang dipinjam');
      return;
    }

    if (formData.jumlahDikembalikan < 1) {
      toast.error('Jumlah yang dikembalikan minimal 1');
      return;
    }

    try {
      setSubmitLoading(true);
      await api.post('/pengembalian', {
        peminjamanId: selectedPeminjaman._id,
        ...formData
      });

      toast.success('Pengembalian berhasil diajukan. Menunggu verifikasi admin.');
      setShowReturnModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengajukan pengembalian');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Menunggu Verifikasi': 'warning',
      'Diterima': 'success',
      'Ditolak': 'danger'
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getKondisiBadge = (kondisi) => {
    const variants = {
      'Baik': 'success',
      'Rusak Ringan': 'warning',
      'Rusak Berat': 'danger',
      'Hilang': 'danger'
    };
    return <Badge variant={variants[kondisi]} size="sm">{kondisi}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Pengembalian Barang</h1>
        <p className="text-gray-600 mt-1">Kembalikan barang yang sudah dipinjam</p>
      </div>

      {/* Peminjaman Aktif */}
      {peminjamanAktif.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Barang yang Perlu Dikembalikan</h2>
          <div className="space-y-4">
            {peminjamanAktif.map((item) => {
              const isLate = new Date() > new Date(item.tanggalKembali);
              return (
                <Card key={item._id}>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Image */}
                    <img
                      src={item.barangId?.foto !== 'default-barang.jpg'
                        ? `http://localhost:5001/uploads/${item.barangId?.foto}`
                        : 'https://via.placeholder.com/150'}
                      alt={item.barangId?.namaBarang}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{item.barangId?.namaBarang}</h3>
                          <p className="text-sm text-gray-600">Jumlah: {item.jumlahPinjam} unit</p>
                        </div>
                        {isLate && (
                          <Badge variant="danger">TERLAMBAT</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Tanggal Pinjam:</span>{' '}
                          {format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}
                        </div>
                        <div>
                          <span className="font-medium">Tanggal Kembali:</span>{' '}
                          {format(new Date(item.tanggalKembali), 'dd MMM yyyy', { locale: id })}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenReturnModal(item)}
                        >
                          <IoArrowBack size={18} />
                          Kembalikan Barang
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Riwayat Pengembalian */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Riwayat Pengembalian</h2>
        {pengembalian.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <IoCheckmarkCircle size={64} className="mx-auto mb-4 opacity-50" />
              <p>Belum ada riwayat pengembalian</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {pengembalian.map((item) => (
              <Card key={item._id}>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Image */}
                  <img
                    src={item.peminjamanId?.barangId?.foto !== 'default-barang.jpg'
                      ? `http://localhost:5001/uploads/${item.peminjamanId?.barangId?.foto}`
                      : 'https://via.placeholder.com/150'}
                    alt={item.peminjamanId?.barangId?.namaBarang}
                    className="w-full md:w-32 h-32 object-cover rounded-lg"
                  />

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {item.peminjamanId?.barangId?.namaBarang}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Jumlah Dikembalikan: {item.jumlahDikembalikan} unit
                        </p>
                      </div>
                      {getStatusBadge(item.statusVerifikasi)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="text-gray-600">
                        <span className="font-medium">Kondisi:</span> {getKondisiBadge(item.kondisiBarang)}
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Denda:</span>{' '}
                        <span className={item.denda > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                          Rp {item.denda.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Dikembalikan:</span>{' '}
                        {format(new Date(item.tanggalDikembalikan), 'dd MMM yyyy', { locale: id })}
                      </div>
                    </div>

                    {item.catatanPengembalian && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p className="text-gray-600 font-medium mb-1">Catatan:</p>
                        <p className="text-gray-800">{item.catatanPengembalian}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Return */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="Kembalikan Barang"
        size="md"
      >
        {selectedPeminjaman && (
          <form onSubmit={handleSubmitReturn} className="space-y-6">
            {/* Barang Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <img
                  src={selectedPeminjaman.barangId?.foto !== 'default-barang.jpg'
                    ? `http://localhost:5001/uploads/${selectedPeminjaman.barangId?.foto}`
                    : 'https://via.placeholder.com/100'}
                  alt={selectedPeminjaman.barangId?.namaBarang}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-bold text-gray-800">{selectedPeminjaman.barangId?.namaBarang}</h4>
                  <p className="text-sm text-gray-600">
                    Jumlah Dipinjam: {selectedPeminjaman.jumlahPinjam} unit
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Dikembalikan <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={selectedPeminjaman.jumlahPinjam}
                value={formData.jumlahDikembalikan}
                onChange={(e) => setFormData({ ...formData, jumlahDikembalikan: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maksimal: {selectedPeminjaman.jumlahPinjam} unit
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kondisi Barang <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kondisiBarang}
                onChange={(e) => setFormData({ ...formData, kondisiBarang: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan (+Rp 10.000 denda)</option>
                <option value="Rusak Berat">Rusak Berat (+Rp 50.000 denda)</option>
                <option value="Hilang">Hilang (+Rp 100.000 denda)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Pengembalian (Opsional)
              </label>
              <textarea
                rows="4"
                value={formData.catatanPengembalian}
                onChange={(e) => setFormData({ ...formData, catatanPengembalian: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tambahkan catatan jika ada kerusakan atau hal lain..."
              />
            </div>

            {/* Warning */}
            {new Date() > new Date(selectedPeminjaman.tanggalKembali) && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">
                  <strong>Perhatian:</strong> Anda terlambat mengembalikan barang. Denda keterlambatan Rp 5.000/hari akan diterapkan.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setShowReturnModal(false)}
                disabled={submitLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={submitLoading}
              >
                <IoSend size={20} />
                {submitLoading ? 'Mengirim...' : 'Ajukan Pengembalian'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default PengembalianUser;
