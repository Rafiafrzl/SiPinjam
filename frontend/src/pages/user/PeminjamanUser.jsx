import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoTime, IoCheckmarkCircle, IoCalendar, IoLayers, IoSearch } from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const PeminjamanUser = () => {
    const [peminjaman, setPeminjaman] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        active: 0,
        pending: 0,
        total: 0
    });

    useEffect(() => {
        fetchPeminjaman();
    }, []);

    const fetchPeminjaman = async () => {
        try {
            setLoading(true);
            const response = await api.get('/peminjaman/user/my-peminjaman');
            const allData = response.data.data || [];

            // Filter only active borrowings (Pending/Menunggu and Approved/Disetujui)
            const activeData = allData.filter(p => p.status === 'Menunggu' || p.status === 'Disetujui');
            setPeminjaman(activeData);

            setStats({
                active: activeData.filter(p => p.status === 'Disetujui').length,
                pending: activeData.filter(p => p.status === 'Menunggu').length,
                total: activeData.length
            });
        } catch (err) {
            Toast.error('Gagal memuat data peminjaman');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIndicator = (status) => {
        const colors = {
            'Menunggu': 'bg-amber-500',
            'Disetujui': 'bg-emerald-500',
            'Ditolak': 'bg-red-500',
            'Selesai': 'bg-blue-500',
        };
        return (
            <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${colors[status] || 'bg-gray-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{status}</span>
            </div>
        );
    };

    const filteredData = peminjaman.filter(item =>
        item.barangId?.namaBarang.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loading size="lg" text="Memuat data peminjaman..." />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-8 sm:py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Peminjaman Aktif</h1>
                        <p className="text-gray-500 text-sm">Kelola barang yang sedang Anda pinjam atau dalam proses persetujuan.</p>
                    </div>

                    <div className="relative group">
                        <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari barang..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 bg-black/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all"
                        />
                    </div>
                </div>

                {/* Modern Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 p-2 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-inner">
                    <div className="flex items-center gap-4 px-6 py-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.03]">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                            <IoLayers size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stats.total}</p>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Total Aktif</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.03]">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                            <IoCheckmarkCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stats.active}</p>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Disetujui</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.03]">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                            <IoTime size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stats.pending}</p>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Menunggu</p>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-neutral-900/30 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Barang & Kategori</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Jumlah</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Tgl Pinjam</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic text-sm">
                                            {searchTerm ? 'Barang tidak ditemukan.' : 'Tidak ada peminjaman aktif.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item) => (
                                        <tr key={item._id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 border border-white/5 flex-shrink-0">
                                                        <img src={getImageUrl(item.barangId?.foto)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">{item.barangId?.namaBarang}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">{item.barangId?.kategori}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-medium text-gray-300">{item.jumlahPinjam} Units</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <IoCalendar className="text-gray-700" size={14} />
                                                    {format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {getStatusIndicator(item.status)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PeminjamanUser;
