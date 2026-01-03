import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoBusiness, IoList, IoCheckmarkCircle, IoTime, IoArrowForward } from 'react-icons/io5';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import useAuth from '../../hooks/useAuth';
import api from '../../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentPeminjaman, setRecentPeminjaman] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, peminjamanRes] = await Promise.all([
          api.get('/statistik/user'),
          api.get('/peminjaman/user/my-peminjaman', { params: { limit: 5 } })
        ]);

        if (isMounted) {
          setStats(statsRes.data.data);
          setRecentPeminjaman(peminjamanRes.data.data || []);
        }
      } catch (err) {
        if (isMounted) {
          toast.error('Gagal memuat data dashboard');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      'Menunggu': 'warning',
      'Disetujui': 'success',
      'Ditolak': 'danger',
      'Selesai': 'info'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">Selamat datang kembali, {user?.nama}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Total Peminjaman</p>
              <h3 className="text-xl font-bold mt-1">{stats?.total || 0}</h3>
            </div>
            <IoBusiness size={24} className="text-white" />
          </div>
        </Card>

        <Card className="!bg-orange-500 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">Menunggu</p>
              <h3 className="text-xl font-bold mt-1">{stats?.menunggu || 0}</h3>
            </div>
            <IoTime size={24} className="text-white" />
          </div>
        </Card>

        <Card className="!bg-teal-500 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-xs">Sedang Dipinjam</p>
              <h3 className="text-xl font-bold mt-1">{stats?.aktif || 0}</h3>
            </div>
            <IoList size={24} className="text-white" />
          </div>
        </Card>

        <Card className="!bg-indigo-500 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-xs">Selesai</p>
              <h3 className="text-xl font-bold mt-1">{stats?.selesai || 0}</h3>
            </div>
            <IoCheckmarkCircle size={24} className="text-white" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/barang">
          <Card hover className="bg-white border-2 border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Lihat Barang</h3>
                <p className="text-gray-600 text-xs mt-1">Cari barang yang ingin dipinjam</p>
              </div>
              <IoArrowForward className="text-blue-600" size={20} />
            </div>
          </Card>
        </Link>

        <Link to="/peminjaman">
          <Card hover className="bg-white border-2 border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Peminjaman Saya</h3>
                <p className="text-gray-600 text-xs mt-1">Cek status peminjaman Anda</p>
              </div>
              <IoArrowForward className="text-blue-600" size={20} />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Peminjaman */}
      <Card className="p-3">
        <Card.Header className="p-3">
          <div className="flex items-center justify-between">
            <Card.Title className="text-sm">Peminjaman Terbaru</Card.Title>
            <Link to="/peminjaman" className="text-blue-600 hover:underline text-xs font-medium">
              Lihat Semua
            </Link>
          </div>
        </Card.Header>

        <Card.Content className="p-3">
          {recentPeminjaman.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <IoBusiness size={32} className="mx-auto mb-1 opacity-50" />
              <p className="text-sm">Belum ada peminjaman</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPeminjaman.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.barangId?.foto ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${item.barangId.foto}` : '/default-barang.jpg'}
                      alt={item.barangId?.namaBarang}
                      className="w-8 h-8 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{item.barangId?.namaBarang}</h4>
                      <p className="text-xs text-gray-600">
                        {new Date(item.tanggalPinjam).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;
