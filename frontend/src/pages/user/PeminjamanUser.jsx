import { useState, useEffect } from "react";
import {
  IoList,
  IoCalendar,
  IoTime,
  IoCheckmarkCircle,
  IoEye,
  IoClose,
  IoHourglass,
  IoCheckmarkDone
} from "react-icons/io5";
import Toast from "../../components/ui/Toast";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import Modal from "../../components/ui/Modal";
import api from "../../utils/api";
import { getImageUrl } from "../../utils/imageHelper";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const PeminjamanUser = () => {
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);

  useEffect(() => {
    fetchPeminjaman();
  }, [statusFilter]);

  const fetchPeminjaman = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get("/peminjaman/user/my-peminjaman", { params });
      setPeminjaman(response.data.data);
    } catch (err) {
      Toast.error("Gagal memuat data peminjaman");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'Menunggu': 'bg-amber-500 text-white',
      'Disetujui': 'bg-emerald-500 text-white',
      'Ditolak': 'bg-red-500 text-white',
      'Selesai': 'bg-blue-500 text-white',
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full ${config[status]}`}>
        {status}
      </span>
    );
  };

  const handleShowDetail = async (id) => {
    try {
      const response = await api.get(`/peminjaman/${id}`);
      setSelectedPeminjaman(response.data.data);
      setShowDetailModal(true);
    } catch (err) {
      Toast.error("Gagal memuat detail");
    }
  };

  const filterTabs = [
    { value: '', label: 'Semua', icon: IoList },
    { value: 'menunggu', label: 'Menunggu', icon: IoHourglass },
    { value: 'disetujui', label: 'Disetujui', icon: IoCheckmarkCircle },
    { value: 'ditolak', label: 'Ditolak', icon: IoClose },
    { value: 'selesai', label: 'Selesai', icon: IoCheckmarkDone },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat peminjaman..." />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Peminjaman Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola dan pantau status peminjaman</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-sm transition-all ${statusFilter === tab.value
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                }`}
              onClick={() => setStatusFilter(tab.value)}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {peminjaman.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 text-center">
          <IoList className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada peminjaman</h3>
          <p className="text-sm text-gray-500">Silakan ajukan peminjaman barang terlebih dahulu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {peminjaman.map((item) => (
            <div
              key={item._id}
              onClick={() => handleShowDetail(item._id)}
              className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer"
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={getImageUrl(item.barangId?.foto, 'https://via.placeholder.com/80')}
                    alt={item.barangId?.namaBarang}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {item.barangId?.namaBarang}
                    </h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">
                    {item.jumlahPinjam} unit
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <IoCalendar size={12} />
                      {format(new Date(item.tanggalPinjam), "dd MMM", { locale: id })}
                    </span>
                    <span className="flex items-center gap-1">
                      <IoTime size={12} />
                      {item.waktuPinjam}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center">
                  <IoEye size={20} className="text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Peminjaman" size="md">
        {selectedPeminjaman && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
              <img
                src={getImageUrl(selectedPeminjaman.barangId?.foto, 'https://via.placeholder.com/80')}
                alt={selectedPeminjaman.barangId?.namaBarang}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-bold text-gray-800">{selectedPeminjaman.barangId?.namaBarang}</h4>
                <p className="text-sm text-gray-500 capitalize">{selectedPeminjaman.barangId?.kategori}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Status</span>
                {getStatusBadge(selectedPeminjaman.status)}
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Jumlah</span>
                <span className="font-semibold">{selectedPeminjaman.jumlahPinjam} unit</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Tanggal Pinjam</span>
                <span className="font-semibold">{format(new Date(selectedPeminjaman.tanggalPinjam), "dd MMM yyyy", { locale: id })}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Waktu</span>
                <span className="font-semibold">{selectedPeminjaman.waktuPinjam}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Tanggal Kembali</span>
                <span className="font-semibold">{format(new Date(selectedPeminjaman.tanggalKembali), "dd MMM yyyy", { locale: id })}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Alasan:</p>
              <p className="text-sm text-gray-800">{selectedPeminjaman.alasanPeminjaman}</p>
            </div>

            {selectedPeminjaman.alasanPenolakan && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl">
                <p className="text-xs text-red-600 font-medium mb-1">Alasan Ditolak:</p>
                <p className="text-sm text-red-800">{selectedPeminjaman.alasanPenolakan}</p>
              </div>
            )}

            <Button variant="secondary" fullWidth onClick={() => setShowDetailModal(false)}>
              Tutup
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PeminjamanUser;
