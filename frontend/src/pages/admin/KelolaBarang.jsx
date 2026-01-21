import { useState, useEffect } from "react";
import {
  IoAdd,
  IoCreate,
  IoTrash,
  IoSearch,
  IoCloudUpload,
  IoClose,
  IoCheckbox,
  IoSquareOutline
} from "react-icons/io5";
import Toast from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Badge from "../../components/ui/Badge";
import Loading from "../../components/ui/Loading";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import api from "../../utils/api";
import { getImageUrl } from "../../utils/imageHelper";

const ITEMS_PER_PAGE = 10;

const KelolaBarang = () => {
  const [barang, setBarang] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add or edit
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    namaBarang: "",
    kategori: "",
    deskripsi: "",
    jumlahTotal: "",
    kondisi: "baik",
    lokasi: "",
    foto: null,
  });

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, nama: "" });

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
    } catch (err) {
      Toast.error(err.response?.data?.message || "Gagal memuat data barang");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const filterBarang = () => {
    let filtered = barang;

    if (search) {
      filtered = filtered.filter((item) =>
        item.namaBarang.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (kategoriFilter) {
      filtered = filtered.filter((item) => item.kategori === kategoriFilter);
    }

    setFilteredBarang(filtered);
    setCurrentPage(1);
  };

  // Pagination: potong data berdasarkan halaman
  const totalPages = Math.ceil(filteredBarang.length / ITEMS_PER_PAGE);
  const paginatedBarang = filteredBarang.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddNew = () => {
    setModalMode("add");
    setSelectedBarang(null);
    setFormData({
      namaBarang: "",
      kategori: "",
      deskripsi: "",
      jumlahTotal: "",
      kondisi: "baik",
      lokasi: "",
      foto: null,
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode("edit");
    setSelectedBarang(item);
    setFormData({
      namaBarang: item.namaBarang,
      kategori: item.kategori,
      deskripsi: item.deskripsi,
      jumlahTotal: item.jumlahTotal,
      kondisi: item.kondisi,
      lokasi: item.lokasi || "",
      foto: null,
    });
    // Set existing image as preview
    if (item.foto && item.foto !== "default-barang.jpg") {
      setImagePreview(getImageUrl(item.foto));
    } else {
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleDelete = (id, namaBarang) => {
    setItemToDelete({ id, nama: namaBarang });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/barang/${itemToDelete.id}`);
      Toast.success("Barang dan semua data terkait berhasil dihapus permanen");
      setShowDeleteModal(false);
      fetchBarang();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Gagal menghapus barang";
      Toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Multi-select handlers
  const handleSelectOne = (barangId) => {
    setSelectedIds(prev => {
      if (prev.includes(barangId)) {
        return prev.filter(id => id !== barangId);
      }
      return [...prev, barangId];
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedBarang.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedBarang.map(item => item._id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      setSubmitting(true);
      for (const barangId of selectedIds) {
        await api.delete(`/barang/${barangId}`);
      }
      Toast.success(`${selectedIds.length} barang berhasil dihapus`);
      setShowBulkDeleteModal(false);
      setSelectedIds([]);
      fetchBarang();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Gagal menghapus barang');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    if (e.target.name === "foto") {
      const file = e.target.files[0];
      setFormData({ ...formData, foto: file });

      // Create image preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, foto: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("namaBarang", formData.namaBarang);
      data.append("kategori", formData.kategori);
      data.append("deskripsi", formData.deskripsi);
      data.append("jumlahTotal", formData.jumlahTotal);
      data.append("kondisi", formData.kondisi);
      data.append("lokasi", formData.lokasi);
      if (formData.foto) {
        data.append("foto", formData.foto);
      }

      if (modalMode === "add") {
        await api.post("/barang", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Toast.success("Barang berhasil ditambahkan");
      } else {
        await api.put(`/barang/${selectedBarang._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Toast.success("Barang berhasil diupdate");
      }

      setShowModal(false);
      fetchBarang();
    } catch (err) {
      Toast.error(err.response?.data?.message || "Gagal menyimpan barang");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Memuat data barang..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kelola Barang</h1>
          <p className="text-gray-600 mt-1">Tambah, edit, dan hapus barang</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="danger" onClick={() => setShowBulkDeleteModal(true)}>
              <IoTrash size={20} />
              Hapus {selectedIds.length} Terpilih
            </Button>
          )}
          <Button variant="primary" onClick={handleAddNew}>
            <IoAdd size={20} />
            Tambah Barang
          </Button>
        </div>
      </div>

      {/* Filter */}
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
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {/* Select All Bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            {selectedIds.length === paginatedBarang.length && paginatedBarang.length > 0 ? (
              <IoCheckbox size={22} className="text-blue-600" />
            ) : (
              <IoSquareOutline size={22} />
            )}
            <span className="font-medium">
              {selectedIds.length === paginatedBarang.length && paginatedBarang.length > 0
                ? 'Batal Pilih Semua'
                : 'Pilih Semua'}
            </span>
          </button>
          {selectedIds.length > 0 && (
            <span className="text-xs text-gray-500">
              ({selectedIds.length} dipilih)
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-12"></th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Foto
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Nama Barang
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Tersedia
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Kondisi
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedBarang.map((item) => (
                <tr
                  key={item._id}
                  className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(item._id) ? 'bg-blue-50' : ''
                    }`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleSelectOne(item._id)}
                      className="flex items-center justify-center"
                    >
                      {selectedIds.includes(item._id) ? (
                        <IoCheckbox size={22} className="text-blue-600" />
                      ) : (
                        <IoSquareOutline size={22} className="text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <img
                      src={getImageUrl(item.foto, 'https://via.placeholder.com/50')}
                      alt={item.namaBarang}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {item.namaBarang}
                    </p>
                    <p className="text-xs text-gray-500">{item.lokasi}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        item.kategori === "elektronik" ? "primary" : "success"
                      }
                    >
                      {item.kategori}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {item.jumlahTotal}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={item.jumlahTersedia > 3 ? "success" : "warning"}
                    >
                      {item.jumlahTersedia}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={item.kondisi === "baik" ? "success" : "warning"}
                    >
                      {item.kondisi}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <IoCreate size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item._id, item.namaBarang)}
                        className="text-red-600"
                      >
                        <IoTrash size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === "add" ? "Tambah Barang Baru" : "Edit Barang"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Barang"
            name="namaBarang"
            value={formData.namaBarang}
            onChange={handleFormChange}
            required
          />

          <Select
            label="Kategori"
            name="kategori"
            value={formData.kategori}
            onChange={handleFormChange}
            options={[
              { value: "elektronik", label: "Elektronik" },
              { value: "olahraga", label: "Olahraga" },
            ]}
            required
          />

          <Textarea
            label="Deskripsi"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleFormChange}
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Jumlah Total"
              type="number"
              name="jumlahTotal"
              value={formData.jumlahTotal}
              onChange={handleFormChange}
              min="1"
              required
            />

            <Select
              label="Kondisi"
              name="kondisi"
              value={formData.kondisi}
              onChange={handleFormChange}
              options={[
                { value: "baik", label: "Baik" },
                { value: "rusak ringan", label: "Rusak Ringan" },
                { value: "rusak berat", label: "Rusak Berat" },
              ]}
              required
            />
          </div>

          <Input
            label="Lokasi"
            name="lokasi"
            value={formData.lokasi}
            onChange={handleFormChange}
            placeholder="Contoh: Lab Komputer, Gudang Olahraga"
          />

          {/* Image Upload with Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Barang
            </label>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg"
                >
                  <IoClose size={20} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <IoCloudUpload size={48} className="text-indigo-500 mb-3" />
                  <p className="mb-2 text-sm text-gray-700">
                    <span className="font-semibold">Klik untuk upload</span>{" "}
                    atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF (Max: 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  name="foto"
                  onChange={handleFormChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            )}
          </div>

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
              {modalMode === "add" ? "Tambah" : "Update"} Barang
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus Massal */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title="Hapus Barang Terpilih"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoTrash className="text-red-600" size={32} />
          </div>
          <p className="text-gray-600 mb-2">
            Apakah Anda yakin ingin menghapus:
          </p>
          <p className="font-semibold text-gray-800 mb-4">
            {selectedIds.length} barang terpilih
          </p>
          <p className="text-sm text-red-500 mb-4">
            Tindakan ini tidak dapat dibatalkan!
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowBulkDeleteModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              fullWidth
              loading={submitting}
              onClick={handleBulkDelete}
            >
              Hapus Semua
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Konfirmasi Hapus Tunggal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hapus Barang"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoTrash className="text-red-600" size={32} />
          </div>
          <p className="text-gray-600 mb-2">
            Apakah Anda yakin ingin menghapus:
          </p>
          <p className="font-semibold text-gray-800 mb-4 px-2 break-words">
            "{itemToDelete.nama}"
          </p>
          <p className="text-sm text-red-500 mb-4 px-4">
            Semua data terkait barang ini akan dihapus permanen.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={confirmDelete}
              loading={submitting}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KelolaBarang;
