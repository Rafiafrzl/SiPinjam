import { useState, useEffect } from 'react';
import { IoCheckmarkCircle, IoTime, IoWarning, IoEye, IoTrash, IoImage, IoCloseCircle, IoCheckbox, IoSquareOutline } from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import { Alert } from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import usePolling from '../../hooks/usePolling';

const Pengembalian = () => {
  const [pengembalian, setPengembalian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail & Verify State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPengembalian, setSelectedPengembalian] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [denda, setDenda] = useState(0);

  useEffect(() => {
    fetchPengembalian();
  }, [statusFilter]);

  const fetchPengembalian = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const response = await api.get('/pengembalian', { params });
      const data = response.data.data || [];
      setPengembalian(data);
    } catch (err) {
      if (!silent) Toast.error(err.response?.data?.message || 'Gagal memuat data pengembalian');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Auto-refresh every 5 seconds
  usePolling(() => fetchPengembalian(true), 5000);

  const handleVerify = async (id, statusVerifikasi) => {
    // Validasi denda jika kondisi rusak berat
    if (statusVerifikasi === 'Diterima' && selectedPengembalian?.kondisiBarang === 'rusak berat') {
      if (!denda || denda <= 0) {
        Toast.error('Harap masukkan jumlah denda untuk barang rusak berat');
        return;
      }
    }

    const message = statusVerifikasi === 'Diterima'
      ? 'Terima pengembalian ini?'
      : 'Tolak pengembalian ini?';

    const isConfirmed = await Alert.confirm(message, 'Konfirmasi Verifikasi', 'Ya', 'Batal');
    if (!isConfirmed) return;

    try {
      setVerifyLoading(true);
      const payload = {
        statusVerifikasi,
        denda: selectedPengembalian?.kondisiBarang === 'rusak berat' ? denda : 0
      };
      await api.put(`/pengembalian/${id}/verifikasi`, payload);
      Toast.success(`Pengembalian berhasil ${statusVerifikasi.toLowerCase()}`);
      setShowDetailModal(false);
      setDenda(0);
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
      setDenda(0); // Reset denda
      setShowDetailModal(true);
    } catch (err) {
      Toast.error('Gagal memuat detail pengembalian');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Menunggu Verifikasi': 'warning',
      'Sudah Dikembalikan': 'success',
      'Belum Dikembalikan': 'danger'
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getKondisiBadge = (kondisi) => {
    const variants = {
      'baik': 'success',
      'rusak ringan': 'warning',
      'rusak berat': 'danger'
    };
    return <Badge variant={variants[kondisi]} size="sm">{kondisi}</Badge>;
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === pengembalian.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pengembalian.map(p => p._id));
    }
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await Alert.confirm(
      `Hapus ${selectedIds.length} data pengembalian yang dipilih?`,
      'Konfirmasi Hapus Massal',
      'Hapus',
      'Batal'
    );
    if (!isConfirmed) return;

    try {
      await api.delete('/peminjaman/admin/bulk-delete', { data: { ids: selectedIds } });
      Toast.success(`Berhasil menghapus ${selectedIds.length} data pengembalian`);
      setSelectedIds([]);
      fetchPengembalian();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Memuat data pengembalian..." />;
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
          variant={statusFilter === 'Sudah Dikembalikan' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('Sudah Dikembalikan')}
        >
          Sudah Dikembalikan
        </Button>

        {selectedIds.length > 0 && (
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <IoTrash size={16} />
            Hapus Massal ({selectedIds.length})
          </Button>
        )}
      </div>

      {pengembalian.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <IoCheckmarkCircle size={64} className="mx-auto mb-4 opacity-50" />
            <p>Tidak ada data pengembalian</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Select All Row */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              {selectedIds.length === pengembalian.length && pengembalian.length > 0 ? (
                <IoCheckbox size={22} className="text-indigo-600" />
              ) : (
                <IoSquareOutline size={22} />
              )}
              <span className="font-medium">
                {selectedIds.length === pengembalian.length && pengembalian.length > 0
                  ? 'Batal Pilih Semua'
                  : 'Pilih Semua'}
              </span>
            </button>
            {selectedIds.length > 0 && (
              <span className="text-xs text-gray-500">
                ({selectedIds.length} dipilih)
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <Card>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center justify-center"
                      >
                        {selectedIds.length === pengembalian.length && pengembalian.length > 0 ? (
                          <IoCheckbox size={22} className="text-indigo-600" />
                        ) : (
                          <IoSquareOutline size={22} className="text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Siswa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Barang</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Jumlah</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Kondisi</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tgl Pinjam</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pengembalian.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelection(item._id)}
                          className="flex items-center justify-center"
                        >
                          {selectedIds.includes(item._id) ? (
                            <IoCheckbox size={22} className="text-indigo-600" />
                          ) : (
                            <IoSquareOutline size={22} className="text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.peminjamanId?.userId?.nama || item.dikembalikanOleh?.nama}</p>
                        <p className="text-xs text-gray-500">{item.peminjamanId?.userId?.kelas || item.dikembalikanOleh?.kelas}</p>
                      </td>
                      <td className="px-4 py-3">{item.peminjamanId?.barangId?.namaBarang}</td>
                      <td className="px-4 py-3">{item.jumlahDikembalikan || item.peminjamanId?.jumlahPinjam} unit</td>
                      <td className="px-4 py-3">
                        {item.kondisiBarang ? getKondisiBadge(item.kondisiBarang) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.peminjamanId?.tanggalPinjam ? format(new Date(item.peminjamanId.tanggalPinjam), 'dd MMM yyyy', { locale: id }) : '-'}
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
        </div>
      )}

      {/* Modal Detail */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setDenda(0);
        }}
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
                  <p className="font-medium">{selectedPengembalian.peminjamanId?.userId?.nama || selectedPengembalian.dikembalikanOleh?.nama}</p>
                  <p className="text-xs text-gray-500">{selectedPengembalian.peminjamanId?.userId?.kelas || selectedPengembalian.dikembalikanOleh?.kelas}</p>
                </div>
                <div>
                  <p className="text-gray-600">Barang:</p>
                  <p className="font-medium">{selectedPengembalian.peminjamanId?.barangId?.namaBarang}</p>
                </div>
                <div>
                  <p className="text-gray-600">Jumlah Dipinjam:</p>
                  <p className="font-medium">{selectedPengembalian.jumlahDikembalikan || selectedPengembalian.peminjamanId?.jumlahPinjam} unit</p>
                </div>
                <div>
                  <p className="text-gray-600">Tanggal Pinjam:</p>
                  <p className="font-medium">
                    {selectedPengembalian.peminjamanId?.tanggalPinjam ? format(new Date(selectedPengembalian.peminjamanId.tanggalPinjam), 'dd MMMM yyyy', { locale: id }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tanggal Kembali:</p>
                  <p className="font-medium">
                    {selectedPengembalian.peminjamanId?.tanggalKembali ? format(new Date(selectedPengembalian.peminjamanId.tanggalKembali), 'dd MMMM yyyy', { locale: id }) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pengembalian Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Informasi Pengembalian</h3>

              {selectedPengembalian.kondisiBarang && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Kondisi Barang:</span>
                  {getKondisiBadge(selectedPengembalian.kondisiBarang)}
                </div>
              )}

              {/* Warning untuk Rusak Ringan */}
              {selectedPengembalian.kondisiBarang === 'rusak ringan' && selectedPengembalian.statusVerifikasi === 'Menunggu Verifikasi' && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <IoWarning className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold">Peringatan!</p>
                    <p>Barang dikembalikan dalam kondisi rusak ringan. Berikan peringatan kepada siswa untuk lebih berhati-hati kedepannya.</p>
                  </div>
                </div>
              )}

              {/* Denda untuk Rusak Berat */}
              {selectedPengembalian.kondisiBarang === 'rusak berat' && selectedPengembalian.statusVerifikasi === 'Menunggu Verifikasi' && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <IoWarning className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                    <div className="text-sm text-red-800">
                      <p className="font-semibold">Denda Diperlukan!</p>
                      <p>Barang dikembalikan dalam kondisi rusak berat. Harap masukkan jumlah denda yang harus dibayar siswa.</p>
                    </div>
                  </div>
                  <Input
                    label="Jumlah Denda (Rp)"
                    type="number"
                    value={denda === 0 ? '' : denda}
                    onChange={(e) => setDenda(Number(e.target.value))}
                    placeholder="Masukkan jumlah denda"
                    required
                  />
                </div>
              )}

              {selectedPengembalian.fotoPengembalian && (
                <div className="pt-3 border-t">
                  <p className="text-gray-600 mb-2">Foto Kondisi Barang:</p>
                  <div className="relative group">
                    <img
                      src={getImageUrl(selectedPengembalian.fotoPengembalian)}
                      alt="Foto Pengembalian"
                      className="w-full max-h-96 object-contain rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowPhotoModal(true)}
                    />
                    <button
                      onClick={() => setShowPhotoModal(true)}
                      className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                      <IoImage size={16} />
                      Lihat Detail
                    </button>
                  </div>
                </div>
              )}

              {selectedPengembalian.catatanAdmin && (
                <div className="pt-3 border-t">
                  <p className="text-gray-600 mb-2">Catatan Admin:</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded">{selectedPengembalian.catatanAdmin}</p>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Status Pengembalian:</span>
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
                onClick={() => {
                  setShowDetailModal(false);
                  setDenda(0);
                }}
              >
                Tutup
              </Button>
            )}
          </div>
        )}
      </Modal>

      {/* Photo Detail Modal */}
      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title="Detail Foto Kondisi Barang"
        size="full"
      >
        {selectedPengembalian?.fotoPengembalian && (
          <div className="relative flex items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[70vh]">
            <img
              src={getImageUrl(selectedPengembalian.fotoPengembalian)}
              alt="Detail Foto Pengembalian"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
            />
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-6 right-6 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full transition-all"
            >
              <IoCloseCircle size={24} />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Pengembalian;
