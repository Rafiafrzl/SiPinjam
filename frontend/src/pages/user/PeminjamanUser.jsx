import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoTime, IoCheckmarkCircle, IoCalendar, IoLayers, IoSearch, IoRepeat, IoWarning, IoAlertCircle, IoInformationCircle } from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import { format, addDays } from 'date-fns';
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

    // Extension state
    const [showExtModal, setShowExtModal] = useState(false);
    const [selectedExtItem, setSelectedExtItem] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [extReason, setExtReason] = useState('');
    const [submittingExt, setSubmittingExt] = useState(false);

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

    const handleOpenExtModal = (item) => {
        setSelectedExtItem(item);
        // Default new return date to 3 days from original return date
        const currentEndDate = new Date(item.tanggalKembali);
        const defaultNewDate = format(addDays(currentEndDate, 3), 'yyyy-MM-dd');
        setNewDate(defaultNewDate);
        setExtReason('');
        setShowExtModal(true);
    };

    const handleRequestExtension = async () => {
        if (!newDate || !extReason) {
            Toast.error('Harap isi semua field');
            return;
        }

        // Validasi Durasi Maksimal 3 Hari
        const currentEndDate = new Date(selectedExtItem.tanggalKembali);
        const requestedDate = new Date(newDate);
        const diffTime = Math.abs(requestedDate - currentEndDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 3) {
            Toast.error('Durasi perpanjangan maksimal adalah 3 hari');
            return;
        }

        try {
            setSubmittingExt(true);
            await api.put(`/peminjaman/${selectedExtItem._id}/perpanjang`, {
                newTanggalKembali: newDate,
                alasanExtension: extReason
            });
            Toast.success('Permintaan perpanjangan berhasil dikirim');
            setShowExtModal(false);
            fetchPeminjaman();
        } catch (err) {
            Toast.error(err.response?.data?.message || 'Gagal mengirim permintaan perpanjangan');
        } finally {
            setSubmittingExt(false);
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
                <span className={`w-1.5 h-1.5 rounded-full ${colors[status] || 'bg-gray-400'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{status}</span>
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
                        <p className="text-gray-300 text-sm">Kelola barang yang sedang Anda pinjam atau dalam proses persetujuan.</p>
                    </div>

                    <div className="relative group">
                        <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari barang..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 bg-black/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all"
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
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Total Aktif</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.03]">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                            <IoCheckmarkCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stats.active}</p>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Disetujui</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.03]">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                            <IoTime size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stats.pending}</p>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Menunggu</p>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Barang & Kategori</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 text-center w-24">Jumlah</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Jadwal Pinjam</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Batas Kembali</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 text-center">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic text-sm">
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
                                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">{item.barangId?.kategori}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-medium text-gray-300">{item.jumlahPinjam} Units</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                                                            <IoCalendar size={14} />
                                                        </div>
                                                        <span className="text-gray-200 font-bold">{format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-9">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">{item.waktuPinjam} WIB</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                                            <IoCalendar size={14} />
                                                        </div>
                                                        <span className="text-gray-200 font-bold">{format(new Date(item.tanggalKembali), 'dd MMM yyyy', { locale: id })}</span>
                                                        {item.status === 'Disetujui' && new Date(item.tanggalKembali) < new Date() && (
                                                            <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-red-500/10 text-red-500 text-[10px] font-black border border-red-500/20">
                                                                TERLAMBAT!
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-9">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">{item.waktuKembali} WIB</span>
                                                    </div>
                                                    {item.isExtensionRequested && item.extensionStatus === 'Menunggu' && (
                                                        <span className="text-[8px] text-amber-500 font-black uppercase tracking-widest mt-1 pl-9">
                                                            (Proses Perpanjangan)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {getStatusIndicator(item.status)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {item.status === 'Disetujui' && (!item.isExtensionRequested || item.extensionStatus !== 'Menunggu') && (item.extensionCount || 0) < 1 ? (
                                                        <Button
                                                            variant="primary"
                                                            size="xs"
                                                            className="h-8 px-3 rounded-lg flex items-center gap-1.5"
                                                            onClick={() => handleOpenExtModal(item)}
                                                        >
                                                            <IoRepeat size={14} />
                                                            <span>Perpanjang</span>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic">No Action</span>
                                                    )}
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

            {/* Extension Modal */}
            <Modal
                isOpen={showExtModal}
                onClose={() => setShowExtModal(false)}
                title="Perpanjang Peminjaman"
                theme="dark"
            >
                {selectedExtItem && (
                    <div className="space-y-4">
                        <div className="bg-neutral-800/40 p-5 rounded-2xl border border-white/[0.05] space-y-4">
                            <div className="flex items-center gap-2.5 text-purple-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                <IoInformationCircle size={16} />
                                Barang yang Dipinjam
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-xl bg-neutral-900 overflow-hidden border border-white/10 flex-shrink-0 shadow-2xl">
                                    <img src={getImageUrl(selectedExtItem.barangId?.foto)} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold text-base truncate tracking-tight">{selectedExtItem.barangId?.namaBarang}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <p className="text-[9px] text-emerald-400 uppercase font-black tracking-widest leading-none">
                                                Batas: {format(new Date(selectedExtItem.tanggalKembali), 'dd MMM yyyy', { locale: id })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2 ml-1">
                                    Tanggal Kembali Baru <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <IoCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        min={selectedExtItem ? format(addDays(new Date(selectedExtItem.tanggalKembali), 1), 'yyyy-MM-dd') : ''}
                                        max={selectedExtItem ? format(addDays(new Date(selectedExtItem.tanggalKembali), 3), 'yyyy-MM-dd') : ''}
                                        className="w-full pl-12 pr-4 py-3.5 bg-neutral-800 border border-neutral-700 rounded-2xl text-white focus:outline-none focus:border-purple-500 transition-all text-sm [color-scheme:dark] font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2 ml-1">
                                    Alasan Perpanjangan <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    rows="3"
                                    value={extReason}
                                    onChange={(e) => setExtReason(e.target.value)}
                                    placeholder="Jelaskan alasan Anda perlu memperpanjang peminjaman ini..."
                                    className="bg-neutral-800 border-neutral-700 text-white placeholder-gray-600 focus:border-purple-500 rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="bg-amber-500/[0.03] p-4 rounded-2xl border border-amber-500/10 space-y-2">
                            <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-[0.2em]">
                                <IoAlertCircle size={16} />
                                Informasi Penting
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                Permintaan perpanjangan akan ditinjau oleh administrator. Pastikan alasan Anda jelas dan valid agar tidak ditolak oleh sistem.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => setShowExtModal(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="primary"
                                fullWidth
                                loading={submittingExt}
                                onClick={handleRequestExtension}
                            >
                                Kirim Permintaan
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PeminjamanUser;
