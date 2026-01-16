import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  IoSearch,
  IoFilter,
  IoLocation,
  IoApps,
  IoDesktop,
  IoFootball,
  IoClose,
  IoChevronBack,
  IoChevronForward
} from 'react-icons/io5';
import { toast } from 'react-toastify';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import api from '../../utils/api';

const Barang = () => {
  const [searchParams] = useSearchParams();
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || ''); // Input sementara
  const [search, setSearch] = useState(searchParams.get('search') || ''); // Nilai yang disubmit
  const [kategori, setKategori] = useState(searchParams.get('kategori') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [formData, setFormData] = useState({
    jumlahPinjam: 1,
    tanggalPinjam: '',
    waktuPinjam: '',
    tanggalKembali: '',
    alasanPeminjaman: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch data ketika search atau kategori berubah
  useEffect(() => {
    fetchBarang();
    setCurrentPage(1);
  }, [search, kategori]);

  const fetchBarang = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (kategori) params.kategori = kategori;
      const response = await api.get('/barang', { params });
      setBarang(response.data.data);
    } catch (err) {
      toast.error('Gagal memuat data barang');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item) => {
    setSelectedBarang(item);
    setFormData({
      jumlahPinjam: 1,
      tanggalPinjam: '',
      waktuPinjam: '',
      tanggalKembali: '',
      alasanPeminjaman: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.jumlahPinjam > selectedBarang.jumlahTersedia) {
      toast.error('Jumlah melebihi stok tersedia');
      return;
    }
    try {
      setSubmitLoading(true);
      await api.post('/peminjaman', {
        barangId: selectedBarang._id,
        ...formData
      });
      toast.success('Peminjaman berhasil diajukan!');
      setShowModal(false);
      fetchBarang();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengajukan peminjaman');
    } finally {
      setSubmitLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'Semua', icon: IoApps, color: 'blue' },
    { value: 'elektronik', label: 'Elektronik', icon: IoDesktop, color: 'purple' },
    { value: 'olahraga', label: 'Olahraga', icon: IoFootball, color: 'emerald' },
  ];

  const totalPages = Math.ceil(barang.length / itemsPerPage);
  const paginatedBarang = barang.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat barang..." />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Katalog Barang</h1>
        <p className="text-sm text-gray-500 mt-1">Temukan barang yang ingin Anda pinjam</p>
      </div>

      {/* Search & Filter */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchQuery); // Submit search
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-20 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearch('');
              }}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <IoClose size={18} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <IoSearch size={16} />
            Cari
          </button>
        </div>
      </form>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = kategori === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setKategori(cat.value)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                }`}
            >
              <Icon size={18} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold text-gray-800">{barang.length}</span> barang
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-gray-400">
            Halaman {currentPage} dari {totalPages}
          </p>
        )}
      </div>

      {/* Product Grid */}
      {barang.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 text-center">
          <IoFilter className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-lg font-bold text-gray-700 mb-2">Tidak ada barang ditemukan</h3>
          <p className="text-gray-500 text-sm">Coba ubah kata kunci atau filter pencarian</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {paginatedBarang.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all group"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={
                      item.foto !== 'default-barang.jpg'
                        ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${item.foto}`
                        : 'https://via.placeholder.com/300?text=No+Image'
                    }
                    alt={item.namaBarang}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full ${item.jumlahTersedia > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                      {item.jumlahTersedia > 0 ? 'Tersedia' : 'Habis'}
                    </span>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-800 text-sm truncate mb-1">{item.namaBarang}</h3>
                  <p className="text-xs text-gray-500 capitalize mb-1">{item.kategori}</p>
                  {item.lokasi && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                      <IoLocation size={12} />
                      <span className="truncate">{item.lokasi}</span>
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs sm:text-sm font-bold text-blue-600">{item.jumlahTersedia} unit</span>
                    <button
                      onClick={() => handleOpenModal(item)}
                      disabled={item.jumlahTersedia === 0}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${item.jumlahTersedia > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      Pinjam
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Versi Sederhana */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              {/* Tombol Sebelumnya */}
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                <IoChevronBack size={16} />
                Sebelumnya
              </button>

              {/* Info Halaman */}
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                {currentPage} / {totalPages}
              </span>

              {/* Tombol Selanjutnya */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                Selanjutnya
                <IoChevronForward size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Ajukan Peminjaman"
        size="md"
      >
        {selectedBarang && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
              <img
                src={
                  selectedBarang.foto !== 'default-barang.jpg'
                    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${selectedBarang.foto}`
                    : 'https://via.placeholder.com/80'
                }
                alt={selectedBarang.namaBarang}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-800">{selectedBarang.namaBarang}</h4>
                <p className="text-sm text-gray-500">Tersedia: {selectedBarang.jumlahTersedia} unit</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
              <input
                type="number"
                min="1"
                max={selectedBarang.jumlahTersedia}
                value={formData.jumlahPinjam}
                onChange={(e) => setFormData({ ...formData, jumlahPinjam: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
                <input
                  type="date"
                  value={formData.tanggalPinjam}
                  onChange={(e) => setFormData({ ...formData, tanggalPinjam: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label>
                <input
                  type="time"
                  value={formData.waktuPinjam}
                  onChange={(e) => setFormData({ ...formData, waktuPinjam: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kembali</label>
              <input
                type="date"
                value={formData.tanggalKembali}
                onChange={(e) => setFormData({ ...formData, tanggalKembali: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Peminjaman</label>
              <Textarea
                rows="3"
                value={formData.alasanPeminjaman}
                onChange={(e) => setFormData({ ...formData, alasanPeminjaman: e.target.value })}
                placeholder="Jelaskan keperluan peminjaman..."
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" fullWidth loading={submitLoading}>
                Ajukan
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Barang;
