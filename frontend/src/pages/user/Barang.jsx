import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  IoSearch,
  IoFilter,
  IoLocation,
  IoApps,
  IoDesktop,
  IoFootball,
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoExpand
} from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';

const Barang = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || ''); // Input sementara
  const [search, setSearch] = useState(searchParams.get('search') || ''); // Nilai yang disubmit
  const [kategori, setKategori] = useState(searchParams.get('kategori') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal states
  const [previewImage, setPreviewImage] = useState(null);

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
      setBarang(response.data.data || []);
    } catch (err) {
      Toast.error('Gagal memuat data barang');
    } finally {
      setLoading(false);
    }
  };

  const handlePinjamClick = (item) => {
    navigate(`/pinjam/${item._id}`);
  };

  const categories = [
    { value: '', label: 'Semua', icon: IoApps, color: 'purple' },
    { value: 'elektronik', label: 'Elektronik', icon: IoDesktop, color: 'purple' },
    { value: 'olahraga', label: 'Olahraga', icon: IoFootball, color: 'purple' },
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 sm:space-y-6"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Katalog Barang</h1>
        <p className="text-gray-500">Temukan barang yang ingin Anda pinjam</p>
      </div>

      {/* Search & Filter Card */}
      <div className="bg-neutral-900 rounded-xl p-4 mb-6 border border-neutral-800">
        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchQuery);
          }}
          className="mb-4"
        >
          <div className="relative">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Cari nama barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-24 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearch('');
                }}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <IoClose size={18} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-md transition-colors"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Category Filter */}
        <div>
          <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
            <IoFilter size={16} />
            Kategori
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = kategori === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setKategori(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                    }`}
                >
                  <Icon size={18} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">
          {barang.length} barang ditemukan
        </p>
        {totalPages > 1 && (
          <p className="text-gray-600 text-sm">
            Halaman {currentPage} dari {totalPages}
          </p>
        )}
      </div>

      {/* Product Grid */}
      {barang.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900 rounded-xl border border-neutral-800">
          <IoFilter className="mx-auto text-gray-700 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Tidak ada barang ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kata kunci atau filter pencarian</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSearch('');
              setKategori('');
            }}
            className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {paginatedBarang.map((item) => {
              const isRusak = item.kondisi === 'rusak ringan' || item.kondisi === 'rusak berat';
              const canBorrow = item.jumlahTersedia > 0 && !isRusak;

              return (
                <div
                  key={item._id}
                  className={`flex flex-col bg-neutral-900 rounded-xl overflow-hidden border transition-colors group ${isRusak
                    ? 'border-orange-500/30 opacity-70'
                    : 'border-neutral-800 hover:border-purple-500/30'
                    }`}
                >
                  {/* Image */}
                  <div
                    className="relative aspect-square bg-neutral-800 overflow-hidden cursor-pointer"
                    onClick={() => setPreviewImage(getImageUrl(item.foto))}
                  >
                    <img
                      src={getImageUrl(item.foto)}
                      alt={item.namaBarang}
                      className={`w-full h-full object-cover ${!isRusak && 'group-hover:scale-105'
                        } transition-transform duration-300`}
                    />

                    {/* Expand Icon */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <IoExpand className="text-white" size={24} />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      {isRusak ? (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-orange-500 text-white">
                          {item.kondisi === 'rusak berat' ? 'Rusak Berat' : 'Rusak Ringan'}
                        </span>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${item.jumlahTersedia > 0
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                          }`}>
                          {item.jumlahTersedia > 0 ? 'Tersedia' : 'Habis'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-medium text-white text-sm truncate">{item.namaBarang}</h3>
                    <p className="text-gray-600 text-xs capitalize">{item.kategori}</p>
                    {item.lokasi && (
                      <p className="text-gray-600 text-xs flex items-center gap-1 mt-1">
                        <IoLocation size={12} />
                        <span className="truncate">{item.lokasi}</span>
                      </p>
                    )}

                    {isRusak && (
                      <p className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-1 rounded mt-2">
                        ⚠️ Tidak dapat dipinjam
                      </p>
                    )}

                    <div className="mt-auto pt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Tersedia</span>
                        <span className="text-purple-400 font-medium">{item.jumlahTersedia} unit</span>
                      </div>
                      <button
                        onClick={() => handlePinjamClick(item)}
                        disabled={!canBorrow}
                        className={`w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all ${canBorrow
                          ? 'bg-purple-600 text-white hover:bg-purple-500 active:scale-95'
                          : 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        {isRusak ? 'Tidak Tersedia' : canBorrow ? 'Pinjam' : 'Habis'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium ${currentPage === 1
                  ? 'bg-neutral-900 text-gray-700 cursor-not-allowed'
                  : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
              >
                <IoChevronBack size={16} />
                Sebelumnya
              </button>

              <span className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium ${currentPage === totalPages
                  ? 'bg-neutral-900 text-gray-700 cursor-not-allowed'
                  : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
              >
                Selanjutnya
                <IoChevronForward size={16} />
              </button>
            </div>
          )}
        </>
      )}


      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-neutral-800/80 hover:bg-neutral-700 rounded-full transition-colors"
          >
            <IoClose className="text-white" size={24} />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Barang;
