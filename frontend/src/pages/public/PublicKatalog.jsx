import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
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
    IoLogIn,
    IoExpand,
} from 'react-icons/io5';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';

const PublicKatalog = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [barang, setBarang] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [kategori, setKategori] = useState(searchParams.get('kategori') || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [previewImage, setPreviewImage] = useState(null);
    const itemsPerPage = 12;

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
            const response = await api.get('/barang/public', { params });
            setBarang(response.data.data || []);
        } catch (err) {
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { value: '', label: 'Semua', icon: IoApps },
        { value: 'elektronik', label: 'Elektronik', icon: IoDesktop },
        { value: 'olahraga', label: 'Olahraga', icon: IoFootball },
    ];

    const totalPages = Math.ceil(barang.length / itemsPerPage);
    const paginatedBarang = barang.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleCategoryChange = (value) => {
        setKategori(value);
        if (value) {
            setSearchParams({ kategori: value });
        } else {
            setSearchParams({});
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen py-8"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Katalog Barang
                    </h1>
                    <p className="text-gray-500">
                        Jelajahi barang yang tersedia untuk dipinjam
                    </p>
                </div>

                {/* Search & Filter */}
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
                                        onClick={() => handleCategoryChange(cat.value)}
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

                {/* Results Info */}
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

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center min-h-[300px]">
                        <Loading size="lg" text="Memuat barang..." />
                    </div>
                ) : barang.length === 0 ? (
                    <div className="text-center py-16 bg-neutral-900 rounded-xl border border-neutral-800">
                        <IoFilter className="mx-auto text-gray-700 mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-white mb-2">Tidak ada barang ditemukan</h3>
                        <p className="text-gray-600 mb-4">Coba ubah kata kunci atau filter</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSearch('');
                                setKategori('');
                                setSearchParams({});
                            }}
                            className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Product Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {paginatedBarang.map((item) => {
                                const isRusakRingan = item.kondisi === 'rusak ringan';
                                const isRusakBerat = item.kondisi === 'rusak berat';
                                const canBorrow = item.jumlahTersedia > 0 && !isRusakBerat;

                                return (
                                    <div
                                        key={item._id}
                                        className={`flex flex-col bg-neutral-900 rounded-xl overflow-hidden border transition-colors group ${isRusakBerat
                                            ? 'border-red-500/30 opacity-70'
                                            : isRusakRingan
                                                ? 'border-orange-500/30'
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
                                                className={`w-full h-full object-cover ${!isRusakBerat && 'group-hover:scale-105'
                                                    } transition-transform duration-300 ${isRusakBerat ? 'grayscale' : ''}`}
                                            />

                                            {/* Expand Icon */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <IoExpand className="text-white" size={24} />
                                            </div>

                                            {/* Status Badge */}
                                            <div className="absolute top-2 left-2">
                                                {isRusakBerat ? (
                                                    <span className="px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded bg-red-500 text-white">
                                                        Rusak Berat
                                                    </span>
                                                ) : isRusakRingan ? (
                                                    <span className="px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded bg-orange-500 text-white">
                                                        Rusak Ringan
                                                    </span>
                                                ) : (
                                                    <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded ${item.jumlahTersedia > 0
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-red-500 text-white'
                                                        }`}>
                                                        {item.jumlahTersedia > 0 ? 'Tersedia' : 'Kosong'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Login Overlay */}
                                            {canBorrow && (
                                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        to="/login"
                                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg text-sm hover:bg-purple-500"
                                                    >
                                                        <IoLogIn size={18} />
                                                        Login untuk Pinjam
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-3 flex flex-col flex-1">
                                            <h3 className="font-medium text-white text-sm truncate">{item.namaBarang}</h3>
                                            <p className="text-gray-600 text-xs capitalize">{item.kategori}</p>
                                            {isRusakBerat && (
                                                <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded mt-2 font-bold">
                                                    ⚠️ Tidak dapat dipinjam
                                                </p>
                                            )}
                                            {isRusakRingan && (
                                                <p className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded mt-2 font-bold">
                                                    ℹ️ Rusak ringan
                                                </p>
                                            )}
                                            {item.lokasi && (
                                                <p className="text-gray-600 text-xs flex items-center gap-1 mt-1">
                                                    <IoLocation size={12} />
                                                    <span className="truncate">{item.lokasi}</span>
                                                </p>
                                            )}
                                            <div className="mt-auto pt-3">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500">Tersedia</span>
                                                    <span className="text-purple-400 font-medium">{item.jumlahTersedia} unit</span>
                                                </div>
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



            </div>

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

export default PublicKatalog;
