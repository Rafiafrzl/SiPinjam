import { useState, useEffect } from "react";
import {
  IoLibrary,
  IoPeople,
  IoList,
  IoCheckmarkCircle,
  IoTime,
  IoWarning,
} from "react-icons/io5";
import Toast from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Loading from "../../components/ui/Loading";
import api from "../../utils/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import usePolling from "../../hooks/usePolling";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/statistik/admin");
      setStats(response.data.data);
    } catch (err) {
      if (!silent) Toast.error("Gagal memuat data dashboard");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  usePolling(() => fetchDashboardData(true), 10000); // Poll every 10 seconds for general stats

  const getStatusBadge = (status) => {
    const variants = {
      Menunggu: "warning",
      Disetujui: "success",
      Ditolak: "danger",
      Selesai: "info",
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Dashboard Admin
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Selamat datang! Kelola peminjaman barang sekolah
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!bg-blue-600 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Total Barang</p>
              <h3 className="text-xl font-bold mt-1">
                {stats?.barang?.total || 0}
              </h3>
              <p className="text-blue-100 text-xs">
                Elektronik: {stats?.barang?.elektronik} | Olahraga:{" "}
                {stats?.barang?.olahraga}
              </p>
            </div>
            <IoLibrary size={24} className="text-white" />
          </div>
        </Card>

        <Card className="!bg-purple-600 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">Total User</p>
              <h3 className="text-xl font-bold mt-1">
                {stats?.user?.total || 0}
              </h3>
              <p className="text-purple-100 text-xs">Siswa terdaftar</p>
            </div>
            <IoPeople size={24} className="text-white" />
          </div>
        </Card>

        <Card className="!bg-green-600 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Sedang Dipinjam</p>
              <h3 className="text-xl font-bold mt-1">
                {stats?.aktivitas?.sedangDipinjam || 0}
              </h3>
              <p className="text-green-100 text-xs">Barang aktif dipinjam</p>
            </div>
            <IoList size={24} className="text-white" />
          </div>
        </Card>

        <Card className="!bg-yellow-600 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-xs">Menunggu Approval</p>
              <h3 className="text-xl font-bold mt-1">
                {stats?.peminjaman?.menunggu || 0}
              </h3>
              <p className="text-yellow-100 text-xs">Permintaan pending</p>
            </div>
            <IoTime size={24} className="text-white" />
          </div>
        </Card>
      </div>

      {/* Peminjaman Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-3">
          <Card.Header className="p-3">
            <Card.Title className="text-sm">Statistik Peminjaman</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <IoList className="text-blue-600" size={20} />
                  <span className="text-gray-700 text-sm">
                    Total Peminjaman
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-800">
                  {stats?.peminjaman?.total || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <IoTime className="text-yellow-600" size={20} />
                  <span className="text-gray-700 text-sm">Menunggu</span>
                </div>
                <span className="text-xl font-bold text-yellow-600">
                  {stats?.peminjaman?.menunggu || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <IoCheckmarkCircle className="text-green-600" size={20} />
                  <span className="text-gray-700 text-sm">Disetujui</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {stats?.peminjaman?.disetujui || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <IoWarning className="text-red-600" size={20} />
                  <span className="text-gray-700 text-sm">Terlambat</span>
                </div>
                <span className="text-xl font-bold text-red-600">
                  {stats?.aktivitas?.terlambat || 0}
                </span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Barang Popular */}
        <Card className="p-3">
          <Card.Header className="p-3">
            <Card.Title className="text-sm">
              Barang Paling Sering Dipinjam
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {stats?.barangPopular?.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>Belum ada data</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.barangPopular?.slice(0, 5).map((item, index) => (
                  <div
                    key={item._id?._id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 font-bold w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item._id?.namaBarang}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item._id?.kategori}
                        </p>
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
      <Card className="p-3">
        <Card.Header className="p-3">
          <Card.Title className="text-sm">Peminjaman Terbaru</Card.Title>
        </Card.Header>
        <Card.Content>
          {stats?.peminjamanTerbaru?.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>Belum ada peminjaman</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Siswa
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Barang
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats?.peminjamanTerbaru?.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.userId?.nama}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.userId?.kelas}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800">
                          {item.barangId?.namaBarang}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(item.tanggalPinjam), "dd MMM yyyy", {
                          locale: id,
                        })}
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
