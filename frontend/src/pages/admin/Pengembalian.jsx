import { useState, useEffect } from 'react';
import { IoCheckmarkCircle, IoCloseCircle, IoEye } from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import api from '../../utils/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Pengembalian = () => {
  const [pengembalian, setPengembalian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPengembalian, setSelectedPengembalian] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    fetchPengembalian();
  }, [statusFilter]);

  const fetchPengembalian = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get('/pengembalian', { params });
      setPengembalian(response.data.data || response.data || []);
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Gagal memuat data pengembalian');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, statusVerifikasi) => {
    const message = statusVerifikasi === 'Diterima'
      ? 'Terima pengembalian ini?'
      : 'Tolak pengembalian ini?';

    if (!confirm(message)) return;

    try {
      setVerifyLoading(true);
      await api.put(`/pengembalian/${id}/verifikasi`, { statusVerifikasi });
      Toast.success(`Pengembalian berhasil ${statusVerifikasi.toLowerCase()}`);
      setShowDetailModal(false);
      fetchPengembalian();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Gagal memverifikasi pengembalian');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleShowDetail = async (id) => {
    try {
      const response = await api.get(`/pengembalian/${id}`);
      setSelectedPengembalian(response.data.data);
      setShowDetailModal(true);
    } catch (err) {
      Toast.error('Gagal memuat detail pengembalian');
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
    return <Loading fullScreen text="Memuat data..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Kelola Pengembalian</h1>
        <p className="text-gray-600 mt-1">Verifikasi pengembalian barang dari siswa</p>
      </div>

      {/* Filter Status */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === '' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('')}
        >
          Semua
        </Button>
        <Button
          variant={statusFilter === 'Menunggu Verifikasi' ? 'warning' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Menunggu Verifikasi')}
        >
          Menunggu Verifikasi
        </Button>
        <Button
          variant={statusFilter === 'Diterima' ? 'success' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Diterima')}
        >
          Diterima
        </Button>
        <Button
          variant={statusFilter === 'Ditolak' ? 'danger' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Ditolak')}
        >
          Ditolak
        </Button>
      </div>

      {pengembalian.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <IoCheckmarkCircle size={64} className="mx-auto mb-4 opacity-50" />
            <p>Tidak ada data pengembalian</p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Card>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Siswa</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Barang</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Jumlah</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Kondisi</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Denda</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tgl Dikembalikan</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pengembalian.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.peminjamanId?.userId?.nama}</p>
                      <p className="text-xs text-gray-500">{item.peminjamanId?.userId?.kelas}</p>
                    </td>
                    <td className="px-4 py-3">{item.peminjamanId?.barangId?.namaBarang}</td>
                    <td className="px-4 py-3">{item.jumlahDikembalikan} unit</td>
                    <td className="px-4 py-3">{getKondisiBadge(item.kondisiBarang)}</td>
                    <td className="px-4 py-3">
                      <span className={item.denda > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                        Rp {item.denda.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(item.tanggalDikembalikan), 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(item.statusVerifikasi)}</td>
                    <td className="px-4 py-3">
                      <Button variant="primary" size="sm" onClick={() => handleShowDetail(item._id)}>
                        <IoEye size={18} />
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Modal Detail */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Pengembalian"
        size="lg"
      >
        {selectedPengembalian && (
          <div className="space-y-6">
            {/* Peminjaman Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Informasi Peminjaman</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Siswa:</p>
                  <p className="font-medium">{selectedPengembalian.peminjamanId?.userId?.nama}</p>
                  <p className="text-xs text-gray-500">{selectedPengembalian.peminjamanId?.userId?.kelas}</p>
                </div>
                <div>
                  <p className="text-gray-600">Barang:</p>
                  <p className="font-medium">{selectedPengembalian.peminjamanId?.barangId?.namaBarang}</p>
                </div>
                <div>
                  <p className="text-gray-600">Jumlah Dipinjam:</p>
                  <p className="font-medium">{selectedPengembalian.peminjamanId?.jumlahPinjam} unit</p>
                </div>
                <div>
                  <p className="text-gray-600">Tanggal Kembali:</p>
                  <p className="font-medium">
                    {format(new Date(selectedPengembalian.peminjamanId?.tanggalKembali), 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>
            </div>

            {/* Pengembalian Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Informasi Pengembalian</h3>

              <div className="flex justify-between">
                <span className="text-gray-600">Jumlah Dikembalikan:</span>
                <span className="font-semibold">{selectedPengembalian.jumlahDikembalikan} unit</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Kondisi Barang:</span>
                {getKondisiBadge(selectedPengembalian.kondisiBarang)}
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal Dikembalikan:</span>
                <span className="font-semibold">
                  {format(new Date(selectedPengembalian.tanggalDikembalikan), 'dd MMMM yyyy HH:mm', { locale: id })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Denda:</span>
                <span className={`font-bold text-lg ${selectedPengembalian.denda > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Rp {selectedPengembalian.denda.toLocaleString('id-ID')}
                </span>
              </div>

              {selectedPengembalian.catatanPengembalian && (
                <div className="pt-3 border-t">
                  <p className="text-gray-600 mb-2">Catatan Pengembalian:</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded">{selectedPengembalian.catatanPengembalian}</p>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Status Verifikasi:</span>
                {getStatusBadge(selectedPengembalian.statusVerifikasi)}
              </div>
            </div>

            {/* Actions */}
            {selectedPengembalian.statusVerifikasi === 'Menunggu Verifikasi' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="success"
                  fullWidth
                  onClick={() => handleVerify(selectedPengembalian._id, 'Diterima')}
                  disabled={verifyLoading}
                >
                  <IoCheckmarkCircle size={20} />
                  Terima Pengembalian
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => handleVerify(selectedPengembalian._id, 'Ditolak')}
                  disabled={verifyLoading}
                >
                  <IoCloseCircle size={20} />
                  Tolak Pengembalian
                </Button>
              </div>
            )}

            {selectedPengembalian.statusVerifikasi !== 'Menunggu Verifikasi' && (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Pengembalian;
