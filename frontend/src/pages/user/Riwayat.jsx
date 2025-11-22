import { useState, useEffect } from 'react';
import { IoTime, IoCheckmarkCircle, IoClose, IoCalendar } from 'react-icons/io5';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Riwayat = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const response = await api.get('/peminjaman/user/riwayat');
      setRiwayat(response.data.data);
    } catch (err) {
      toast.error('Gagal memuat riwayat peminjaman');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Disetujui' || status === 'Selesai') {
      return <IoCheckmarkCircle className="text-green-500" size={24} />;
    }
    return <IoClose className="text-red-500" size={24} />;
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Disetujui': 'success',
      'Ditolak': 'danger',
      'Selesai': 'info'
    };
    const labels = {
      'Disetujui': 'DISETUJUI',
      'Ditolak': 'DITOLAK',
      'Selesai': 'SELESAI'
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getStatusPengembalianBadge = (status) => {
    const variants = {
      'sudah-kembali': 'success',
      'terlambat': 'danger'
    };
    const labels = {
      'sudah-kembali': 'TEPAT WAKTU',
      'terlambat': 'TERLAMBAT'
    };
    return <Badge variant={variants[status]} size="sm">{labels[status]}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat riwayat..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Riwayat Peminjaman</h1>
        <p className="text-gray-600 mt-1">Lihat semua riwayat peminjaman Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="!bg-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Disetujui</p>
              <h3 className="text-2xl font-bold text-white">
                {riwayat.filter(r => r.status === 'Disetujui' || r.status === 'Selesai').length}
              </h3>
            </div>
            <IoCheckmarkCircle className="text-white" size={40} />
          </div>
        </Card>

        <Card className="!bg-rose-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm">Total Ditolak</p>
              <h3 className="text-2xl font-bold text-white">
                {riwayat.filter(r => r.status === 'Ditolak').length}
              </h3>
            </div>
            <IoClose className="text-white" size={40} />
          </div>
        </Card>

        <Card className="!bg-slate-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm">Total Riwayat</p>
              <h3 className="text-2xl font-bold text-white">{riwayat.length}</h3>
            </div>
            <IoTime className="text-white" size={40} />
          </div>
        </Card>
      </div>

      {/* Riwayat List */}
      {riwayat.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <IoTime size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Belum ada riwayat</h3>
            <p>Riwayat peminjaman Anda akan muncul di sini</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {riwayat.map((item) => (
            <Card key={item._id}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(item.status)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{item.barangId?.namaBarang}</h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(item.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
                      </p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jumlah:</span>
                        <span className="font-semibold">{item.jumlahPinjam} unit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal Pinjam:</span>
                        <span className="font-semibold">
                          {format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Waktu:</span>
                        <span className="font-semibold">{item.waktuPinjam}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal Kembali:</span>
                        <span className="font-semibold">
                          {format(new Date(item.tanggalKembali), 'dd MMM yyyy', { locale: id })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Pengembalian */}
                  {item.status === 'Selesai' && item.tanggalDikembalikan && (
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Dikembalikan:</span>
                        <span className="font-semibold">
                          {format(new Date(item.tanggalDikembalikan), 'dd MMMM yyyy', { locale: id })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Status Pengembalian:</span>
                        {getStatusPengembalianBadge(item.statusPengembalian)}
                      </div>
                    </div>
                  )}

                  {/* Alasan Peminjaman */}
                  <div className="bg-blue-50 p-3 rounded mb-3">
                    <p className="text-xs text-gray-600 mb-1">Alasan Peminjaman:</p>
                    <p className="text-sm text-gray-800">{item.alasanPeminjaman}</p>
                  </div>

                  {/* Catatan Admin / Alasan Penolakan */}
                  {item.catatanAdmin && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded">
                      <p className="text-xs text-green-600 mb-1">Catatan Admin:</p>
                      <p className="text-sm text-green-800">{item.catatanAdmin}</p>
                    </div>
                  )}

                  {item.alasanPenolakan && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded">
                      <p className="text-xs text-red-600 mb-1">Alasan Ditolak:</p>
                      <p className="text-sm text-red-800">{item.alasanPenolakan}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Riwayat;
