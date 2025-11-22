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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang kembali, {user?.nama}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Peminjaman</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.total || 0}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoBusiness size={32} />
            </div>
          </div>
        </Card>

        <Card className="!bg-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Menunggu</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.menunggu || 0}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoTime size={32} />
            </div>
          </div>
        </Card>

        <Card className="!bg-teal-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Sedang Dipinjam</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.aktif || 0}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoList size={32} />
            </div>
          </div>
        </Card>

        <Card className="!bg-indigo-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Selesai</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.selesai || 0}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoCheckmarkCircle size={32} />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/barang">
          <Card hover className="bg-white border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Lihat Daftar Barang</h3>
                <p className="text-gray-600 text-sm mt-1">Cari barang yang ingin dipinjam</p>
              </div>
              <IoArrowForward className="text-blue-600" size={24} />
            </div>
          </Card>
        </Link>

        <Link to="/peminjaman">
          <Card hover className="bg-white border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Peminjaman Saya</h3>
                <p className="text-gray-600 text-sm mt-1">Cek status peminjaman Anda</p>
              </div>
              <IoArrowForward className="text-blue-600" size={24} />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Peminjaman */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>Peminjaman Terbaru</Card.Title>
            <Link to="/peminjaman" className="text-blue-600 hover:underline text-sm font-medium">
              Lihat Semua
            </Link>
          </div>
        </Card.Header>

        <Card.Content>
          {recentPeminjaman.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <IoBusiness size={48} className="mx-auto mb-2 opacity-50" />
              <p>Belum ada peminjaman</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPeminjaman.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.barangId?.foto ? `http://localhost:5001/uploads/${item.barangId.foto}` : '/default-barang.jpg'}
                      alt={item.barangId?.namaBarang}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.barangId?.namaBarang}</h4>
                      <p className="text-sm text-gray-600">
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
