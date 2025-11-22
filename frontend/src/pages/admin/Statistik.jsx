import { useState, useEffect } from 'react';
import { IoStatsChart, IoArchive, IoPeople, IoList } from 'react-icons/io5';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';

const Statistik = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStatistik();
  }, []);

  const fetchStatistik = async () => {
    try {
      setLoading(true);
      const response = await api.get('/statistik/admin');
      setStats(response.data.data || response.data || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat statistik');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Memuat statistik..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Statistik & Laporan</h1>
        <p className="text-gray-600 mt-1">Ringkasan lengkap aktivitas peminjaman</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="!bg-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Barang</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.barang?.total || 0}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoArchive size={32} />
            </div>
          </div>
        </Card>

        <Card className="!bg-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total User</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.user?.total || 0}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoPeople size={32} />
            </div>
          </div>
        </Card>

        <Card className="!bg-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Peminjaman</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.peminjaman?.total || 0}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoList size={32} />
            </div>
          </div>
        </Card>

        <Card className="!bg-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Sedang Dipinjam</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.aktivitas?.sedangDipinjam || 0}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <IoStatsChart size={32} />
            </div>
          </div>
        </Card>
      </div>

      {/* Detail Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Statistik Barang per Kategori</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-medium">Elektronik</span>
                <Badge variant="primary" size="lg">{stats?.barang?.elektronik || 0} barang</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="font-medium">Olahraga</span>
                <Badge variant="success" size="lg">{stats?.barang?.olahraga || 0} barang</Badge>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Status Peminjaman</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Menunggu Approval</span>
                <Badge variant="warning">{stats?.peminjaman?.menunggu || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Disetujui</span>
                <Badge variant="success">{stats?.peminjaman?.disetujui || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Ditolak</span>
                <Badge variant="danger">{stats?.peminjaman?.ditolak || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Selesai</span>
                <Badge variant="info">{stats?.peminjaman?.selesai || 0}</Badge>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Top Items */}
      <Card>
        <Card.Header>
          <Card.Title>Top 10 Barang Paling Sering Dipinjam</Card.Title>
        </Card.Header>
        <Card.Content>
          {stats?.barangPopular?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada data</p>
          ) : (
            <div className="space-y-2">
              {stats?.barangPopular?.slice(0, 10).map((item, index) => (
                <div key={item._id?._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item._id?.namaBarang}</p>
                      <p className="text-xs text-gray-500">{item._id?.kategori}</p>
                    </div>
                  </div>
                  <Badge variant="primary" size="lg">{item.totalPeminjaman} kali</Badge>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default Statistik;
