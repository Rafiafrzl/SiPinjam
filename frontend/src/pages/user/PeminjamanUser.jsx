import { useState, useEffect } from "react";
import {
  IoList,
  IoCalendar,
  IoTime,
  IoCheckmarkCircle,
  IoClose,
} from "react-icons/io5";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import Modal from "../../components/ui/Modal";
import api from "../../utils/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const PeminjamanUser = () => {
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  // Modal detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);

  useEffect(() => {
    fetchPeminjaman();
  }, [statusFilter]);

  const fetchPeminjaman = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get("/peminjaman/user/my-peminjaman", {
        params,
      });
      setPeminjaman(response.data.data);
    } catch (err) {
      toast.error("Gagal memuat data peminjaman");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Menunggu': "warning",
      'Disetujui': "success",
      'Ditolak': "danger",
      'Selesai': "info",
    };
    const labels = {
      'Menunggu': "MENUNGGU",
      'Disetujui': "DISETUJUI",
      'Ditolak': "DITOLAK",
      'Selesai': "SELESAI",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getStatusPengembalianBadge = (status) => {
    const variants = {
      "belum-kembali": "warning",
      "sudah-kembali": "success",
      terlambat: "danger",
    };
    const labels = {
      "belum-kembali": "BELUM KEMBALI",
      "sudah-kembali": "SUDAH KEMBALI",
      terlambat: "TERLAMBAT",
    };
    return (
      <Badge variant={variants[status]} size="sm">
        {labels[status]}
      </Badge>
    );
  };

  const handleShowDetail = async (id) => {
    try {
      const response = await api.get(`/peminjaman/${id}`);
      setSelectedPeminjaman(response.data.data);
      setShowDetailModal(true);
    } catch (err) {
      toast.error("Gagal memuat detail peminjaman");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat peminjaman..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Peminjaman Saya</h1>
        <p className="text-gray-600 mt-1">Kelola dan pantau peminjaman Anda</p>
      </div>

      {/* Filter Status */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === "" ? "primary" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("")}
        >
          Semua
        </Button>
        <Button
          variant={statusFilter === "menunggu" ? "warning" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("menunggu")}
        >
          Menunggu
        </Button>
        <Button
          variant={statusFilter === "disetujui" ? "success" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("disetujui")}
        >
          Disetujui
        </Button>
        <Button
          variant={statusFilter === "ditolak" ? "danger" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("ditolak")}
        >
          Ditolak
        </Button>
        <Button
          variant={statusFilter === "selesai" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("selesai")}
        >
          Selesai
        </Button>
      </div>

      {/* Peminjaman List */}
      {peminjaman.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <IoList size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Belum ada peminjaman</h3>
            <p>Silakan ajukan peminjaman barang terlebih dahulu</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {peminjaman.map((item) => (
            <Card
              key={item._id}
              hover
              onClick={() => handleShowDetail(item._id)}
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Image */}
                <img
                  src={
                    item.barangId?.foto !== "default-barang.jpg"
                      ? `http://localhost:5001/uploads/${item.barangId?.foto}`
                      : "https://via.placeholder.com/150"
                  }
                  alt={item.barangId?.namaBarang}
                  className="w-full md:w-32 h-32 object-cover rounded-lg"
                />

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {item.barangId?.namaBarang}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Jumlah: {item.jumlahPinjam} unit
                      </p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <IoCalendar />
                      <span>
                        {format(new Date(item.tanggalPinjam), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <IoTime />
                      <span>{item.waktuPinjam}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <IoCheckmarkCircle />
                      <span>
                        Kembali:{" "}
                        {format(new Date(item.tanggalKembali), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </span>
                    </div>
                  </div>

                  {item.status === "disetujui" && (
                    <div>
                      {getStatusPengembalianBadge(item.statusPengembalian)}
                    </div>
                  )}

                  {item.status === "ditolak" && item.alasanPenolakan && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-red-800">
                        <strong>Alasan Ditolak:</strong> {item.alasanPenolakan}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Detail */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Peminjaman"
        size="md"
      >
        {selectedPeminjaman && (
          <div className="space-y-6">
            {/* Barang Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedPeminjaman.barangId?.foto !== "default-barang.jpg"
                      ? `http://localhost:5001/uploads/${selectedPeminjaman.barangId?.foto}`
                      : "https://via.placeholder.com/100"
                  }
                  alt={selectedPeminjaman.barangId?.namaBarang}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-bold text-gray-800">
                    {selectedPeminjaman.barangId?.namaBarang}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedPeminjaman.barangId?.kategori}
                  </p>
                </div>
              </div>
            </div>

            {/* Detail */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                {getStatusBadge(selectedPeminjaman.status)}
              </div>

              {selectedPeminjaman.status === "disetujui" && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Status Pengembalian:</span>
                  {getStatusPengembalianBadge(
                    selectedPeminjaman.statusPengembalian
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Jumlah Pinjam:</span>
                <span className="font-semibold">
                  {selectedPeminjaman.jumlahPinjam} unit
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal Pinjam:</span>
                <span className="font-semibold">
                  {format(
                    new Date(selectedPeminjaman.tanggalPinjam),
                    "dd MMMM yyyy",
                    { locale: id }
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Waktu Pinjam:</span>
                <span className="font-semibold">
                  {selectedPeminjaman.waktuPinjam}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal Kembali:</span>
                <span className="font-semibold">
                  {format(
                    new Date(selectedPeminjaman.tanggalKembali),
                    "dd MMMM yyyy",
                    { locale: id }
                  )}
                </span>
              </div>

              <div className="pt-3 border-t">
                <p className="text-gray-600 mb-2">Alasan Peminjaman:</p>
                <p className="text-gray-800">
                  {selectedPeminjaman.alasanPeminjaman}
                </p>
              </div>

              {selectedPeminjaman.catatanAdmin && (
                <div className="pt-3 border-t bg-blue-50 p-3 rounded">
                  <p className="text-gray-600 mb-1 text-sm">Catatan Admin:</p>
                  <p className="text-gray-800">
                    {selectedPeminjaman.catatanAdmin}
                  </p>
                </div>
              )}

              {selectedPeminjaman.alasanPenolakan && (
                <div className="pt-3 border-t bg-red-50 p-3 rounded">
                  <p className="text-gray-600 mb-1 text-sm">
                    Alasan Penolakan:
                  </p>
                  <p className="text-red-800">
                    {selectedPeminjaman.alasanPenolakan}
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDetailModal(false)}
            >
              Tutup
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PeminjamanUser;
