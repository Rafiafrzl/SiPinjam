import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    IoArrowForward,
    IoLibrary,
    IoTime,
    IoDesktop,
    IoFootball,
    IoApps,
    IoCheckmarkCircle,
    IoPersonAdd,
    IoShieldCheckmark,
    IoStatsChart,
} from 'react-icons/io5';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import hero1 from '../../assets/hero/hero1.jpg';
import hero2 from '../../assets/hero/hero2.png';
import hero3 from '../../assets/hero/hero3.png';
import { AnimatePresence } from 'framer-motion';

const LandingPage = () => {
    const [featuredBarang, setFeaturedBarang] = useState([]);
    const [loading, setLoading] = useState(true);
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
        fetchFeaturedItems();
    }, []);

    const fetchFeaturedItems = async () => {
        try {
            const response = await api.get('/barang/public', { params: { limit: 20 } });
            setFeaturedBarang(response.data.data || []);
        } catch (err) {
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: IoTime,
            title: 'Proses Cepat',
            description: 'Ajukan peminjaman kapan saja, proses persetujuan langsung oleh admin.',
        },
        {
            icon: IoShieldCheckmark,
            title: 'Tercatat Rapi',
            description: 'Semua data peminjaman tersimpan aman dan dapat dilihat riwayatnya.',
        },
        {
            icon: IoStatsChart,
            title: 'Monitoring Real-time',
            description: 'Pantau status peminjaman dan ketersediaan barang sekolah secara langsung.',
        },
    ];

    const categories = [
        { value: 'elektronik', label: 'Elektronik', icon: IoDesktop, },
        { value: 'olahraga', label: 'Olahraga', icon: IoFootball, },
    ];

    return (
        <div>
            {/* Hero Carousel Section */}
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
                                <p className="text-purple-400 font-bold tracking-widest uppercase text-xs sm:text-sm mb-4 border-l-4 border-purple-500 pl-4 bg-purple-500/10 py-1 pr-6 inline-block rounded-r-lg">
                                    Sistem Peminjaman Barang Sekolah
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
                                to="/register"
                                className="inline-flex items-center justify-center px-8 py-3.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
                            >
                                Daftar Sekarang
                            </Link>
                            <Link
                                to="/katalog"
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


            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="py-16 sm:py-20 bg-neutral-950"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                            Cara Meminjam Barang
                        </h2>
                        <p className="text-gray-500">
                            Tiga langkah mudah untuk meminjam barang sekolah
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { step: '1', title: 'Daftar Akun', desc: 'Buat akun dengan email dan data diri kamu' },
                            { step: '2', title: 'Pilih Barang', desc: 'Cari dan pilih barang yang ingin dipinjam' },
                            { step: '3', title: 'Ajukan Peminjaman', desc: 'Isi formulir dan tunggu persetujuan admin' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
                                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 font-bold mb-4">
                                    {item.step}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Features */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="py-16 sm:py-20 bg-black"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                            Kenapa Pakai SiPinjam?
                        </h2>
                        <p className="text-gray-500">
                            Keuntungan menggunakan sistem peminjaman
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div key={idx} className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800/50">
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="text-purple-400" size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.section>

            {/* Categories */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="py-16 sm:py-20 bg-neutral-950"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                            Kategori Barang
                        </h2>
                        <p className="text-gray-500">
                            Pilih kategori sesuai kebutuhan kamu
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Link
                                    key={cat.value}
                                    to={`/katalog?kategori=${cat.value}`}
                                    className="flex items-center gap-4 p-5 bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-800 transition-colors group"
                                >
                                    <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                        <Icon className="text-purple-400" size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-semibold">{cat.label}</h3>
                                        <p className="text-gray-600 text-sm">{cat.count}</p>
                                    </div>
                                    <IoArrowForward className="text-gray-600 group-hover:text-purple-400 transition-colors" />
                                </Link>
                            );
                        })}
                    </div>

                    <div className="text-center mt-6">
                        <Link
                            to="/katalog"
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium"
                        >
                            <IoApps size={18} />
                            Lihat Semua Kategori
                        </Link>
                    </div>
                </div>
            </motion.section>

            {/* Featured Items */}
            {featuredBarang.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="py-16 sm:py-20 bg-black"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                    Barang Tersedia
                                </h2>
                                <p className="text-gray-500 text-sm">Beberapa barang yang bisa kamu pinjam</p>
                            </div>
                            <Link
                                to="/katalog"
                                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-purple-400 hover:text-white hover:bg-purple-600 font-medium rounded-lg border border-purple-500/30 transition-all text-sm"
                            >
                                Lihat Semua
                                <IoArrowForward size={16} />
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
                                    animation: scroll-left 30s linear infinite;
                                }
                                
                                .group\\/marquee:hover .animate-scroll {
                                    animation-play-state: paused;
                                }
                            `}</style>

                            <div className="flex animate-scroll w-max gap-4 pr-4">
                                {/* Map 4 times to ensure no gaps even with few items on wide screens */}
                                {[...featuredBarang, ...featuredBarang, ...featuredBarang, ...featuredBarang].map((item, idx) => (
                                    <div
                                        key={`${idx}-${item._id}`}
                                        className="flex-shrink-0 w-48 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl hover:shadow-purple-500/10"
                                    >
                                        <div className="aspect-square bg-neutral-800 overflow-hidden">
                                            <img
                                                src={getImageUrl(item.foto)}
                                                alt={item.namaBarang}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium text-white text-sm truncate">{item.namaBarang}</h3>
                                            <p className="text-gray-600 text-xs capitalize">{item.kategori}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`text-xs px-2 py-0.5 rounded ${item.jumlahTersedia > 0
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {item.jumlahTersedia > 0 ? `${item.jumlahTersedia} unit` : 'Habis'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link
                            to="/katalog"
                            className="sm:hidden flex items-center justify-center gap-2 mt-6 py-3 text-purple-400 font-medium rounded-lg border border-purple-500/30"
                        >
                            Lihat Semua Barang
                            <IoArrowForward size={16} />
                        </Link>
                    </div>
                </motion.section>
            )}


        </div>
    );
};

export default LandingPage;
