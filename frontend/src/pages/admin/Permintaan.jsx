import { useState, useEffect } from 'react';
import { IoList, IoCheckmark, IoClose, IoEye, IoCalendar, IoPerson, IoTrash, IoCheckbox, IoSquareOutline, IoWarning } from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import { Alert } from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Permintaan = () => {
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // approve or reject
  const [selectedItem, setSelectedItem] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  useEffect(() => {
    fetchPeminjaman();
  }, [statusFilter]);

  const fetchPeminjaman = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get('/peminjaman/admin/all', { params });
      const data = response.data.data || response.data || [];
      setPeminjaman(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal memuat permintaan peminjaman';
      Toast.error(errorMessage);
      setPeminjaman([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (item) => {
    const processedStatuses = ['Disetujui', 'Ditolak', 'Selesai'];
    if (processedStatuses.includes(item.status)) {
      Toast.error('Peminjaman sudah diproses sebelumnya');
      fetchPeminjaman();
      return;
    }

    setModalType('approve');
    setSelectedItem(item);
    setCatatan('');
    setShowModal(true);
  };

  const handleApproveExtension = (item) => {
    setModalType('approveExtension');
    setSelectedItem(item);
    setCatatan('');
    setShowModal(true);
  };

  const handleRejectExtension = (item) => {
    setModalType('rejectExtension');
    setSelectedItem(item);
    setCatatan('');
    setShowModal(true);
  };

  const handleReject = (item) => {
    const processedStatuses = ['Disetujui', 'Ditolak', 'Selesai'];
    if (processedStatuses.includes(item.status)) {
      Toast.error('Peminjaman sudah diproses sebelumnya');
      fetchPeminjaman();
      return;
    }

    setModalType('reject');
    setSelectedItem(item);
    setCatatan('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setCatatan('');
    setModalType('');
  };

  const handleShowDetail = (item) => {
    setDetailItem(item);
    setShowDetailModal(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedItem?._id) {
      Toast.error('Data peminjaman tidak valid');
      return;
    }

    const processedStatuses = ['Disetujui', 'Ditolak', 'Selesai'];
    const isExtensionAction = modalType.toLowerCase().includes('extension');

    // For non-extension actions, block if already processed
    if (!isExtensionAction && processedStatuses.includes(selectedItem.status)) {
      Toast.error('Peminjaman sudah diproses sebelumnya');
      setShowModal(false);
      setSelectedItem(null);
      fetchPeminjaman();
      return;
    }

    // For extension actions, verify it hasn't been processed yet
    if (isExtensionAction && selectedItem.extensionStatus !== 'Menunggu') {
      Toast.error('Permintaan perpanjangan sudah diproses sebelumnya');
      setShowModal(false);
      setSelectedItem(null);
      fetchPeminjaman();
      return;
    }

    setSubmitting(true);

    try {
      if (modalType === 'approve') {
        const requestData = {
          catatanAdmin: catatan.trim()
        };

        await api.put(`/peminjaman/admin/${selectedItem._id}/approve`, requestData);
        Toast.success('Peminjaman berhasil disetujui');
      } else if (modalType === 'reject') {
        if (!catatan.trim()) {
          Toast.error('Alasan penolakan harus diisi');
          setSubmitting(false);
          return;
        }
        const requestData = {
          alasanPenolakan: catatan.trim()
        };

        await api.put(`/peminjaman/admin/${selectedItem._id}/reject`, requestData);
        Toast.success('Peminjaman berhasil ditolak');
      } else if (modalType === 'approveExtension') {
        const requestData = {
          catatanAdmin: catatan.trim()
        };
        await api.put(`/peminjaman/admin/${selectedItem._id}/approve-extension`, requestData);
        Toast.success('Perpanjangan berhasil disetujui');
      } else if (modalType === 'rejectExtension') {
        if (!catatan.trim()) {
          Toast.error('Alasan penolakan harus diisi');
          setSubmitting(false);
          return;
        }
        const requestData = {
          alasanPenolakan: catatan.trim()
        };
        await api.put(`/peminjaman/admin/${selectedItem._id}/reject-extension`, requestData);
        Toast.success('Perpanjangan berhasil ditolak');
      }

      setShowModal(false);
      setSelectedItem(null);
      setCatatan('');
      // Force refresh untuk ensure sync
      await fetchPeminjaman();
      setTimeout(() => fetchPeminjaman(), 500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal memproses peminjaman';

      // Handle specific error cases
      if (errorMessage.includes('sudah diproses')) {
        Toast.info('Peminjaman sudah diproses, data akan diperbarui');
        setShowModal(false);
        setSelectedItem(null);
        await fetchPeminjaman();
        setTimeout(() => fetchPeminjaman(), 500);
      } else if (errorMessage.includes('tidak ditemukan')) {
        Toast.error('Peminjaman tidak ditemukan, data akan diperbarui');
        setShowModal(false);
        setSelectedItem(null);
        await fetchPeminjaman();
        setTimeout(() => fetchPeminjaman(), 500);
      } else {
        Toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === peminjaman.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(peminjaman.map(p => p._id));
    }
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await Alert.confirm(
      `Hapus ${selectedIds.length} peminjaman yang dipilih?`,
      'Konfirmasi Hapus Massal',
      'Hapus',
      'Batal'
    );
    if (!isConfirmed) return;

    try {
      await api.delete('/peminjaman/admin/bulk-delete', { data: { ids: selectedIds } });
      Toast.success(`Berhasil menghapus ${selectedIds.length} peminjaman`);
      setSelectedIds([]);
      fetchPeminjaman();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Gagal menghapus peminjaman');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Memuat permintaan..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Permintaan Peminjaman</h1>
        <p className="text-gray-600 mt-1">Kelola permintaan peminjaman dari siswa</p>
      </div>

      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Button variant={statusFilter === '' ? 'primary' : 'outline'} size="sm" onClick={() => setStatusFilter('')}>
            Semua
          </Button>
          <Button variant={statusFilter === 'Menunggu' ? 'warning' : 'outline'} size="sm" onClick={() => setStatusFilter('Menunggu')}>
            Menunggu
          </Button>
          <Button variant={statusFilter === 'Disetujui' ? 'success' : 'outline'} size="sm" onClick={() => setStatusFilter('Disetujui')}>
            Disetujui
          </Button>
          <Button variant={statusFilter === 'Ditolak' ? 'danger' : 'outline'} size="sm" onClick={() => setStatusFilter('Ditolak')}>
            Ditolak
          </Button>
        </div>

        {selectedIds.length > 0 && (
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <IoTrash size={16} />
            Hapus Massal ({selectedIds.length})
          </Button>
        )}
      </div>

      {peminjaman.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <IoList size={64} className="mx-auto mb-4 opacity-50" />
            <p>Tidak ada permintaan</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {peminjaman.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {selectedIds.length === peminjaman.length && peminjaman.length > 0 ? (
                  <IoCheckbox size={22} className="text-indigo-600" />
                ) : (
                  <IoSquareOutline size={22} />
                )}
                <span className="font-medium">
                  {selectedIds.length === peminjaman.length && peminjaman.length > 0
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
          )}
          <div className="grid gap-3">
            {peminjaman.map((item) => (
              <Card key={item._id} className="p-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleSelection(item._id)}
                    className="flex-shrink-0"
                  >
                    {selectedIds.includes(item._id) ? (
                      <IoCheckbox size={22} className="text-indigo-600" />
                    ) : (
                      <IoSquareOutline size={22} className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  {/* Image - lebih kecil */}
                  <img
                    src={getImageUrl(item.barangId?.foto, 'https://via.placeholder.com/80')}
                    alt={item.barangId?.namaBarang}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />


                  <div
                    className="flex-1 min-w-0 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
                    onClick={() => handleShowDetail(item)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{item.barangId?.namaBarang}</h3>
                      <Badge size="sm" variant={item.status === 'Menunggu' ? 'warning' : item.status === 'Disetujui' ? 'success' : item.status === 'Selesai' ? 'primary' : 'danger'}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {item.userId?.nama} • {item.userId?.kelas} • {item.jumlahPinjam} unit
                    </p>
                    <div className="flex flex-wrap gap-x-3 text-xs text-gray-400">
                      <span>Pinjam: {format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}</span>
                      <span>Kembali: {format(new Date(item.tanggalKembali), 'dd MMM yyyy', { locale: id })}</span>
                      {item.status === 'Disetujui' && new Date(item.tanggalKembali) < new Date() && (
                        <span className="text-red-600 font-bold ml-2 flex items-center gap-1">
                          <IoWarning size={14} />
                          TERLAMBAT!
                        </span>
                      )}
                      {item.isExtensionRequested && item.extensionStatus === 'Menunggu' && (
                        <span className="text-amber-600 font-bold ml-2">
                          (Ada Permintaan Perpanjangan!)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detail button */}
                  <button
                    onClick={() => handleShowDetail(item)}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
                    title="Lihat Detail"
                  >
                    <IoEye size={20} />
                  </button>

                  {/* Buttons - di kanan */}
                  {item.status === 'Menunggu' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(item)}
                        disabled={submitting || selectedItem?._id === item._id}
                      >
                        <IoCheckmark size={16} />
                        Setujui
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(item)}
                        disabled={submitting || selectedItem?._id === item._id}
                      >
                        <IoClose size={16} />
                        Tolak
                      </Button>
                    </div>
                  )}

                  {/* Extension Buttons */}
                  {item.status === 'Disetujui' && item.isExtensionRequested && item.extensionStatus === 'Menunggu' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleApproveExtension(item)}
                        disabled={submitting}
                      >
                        <IoCheckmark size={16} />
                        ACC Perpanjang
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => handleRejectExtension(item)}
                        disabled={submitting}
                      >
                        <IoClose size={16} />
                        Tolak
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          modalType === 'approve' ? 'Setujui Peminjaman' :
            modalType === 'reject' ? 'Tolak Peminjaman' :
              modalType === 'approveExtension' ? 'Setujui Perpanjangan' :
                'Tolak Perpanjangan'
        }
      >
        <div className="space-y-4">
          {selectedItem && (
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold">{selectedItem.barangId?.namaBarang}</p>
              <p className="text-sm text-gray-600">{selectedItem.userId?.nama} - {selectedItem.userId?.kelas}</p>
            </div>
          )}

          <Textarea
            label={modalType === 'approve' ? 'Catatan (Opsional)' : 'Alasan Penolakan'}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={4}
            required={modalType === 'reject'}
            placeholder={modalType === 'approve' ? 'Tambahkan catatan untuk siswa...' : 'Jelaskan mengapa peminjaman ditolak...'}
          />

          <div className="flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={handleCloseModal}>
              Batal
            </Button>
            <Button
              type="button"
              variant={modalType.toLowerCase().includes('approve') ? 'success' : 'danger'}
              fullWidth
              loading={submitting}
              onClick={handleSubmitAction}
            >
              {modalType.toLowerCase().includes('approve') ? 'Setujui' : 'Tolak'} {modalType.toLowerCase().includes('extension') ? 'Perpanjangan' : 'Peminjaman'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Peminjaman"
        size="lg"
      >
        {detailItem && (
          <div className="space-y-4">
            {/* Header dengan gambar */}
            <div className="flex gap-4">
              <img
                src={getImageUrl(detailItem.barangId?.foto, 'https://via.placeholder.com/120')}
                alt={detailItem.barangId?.namaBarang}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{detailItem.barangId?.namaBarang}</h3>
                <p className="text-sm text-gray-500">{detailItem.barangId?.kategori}</p>
                <Badge
                  className="mt-2"
                  variant={detailItem.status === 'Menunggu' ? 'warning' : detailItem.status === 'Disetujui' ? 'success' : detailItem.status === 'Ditolak' ? 'danger' : 'primary'}
                >
                  {detailItem.status}
                </Badge>
              </div>
            </div>

            {/* Info Peminjam */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <IoPerson size={16} />
                Informasi Peminjam
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Nama</p>
                  <p className="font-medium">{detailItem.userId?.nama}</p>
                </div>
                <div>
                  <p className="text-gray-500">Kelas</p>
                  <p className="font-medium">{detailItem.userId?.kelas || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{detailItem.userId?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">No. Telepon</p>
                  <p className="font-medium">{detailItem.userId?.noTelepon || '-'}</p>
                </div>
              </div>
            </div>

            {/* Info Peminjaman */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <IoCalendar size={16} />
                Jadwal Peminjaman
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Jumlah Pinjam</p>
                  <p className="font-medium">{detailItem.jumlahPinjam} unit</p>
                </div>
                <div>
                  <p className="text-gray-500">Waktu Pinjam</p>
                  <p className="font-medium">{detailItem.waktuPinjam}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tanggal Pinjam</p>
                  <p className="font-medium">{format(new Date(detailItem.tanggalPinjam), 'dd MMMM yyyy', { locale: id })}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tanggal Kembali</p>
                  <p className="font-medium">{format(new Date(detailItem.tanggalKembali), 'dd MMMM yyyy', { locale: id })}</p>
                </div>
              </div>
            </div>

            {/* Alasan Peminjaman */}
            <div className="bg-yellow-50 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Alasan Peminjaman</h4>
              <p className="text-sm text-gray-700">{detailItem.alasanPeminjaman || '-'}</p>
            </div>

            {/* Extension Info */}
            {detailItem.isExtensionRequested && (
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2">Permintaan Perpanjangan</h4>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <p className="text-purple-600/70">Waktu Baru</p>
                    <p className="font-bold text-purple-800">
                      {format(new Date(detailItem.newTanggalKembali), 'dd MMMM yyyy', { locale: id })}
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-600/70">Status</p>
                    <p className="font-bold text-purple-800">{detailItem.extensionStatus}</p>
                  </div>
                </div>
                <p className="text-sm text-purple-700">
                  <span className="font-semibold">Alasan:</span> {detailItem.alasanExtension || '-'}
                </p>
              </div>
            )}

            {/* Alasan Penolakan jika ditolak */}
            {detailItem.status === 'Ditolak' && detailItem.alasanPenolakan && (
              <div className="bg-red-50 p-3 rounded-lg">
                <h4 className="font-semibold text-red-700 mb-2">Alasan Penolakan</h4>
                <p className="text-sm text-red-600">{detailItem.alasanPenolakan}</p>
              </div>
            )}

            {/* Tombol Aksi jika masih Menunggu */}
            {detailItem.status === 'Menunggu' && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="success"
                  fullWidth
                  onClick={() => {
                    setShowDetailModal(false);
                    handleApprove(detailItem);
                  }}
                >
                  <IoCheckmark size={18} />
                  Setujui Peminjaman
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => {
                    setShowDetailModal(false);
                    handleReject(detailItem);
                  }}
                >
                  <IoClose size={18} />
                  Tolak Peminjaman
                </Button>
              </div>
            )}

            {/* Tombol Aksi Extension */}
            {detailItem.status === 'Disetujui' && detailItem.isExtensionRequested && detailItem.extensionStatus === 'Menunggu' && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="warning"
                  fullWidth
                  onClick={() => {
                    setShowDetailModal(false);
                    handleApproveExtension(detailItem);
                  }}
                >
                  <IoCheckmark size={18} />
                  Setujui Perpanjangan
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                  fullWidth
                  onClick={() => {
                    setShowDetailModal(false);
                    handleRejectExtension(detailItem);
                  }}
                >
                  <IoClose size={18} />
                  Tolak Perpanjangan
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div >
  );
};

export default Permintaan;
