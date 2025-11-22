import { useState, useEffect } from 'react';
import { IoLibrary, IoPeople, IoList, IoCheckmarkCircle, IoTime, IoWarning } from 'react-icons/io5';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/statistik/admin');
      setStats(response.data.data);
    } catch (err) {
      toast.error('Gagal memuat data dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      menunggu: 'warning',
      disetujui: 'success',
      ditolak: 'danger',
      selesai: 'info'
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Selamat datang! Kelola peminjaman barang sekolah</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="!bg-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Barang</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.barang?.total || 0}</h3>
              <p className="text-blue-100 text-xs mt-2">
                Elektronik: {stats?.barang?.elektronik} | Olahraga: {stats?.barang?.olahraga}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoLibrary size={32} />
            </div>
          </div>
        </Card>

        <Card className="!bg-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total User</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.user?.total || 0}</h3>
              <p className="text-purple-100 text-xs mt-2">Siswa terdaftar</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoPeople size={32} />
            </div>
          </div>
        </Card>

        <Card className="!bg-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Sedang Dipinjam</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.aktivitas?.sedangDipinjam || 0}</h3>
              <p className="text-green-100 text-xs mt-2">Barang aktif dipinjam</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoList size={32} />
            </div>
          </div>
        </Card>

        <Card className="!bg-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Menunggu Approval</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.peminjaman?.menunggu || 0}</h3>
              <p className="text-yellow-100 text-xs mt-2">Permintaan pending</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoTime size={32} />
            </div>
          </div>
        </Card>
      </div>

      {/* Peminjaman Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Statistik Peminjaman</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IoList className="text-blue-600" size={24} />
                  <span className="text-gray-700">Total Peminjaman</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats?.peminjaman?.total || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IoTime className="text-yellow-600" size={24} />
                  <span className="text-gray-700">Menunggu</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{stats?.peminjaman?.menunggu || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IoCheckmarkCircle className="text-green-600" size={24} />
                  <span className="text-gray-700">Disetujui</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats?.peminjaman?.disetujui || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IoWarning className="text-red-600" size={24} />
                  <span className="text-gray-700">Terlambat</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{stats?.aktivitas?.terlambat || 0}</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Barang Popular */}
        <Card>
          <Card.Header>
            <Card.Title>Barang Paling Sering Dipinjam</Card.Title>
          </Card.Header>
          <Card.Content>
            {stats?.barangPopular?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.barangPopular?.slice(0, 5).map((item, index) => (
                  <div key={item._id?._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 font-bold w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item._id?.namaBarang}</p>
                        <p className="text-xs text-gray-500">{item._id?.kategori}</p>
                      </div>
                    </div>
                    <Badge variant="primary">{item.totalPeminjaman}x</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Peminjaman Terbaru */}
      <Card>
        <Card.Header>
          <Card.Title>Peminjaman Terbaru</Card.Title>
        </Card.Header>
        <Card.Content>
          {stats?.peminjamanTerbaru?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada peminjaman</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Siswa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Barang</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats?.peminjamanTerbaru?.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{item.userId?.nama}</p>
                          <p className="text-sm text-gray-500">{item.userId?.kelas}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800">{item.barangId?.namaBarang}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminDashboard;
