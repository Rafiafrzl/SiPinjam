import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoReturnDownBack, IoCheckmarkCircle, IoCalendar, IoLayers, IoSearch, IoAlertCircle } from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const PengembalianUser = () => {
    const [pengembalian, setPengembalian] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [returningId, setReturningId] = useState(null);

    useEffect(() => {
        fetchPengembalian();
    }, []);

    const fetchPengembalian = async () => {
        try {
            setLoading(true);
            const response = await api.get('/peminjaman/user/my-peminjaman');
            const allData = response.data.data || [];

            // Filter only items that are approved (Disetujui) and haven't been returned (not Selesai)
            // Note: Backend might have a specific endpoint for items to return, but we filter here for now
            const toReturn = allData.filter(p => p.status === 'Disetujui');
            setPengembalian(toReturn);
        } catch (err) {
            Toast.error('Gagal memuat data pengembalian');
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin mengembalikan barang ini?')) return;

        try {
            setReturningId(id);
            await api.put(`/peminjaman/kembalikan/${id}`);
            Toast.success('Permintaan pengembalian berhasil dikirim');
            fetchPengembalian();
        } catch (err) {
            Toast.error(err.response?.data?.message || 'Gagal melakukan pengembalian');
        } finally {
            setReturningId(null);
        }
    };

    const filteredData = pengembalian.filter(item =>
        item.barangId?.namaBarang.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loading size="lg" text="Memuat data pengembalian..." />
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
                        <h1 className="text-2xl font-bold text-white tracking-tight">Pengembalian Barang</h1>
                        <p className="text-gray-500 text-sm">Kembalikan barang yang telah selesai Anda gunakan.</p>
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

                {/* Info Card */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0">
                        <IoAlertCircle size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-400">Penting</h4>
                        <p className="text-xs text-blue-300/70 leading-relaxed">Setelah Anda mengeklik tombol "Kembalikan", admin akan memverifikasi kondisi barang sebelum status berubah menjadi "Selesai". Pastikan barang dalam kondisi baik.</p>
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
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic text-sm">
                                            {searchTerm ? 'Barang tidak ditemukan.' : 'Tidak ada barang yang perlu dikembalikan.'}
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
                                                        <p className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">{item.barangId?.namaBarang}</p>
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
                                                    <button
                                                        onClick={() => handleReturn(item._id)}
                                                        disabled={returningId === item._id}
                                                        className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                                    >
                                                        <IoReturnDownBack className="group-hover/btn:-translate-x-1 transition-transform" />
                                                        {returningId === item._id ? 'Memproses...' : 'Kembalikan'}
                                                    </button>
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

export default PengembalianUser;
