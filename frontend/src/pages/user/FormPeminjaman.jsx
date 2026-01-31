import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoArrowBack,
    IoCalendar,
    IoTime,
    IoAlertCircle,
    IoInformationCircle
} from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';

const FormPeminjaman = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [barang, setBarang] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState({
        jumlahPinjam: 1,
        tanggalPinjam: '',
        waktuPinjam: '',
        tanggalKembali: '',
        alasanPeminjaman: ''
    });

    useEffect(() => {
        fetchBarangDetail();
    }, [id]);

    const fetchBarangDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/barang/${id}`);
            const data = response.data.data;

            if (data.jumlahTersedia === 0 || data.kondisi === 'rusak berat') {
                Toast.error('Barang tidak tersedia untuk dipinjam');
                navigate('/barang');
                return;
            }

            setBarang(data);
            setFormData(prev => ({ ...prev, jumlahPinjam: 1 }));
        } catch (err) {
            Toast.error('Gagal memuat detail barang');
            navigate('/barang');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.jumlahPinjam > barang.jumlahTersedia) {
            Toast.error('Jumlah melebihi stok tersedia');
            return;
        }
        try {
            setSubmitLoading(true);
            await api.post('/peminjaman', {
                barangId: id,
                ...formData
            });
            Toast.success('Peminjaman berhasil diajukan!');
            navigate('/peminjaman');
        } catch (err) {
            Toast.error(err.response?.data?.message || 'Gagal mengajukan peminjaman');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loading size="lg" text="Memuat formulir..." />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-8 sm:py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto"
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-5">
                    <button
                        onClick={() => navigate('/barang')}
                        className="p-2 bg-neutral-900 text-gray-400 hover:text-white rounded-xl border border-neutral-800 transition-colors"
                    >
                        <IoArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Ajukan Peminjaman</h1>
                        <p className="text-gray-500 text-sm">Lengkapi formulir di bawah untuk meminjam barang</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Item Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 h-full flex flex-col">
                            <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-neutral-800">
                                <img
                                    src={getImageUrl(barang.foto)}
                                    alt={barang.namaBarang}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{barang.namaBarang}</h3>
                            <p className="text-purple-400 text-sm font-medium mb-4 capitalize">{barang.kategori}</p>

                            <div className="space-y-3 pt-4 border-t border-neutral-800">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Stok Tersedia</span>
                                    <span className="text-white font-semibold">{barang.jumlahTersedia} unit</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Kondisi</span>
                                    <span className="text-green-400 font-semibold capitalize">{barang.kondisi}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Lokasi</span>
                                    <span className="text-white truncate max-w-[120px]">{barang.lokasi || '-'}</span>
                                </div>
                            </div>

                            <div className="mt-auto p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex gap-3">
                                <IoInformationCircle className="text-purple-400 flex-shrink-0" size={20} />
                                <p className="text-xs text-purple-300 leading-relaxed">
                                    Peminjaman akan ditinjau oleh administrator sebelum disetujui.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 space-y-4 h-full flex flex-col">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                        Jumlah Pinjam
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max={barang.jumlahTersedia}
                                            value={formData.jumlahPinjam}
                                            onChange={(e) => setFormData({ ...formData, jumlahPinjam: parseInt(e.target.value) })}
                                            className="w-full pl-4 pr-16 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs uppercase font-bold tracking-widest pointer-events-none">unit</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                        Tanggal Pinjam
                                    </label>
                                    <div className="relative">
                                        <IoCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="date"
                                            value={formData.tanggalPinjam}
                                            onChange={(e) => setFormData({ ...formData, tanggalPinjam: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all text-sm [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                        Waktu Ambil
                                    </label>
                                    <div className="relative">
                                        <IoTime className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="time"
                                            value={formData.waktuPinjam}
                                            onChange={(e) => setFormData({ ...formData, waktuPinjam: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all text-sm [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                        Estimasi Kembali
                                    </label>
                                    <div className="relative">
                                        <IoCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="date"
                                            value={formData.tanggalKembali}
                                            onChange={(e) => setFormData({ ...formData, tanggalKembali: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all text-sm [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                    Alasan Peminjaman
                                </label>
                                <Textarea
                                    rows="3"
                                    value={formData.alasanPeminjaman}
                                    onChange={(e) => setFormData({ ...formData, alasanPeminjaman: e.target.value })}
                                    placeholder="Misal: Untuk kegiatan ekstrakurikuler musik di aula..."
                                    className="bg-neutral-800 border-neutral-700 text-white placeholder-gray-600 focus:border-purple-500 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 space-y-2">
                                <div className="flex items-center gap-2 text-purple-400 font-bold text-[10px] uppercase tracking-wider">
                                    <IoInformationCircle size={14} />
                                    Informasi Peminjaman
                                </div>
                                <ul className="text-[11px] text-gray-500 list-disc ml-4 space-y-1 leading-relaxed">
                                    <li>Barang harus dikembalikan tepat waktu sesuai estimasi.</li>
                                    <li>Kerusakan atau kehilangan menjadi tanggung jawab peminjam.</li>
                                    <li>Wajib melapor ke petugas saat pengambilan dan pengembalian.</li>
                                </ul>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    loading={submitLoading}
                                    className="py-4 rounded-xl shadow-lg shadow-purple-500/20"
                                >
                                    Ajukan Peminjaman
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                                <IoAlertCircle className="text-amber-500 flex-shrink-0" size={18} />
                                <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
                                    Pastikan data yang Anda masukkan sudah benar. Anda tidak dapat mengubah data setelah pengajuan dikirim.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FormPeminjaman;
