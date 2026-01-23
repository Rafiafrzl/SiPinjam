import { useState, useEffect } from 'react';
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
    IoPhonePortrait,
} from 'react-icons/io5';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import heroBg from '../../assets/bg-banner.jpg';

const LandingPage = () => {
    const [featuredBarang, setFeaturedBarang] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedItems();
    }, []);

    const fetchFeaturedItems = async () => {
        try {
            const response = await api.get('/barang/public', { params: { limit: 6 } });
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
            icon: IoPhonePortrait,
            title: 'Akses Mudah',
            description: 'Bisa diakses dari HP atau laptop, kapanpun dan dimanapun.',
        },
    ];

    const categories = [
        { value: 'elektronik', label: 'Elektronik', icon: IoDesktop, count: '15+ barang' },
        { value: 'olahraga', label: 'Olahraga', icon: IoFootball, count: '20+ barang' },
    ];

    return (
        <div>
            {/* Hero Section - Banner tanpa overlay ungu */}
            <section className="relative min-h-[85vh] flex items-center">
                {/* Background - hanya gradient hitam */}
                <div className="absolute inset-0">
                    <img
                        src={heroBg}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
                </div>

                {/* Content */}
                <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="max-w-2xl">


                        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
                            Sistem Peminjaman Barang Sekolah
                        </h1>

                        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                            Pinjam peralatan sekolah dengan mudah dan cepat. Cukup daftar, pilih barang, dan ajukan peminjaman secara online.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors"
                            >
                                <IoPersonAdd size={20} />
                                Daftar Sekarang
                            </Link>
                            <Link
                                to="/katalog"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/20 transition-colors"
                            >
                                <IoLibrary size={20} />
                                Lihat Katalog
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
                            <div>
                                <p className="text-2xl font-bold text-white">{featuredBarang.length}+</p>
                                <p className="text-sm text-gray-400">Barang Tersedia</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">2</p>
                                <p className="text-sm text-gray-400">Kategori</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">24/7</p>
                                <p className="text-sm text-gray-400">Akses Online</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-16 sm:py-20 bg-neutral-950">
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
            </section>

            {/* Features */}
            <section className="py-16 sm:py-20 bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                            Kenapa Pakai SiPinjam?
                        </h2>
                        <p className="text-gray-500">
                            Keuntungan menggunakan sistem peminjaman online
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
            </section>

            {/* Categories */}
            <section className="py-16 sm:py-20 bg-neutral-950">
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
            </section>

            {/* Featured Items */}
            {featuredBarang.length > 0 && (
                <section className="py-16 sm:py-20 bg-black">
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

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {featuredBarang.slice(0, 6).map((item) => (
                                <div
                                    key={item._id}
                                    className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-purple-500/30 transition-colors group"
                                >
                                    <div className="aspect-square bg-neutral-800 overflow-hidden">
                                        <img
                                            src={getImageUrl(item.foto)}
                                            alt={item.namaBarang}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                        <Link
                            to="/katalog"
                            className="sm:hidden flex items-center justify-center gap-2 mt-6 py-3 text-purple-400 font-medium rounded-lg border border-purple-500/30"
                        >
                            Lihat Semua Barang
                            <IoArrowForward size={16} />
                        </Link>
                    </div>
                </section>
            )}


        </div>
    );
};

export default LandingPage;
