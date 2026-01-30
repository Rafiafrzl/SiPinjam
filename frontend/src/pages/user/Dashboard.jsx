import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  IoArrowForward,
  IoLayers,
  IoTime,
  IoCheckmarkCircle,
  IoFlash,
  IoLibrary,
  IoDesktop,
  IoFootball,
  IoApps,
  IoRocket
} from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import useAuth from '../../hooks/useAuth';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import hero1 from '../../assets/hero/hero1.jpg';
import hero2 from '../../assets/hero/hero2.png';
import hero3 from '../../assets/hero/hero3.png';
import { AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentPeminjaman, setRecentPeminjaman] = useState([]);
  const [featuredBarang, setFeaturedBarang] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    { image: hero1, title: 'Akses Peralatan\nSekolah Kamu.', subtitle: 'Temukan, pinjam, dan kelola perlengkapan belajar kamu dengan sistem yang modern dan terintegrasi.' },
    { image: hero2, title: 'Eksplorasi Ilmu\nTanpa Batas.', subtitle: 'Koleksi buku dan referensi lengkap siap mendukung perjalanan akademik Anda di perpustakaan.' },
    { image: hero3, title: 'Teknologi Unggul\nUntuk Masa Depan.', subtitle: 'Pinjam perangkat elektronik terbaru untuk kebutuhan proyek dan penelitian inovatif kamu.' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, peminjamanRes, barangRes] = await Promise.all([
          api.get('/statistik/user'),
          api.get('/peminjaman/user/my-peminjaman', { params: { limit: 3 } }),
          api.get('/barang', { params: { limit: 10 } })
        ]);

        if (isMounted) {
          setStats(statsRes.data.data);
          setRecentPeminjaman(peminjamanRes.data.data || []);
          setFeaturedBarang(barangRes.data.data || []);
        }
      } catch (err) {
        if (isMounted) {
          Toast.error('Gagal memuat data');
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
        <Loading size="lg" text="Memuat..." />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Carousel Banner */}
      <section className="relative overflow-hidden min-h-[550px] lg:min-h-[750px] flex items-center bg-black">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20"></div>

        <div className="relative w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="max-w-3xl">
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-purple-400 font-bold tracking-widest uppercase text-xs sm:text-sm mb-4">
                  Selamat datang kembali, {user?.nama}!
                </p>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight whitespace-pre-line">
                  {heroSlides[currentSlide].title}
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-xl leading-relaxed">
                  {heroSlides[currentSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/barang"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
              >
                Pinjam Sekarang
              </Link>
              <Link
                to="/barang"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white/5 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/10 transition-all border border-white/10"
              >
                Lihat Katalog
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-purple-500' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
            />
          ))}
        </div>
      </section>

      {/* Centered Content Sections */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-12 lg:space-y-20">
        {/* Stats Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {[
            { label: 'Total', value: stats?.total || 0, desc: 'Total Peminjaman', icon: IoLayers, color: 'purple' },
            { label: 'Pending', value: stats?.menunggu || 0, desc: 'Menunggu', icon: IoTime, color: 'purple' },
            { label: 'Aktif', value: stats?.aktif || 0, desc: 'Dipinjam', icon: IoCheckmarkCircle, color: 'purple' },
            { label: 'Done', value: stats?.selesai || 0, desc: 'Selesai', icon: IoFlash, color: 'purple' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: idx * 0.1 }}
                className="relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="bg-neutral-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-purple-500/30 shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/20 rounded-lg sm:rounded-xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Icon size={20} />
                    </div>
                    <span className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider">{item.label}</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{item.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.section>

        {/* Categories */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Kategori Barang</h2>
              <p className="text-sm text-gray-500">Pilih kategori yang Anda butuhkan</p>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6">
            <button onClick={() => setSelectedCategory('')} className="flex-shrink-0 w-24 sm:w-auto group">
              <div className={`bg-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border-2 transition-all ${selectedCategory === '' ? 'border-purple-500 bg-purple-500/10' : 'border-neutral-800 hover:border-purple-500/50'
                }`}>
                <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 ${selectedCategory === '' ? 'scale-105' : 'group-hover:scale-105'
                  } transition-transform`}>
                  <IoApps className="text-white" size={24} />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-300">Semua</p>
              </div>
            </button>
            <button onClick={() => setSelectedCategory('elektronik')} className="flex-shrink-0 w-24 sm:w-auto group">
              <div className={`bg-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border-2 transition-all ${selectedCategory === 'elektronik' ? 'border-purple-500 bg-purple-500/10' : 'border-neutral-800 hover:border-purple-500/50'
                }`}>
                <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 ${selectedCategory === 'elektronik' ? 'scale-105' : 'group-hover:scale-105'
                  } transition-transform`}>
                  <IoDesktop className="text-white" size={24} />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-300">Elektronik</p>
              </div>
            </button>
            <button onClick={() => setSelectedCategory('olahraga')} className="flex-shrink-0 w-24 sm:w-auto group">
              <div className={`bg-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border-2 transition-all ${selectedCategory === 'olahraga' ? 'border-purple-500 bg-purple-500/10' : 'border-neutral-800 hover:border-purple-500/50'
                }`}>
                <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 ${selectedCategory === 'olahraga' ? 'scale-105' : 'group-hover:scale-105'
                  } transition-transform`}>
                  <IoFootball className="text-white" size={24} />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-300">Olahraga</p>
              </div>
            </button>
          </div>
        </motion.section>

        {/* Featured Products */}
        {featuredBarang.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Barang Tersedia</h2>
                <p className="text-sm text-gray-500">
                  {selectedCategory ? `Kategori ${selectedCategory}` : 'Barang yang dapat Anda pinjam'}
                </p>
              </div>
              <Link to="/barang" className="hidden sm:inline-flex items-center gap-1 px-4 py-2 text-purple-400 hover:text-white hover:bg-purple-600 font-medium rounded-full border-2 border-purple-500 transition-all text-sm">
                Lihat Semua <IoArrowForward size={16} />
              </Link>
            </div>

            {/* Continuous Scroll Carousel */}
            <div className="relative overflow-hidden group/marquee py-4">
              {/* Gradient Masks */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black via-black/50 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black via-black/50 to-transparent z-10 pointer-events-none"></div>

              <style>{`
              @keyframes scroll-left {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-25%);
                }
              }
              
              .animate-scroll {
                animation: scroll-left 45s linear infinite;
              }
              
              .group\\/marquee:hover .animate-scroll {
                animation-play-state: paused;
              }
            `}</style>

              <div className="flex animate-scroll w-max gap-4 pr-4">
                {(() => {
                  const filtered = featuredBarang.filter(item => selectedCategory === '' || item.kategori === selectedCategory);
                  if (filtered.length === 0) return null;
                  // Repeat filtered items 4 times for gap-less flow
                  return [...filtered, ...filtered, ...filtered, ...filtered].map((item, idx) => (
                    <div key={`${idx}-${item._id}`} className="flex-shrink-0 w-48 group">
                      <div className="bg-neutral-900 rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-800 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl hover:shadow-purple-500/10">
                        <div className="relative aspect-square bg-neutral-800 overflow-hidden">
                          <img
                            src={getImageUrl(item.foto, 'https://via.placeholder.com/300x200?text=No+Image')}
                            alt={item.namaBarang}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full ${item.jumlahTersedia > 0
                              ? 'bg-emerald-500 text-white'
                              : 'bg-red-500 text-white'
                              }`}>
                              {item.jumlahTersedia > 0 ? 'Tersedia' : 'Barang tidak tersedia'}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="font-semibold text-white text-sm truncate">{item.namaBarang}</h3>
                          <p className="text-xs text-gray-500 capitalize">{item.kategori}</p>
                          <p className="text-xs sm:text-sm font-semibold text-purple-400 mt-1 sm:mt-2">
                            {item.jumlahTersedia} unit
                          </p>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {featuredBarang.filter(item => selectedCategory === '' || item.kategori === selectedCategory).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada barang untuk kategori ini</p>
              </div>
            )}
          </motion.section>
        )}

        {/* Recent Activity */}
        {recentPeminjaman.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Peminjaman Terakhir</h2>
                <p className="text-sm text-gray-500">Aktivitas terbaru Anda</p>
              </div>
              <Link to="/peminjaman" className="text-sm text-purple-400 font-medium hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {recentPeminjaman.slice(0, 3).map((item) => (
                <div key={item._id} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                    <img
                      src={getImageUrl(item.barangId?.foto, 'https://via.placeholder.com/80')}
                      alt={item.barangId?.namaBarang}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">{item.barangId?.namaBarang}</h4>
                    <p className="text-xs text-gray-500">{item.jumlahPinjam} unit</p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

