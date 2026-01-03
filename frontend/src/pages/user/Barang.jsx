import { useState, useEffect } from "react";
import { IoGrid, IoSearch, IoFilter } from "react-icons/io5";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Loading from "../../components/ui/Loading";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import api from "../../utils/api";

const Barang = () => {
  const [barang, setBarang] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [formData, setFormData] = useState({
    jumlahPinjam: 1,
    tanggalPinjam: "",
    tanggalKembali: "",
    waktuPinjam: "",
    alasanPeminjaman: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBarang();
  }, []);

  useEffect(() => {
    filterBarang();
  }, [search, kategoriFilter, barang]);

  const fetchBarang = async () => {
    try {
      setLoading(true);
      const response = await api.get("/barang");
      setBarang(response.data.data);
      setFilteredBarang(response.data.data);
    } catch (err) {
      toast.error("Gagal memuat daftar barang");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterBarang = () => {
    let filtered = barang;

    // Filter by search
    if (search) {
      filtered = filtered.filter((item) =>
        item.namaBarang.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by kategori
    if (kategoriFilter) {
      filtered = filtered.filter((item) => item.kategori === kategoriFilter);
    }

    setFilteredBarang(filtered);
  };

  const handlePinjam = (item) => {
    setSelectedBarang(item);
    setFormData({
      jumlahPinjam: 1,
      tanggalPinjam: "",
      tanggalKembali: "",
      waktuPinjam: "",
      alasanPeminjaman: "",
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitPeminjaman = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/peminjaman", {
        barangId: selectedBarang._id,
        ...formData,
      });

      toast.success(
        "Peminjaman berhasil diajukan! Menunggu persetujuan admin."
      );
      setShowModal(false);
      fetchBarang(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengajukan peminjaman");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (item) => {
    if (item.jumlahTersedia === 0) {
      return <Badge variant="danger">Tidak Tersedia</Badge>;
    } else if (item.jumlahTersedia <= 3) {
      return <Badge variant="warning">Terbatas ({item.jumlahTersedia})</Badge>;
    } else {
      return <Badge variant="success">Tersedia ({item.jumlahTersedia})</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat daftar barang..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Daftar Barang</h1>
        <p className="text-gray-600 mt-1">Pilih barang yang ingin dipinjam</p>
      </div>

      {/* Filter & Search */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<IoSearch size={20} />}
          />

          <Select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            options={[
              { value: "", label: "Semua Kategori" },
              { value: "elektronik", label: "Elektronik" },
              { value: "olahraga", label: "Olahraga" },
            ]}
            placeholder="Pilih Kategori"
          />
        </div>
      </Card>

      {/* Kategori Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={kategoriFilter === "" ? "primary" : "outline"}
          size="sm"
          onClick={() => setKategoriFilter("")}
        >
          Semua ({barang.length})
        </Button>
        <Button
          variant={kategoriFilter === "elektronik" ? "primary" : "outline"}
          size="sm"
          onClick={() => setKategoriFilter("elektronik")}
        >
          Elektronik ({barang.filter((b) => b.kategori === "elektronik").length}
          )
        </Button>
        <Button
          variant={kategoriFilter === "olahraga" ? "primary" : "outline"}
          size="sm"
          onClick={() => setKategoriFilter("olahraga")}
        >
          Olahraga ({barang.filter((b) => b.kategori === "olahraga").length})
        </Button>
      </div>

      {/* Barang List */}
      {filteredBarang.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <IoGrid size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">
              Barang tidak ditemukan
            </h3>
            <p>Coba ubah kata kunci pencarian atau filter kategori</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBarang.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              {/* Image */}
              <div className="relative -mx-6 -mt-6 mb-4">
                <img
                  src={
                    item.foto !== "default-barang.jpg"
                      ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${item.foto}`
                      : "https://via.placeholder.com/400x300?text=No+Image"
                  }
                  alt={item.namaBarang}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={
                      item.kategori === "elektronik" ? "primary" : "success"
                    }
                    className="text-xs"
                  >
                    {item.kategori.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {item.namaBarang}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.deskripsi}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lokasi:</span>
                  <span className="font-semibold">{item.lokasi}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Kondisi:</span>
                  <Badge
                    variant={item.kondisi === "baik" ? "success" : "warning"}
                  >
                    {item.kondisi}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  {getStatusBadge(item)}
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  disabled={item.jumlahTersedia === 0}
                  onClick={() => handlePinjam(item)}
                >
                  {item.jumlahTersedia === 0
                    ? "Tidak Tersedia"
                    : "Ajukan Peminjaman"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Peminjaman */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Ajukan Peminjaman"
        size="md"
      >
        {selectedBarang && (
          <form onSubmit={handleSubmitPeminjaman} className="space-y-4">
            {/* Info Barang */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                {selectedBarang.namaBarang}
              </h4>
              <p className="text-sm text-gray-600">
                Tersedia: {selectedBarang.jumlahTersedia} unit
              </p>
            </div>

            <Input
              label="Jumlah Pinjam"
              type="number"
              name="jumlahPinjam"
              value={formData.jumlahPinjam}
              onChange={handleFormChange}
              min="1"
              max={selectedBarang.jumlahTersedia}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tanggal Pinjam"
                type="date"
                name="tanggalPinjam"
                value={formData.tanggalPinjam}
                onChange={handleFormChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />

              <Input
                label="Tanggal Kembali"
                type="date"
                name="tanggalKembali"
                value={formData.tanggalKembali}
                onChange={handleFormChange}
                min={
                  formData.tanggalPinjam ||
                  new Date().toISOString().split("T")[0]
                }
                required
              />
            </div>

            <Input
              label="Waktu Pinjam"
              type="time"
              name="waktuPinjam"
              value={formData.waktuPinjam}
              onChange={handleFormChange}
              required
            />

            <Textarea
              label="Alasan Peminjaman"
              name="alasanPeminjaman"
              value={formData.alasanPeminjaman}
              onChange={handleFormChange}
              placeholder="Jelaskan untuk keperluan apa barang ini dipinjam..."
              rows={4}
              required
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setShowModal(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={submitting}
              >
                Ajukan Peminjaman
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Barang;
