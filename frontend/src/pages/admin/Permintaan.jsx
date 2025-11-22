import { useState, useEffect } from 'react';
import { IoList, IoCheckmark, IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import api from '../../utils/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Permintaan = () => {
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // approve or reject
  const [selectedItem, setSelectedItem] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      toast.error(errorMessage);
      console.error('Fetch peminjaman error:', err);
      setPeminjaman([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (item) => {
    setModalType('approve');
    setSelectedItem(item);
    setCatatan('');
    setShowModal(true);
  };

  const handleReject = (item) => {
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

  const handleSubmitAction = async () => {
    if (!selectedItem?._id) {
      toast.error('Data peminjaman tidak valid');
      return;
    }

    setSubmitting(true);

    try {
      if (modalType === 'approve') {
        await api.put(`/peminjaman/admin/${selectedItem._id}/approve`, {
          catatanAdmin: catatan.trim()
        });
        toast.success('Peminjaman berhasil disetujui');
      } else {
        if (!catatan.trim()) {
          toast.error('Alasan penolakan harus diisi');
          setSubmitting(false);
          return;
        }
        await api.put(`/peminjaman/admin/${selectedItem._id}/reject`, {
          alasanPenolakan: catatan.trim()
        });
        toast.success('Peminjaman berhasil ditolak');
      }

      setShowModal(false);
      setSelectedItem(null);
      setCatatan('');
      // Force refresh untuk ensure sync
      await fetchPeminjaman();
      setTimeout(() => fetchPeminjaman(), 500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal memproses peminjaman';
      toast.error(errorMessage);

      // Force refresh jika ada sync error
      if (errorMessage.includes('sudah diproses') || errorMessage.includes('tidak ditemukan')) {
        await fetchPeminjaman();
        setTimeout(() => fetchPeminjaman(), 500);
        setShowModal(false);
        setSelectedItem(null);
      }
    } finally {
      setSubmitting(false);
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

      {peminjaman.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <IoList size={64} className="mx-auto mb-4 opacity-50" />
            <p>Tidak ada permintaan</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {peminjaman.map((item) => (
            <Card key={item._id}>
              <div className="flex flex-col md:flex-row gap-4">
                <img
                  src={item.barangId?.foto !== 'default-barang.jpg' ? `http://localhost:5001/uploads/${item.barangId?.foto}` : 'https://via.placeholder.com/150'}
                  alt={item.barangId?.namaBarang}
                  className="w-full md:w-32 h-32 object-cover rounded-lg"
                />

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{item.barangId?.namaBarang}</h3>
                      <p className="text-sm text-gray-600">oleh {item.userId?.nama} ({item.userId?.kelas})</p>
                    </div>
                    <Badge variant={item.status === 'Menunggu' ? 'warning' : item.status === 'Disetujui' ? 'success' : 'danger'}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Jumlah</p>
                      <p className="font-semibold">{item.jumlahPinjam} unit</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tanggal Pinjam</p>
                      <p className="font-semibold">{format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Waktu</p>
                      <p className="font-semibold">{item.waktuPinjam}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Kembali</p>
                      <p className="font-semibold">{format(new Date(item.tanggalKembali), 'dd MMM yyyy', { locale: id })}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 mb-1">Alasan Peminjaman:</p>
                    <p className="text-sm text-gray-800">{item.alasanPeminjaman}</p>
                  </div>

                  {item.status === 'Menunggu' && (
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(item)}
                        disabled={submitting || selectedItem?._id === item._id}
                      >
                        <IoCheckmark size={18} />
                        Setujui
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(item)}
                        disabled={submitting || selectedItem?._id === item._id}
                      >
                        <IoClose size={18} />
                        Tolak
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={modalType === 'approve' ? 'Setujui Peminjaman' : 'Tolak Peminjaman'}
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
              variant={modalType === 'approve' ? 'success' : 'danger'}
              fullWidth
              loading={submitting}
              onClick={handleSubmitAction}
            >
              {modalType === 'approve' ? 'Setujui' : 'Tolak'} Peminjaman
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Permintaan;
