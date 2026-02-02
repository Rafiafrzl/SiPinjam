import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoReturnDownBack, IoCheckmarkCircle, IoCalendar, IoLayers, IoSearch, IoAlertCircle, IoCloudUpload, IoClose, IoImage, IoTimeOutline } from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import { Alert } from '../../components/ui/Alert';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import usePolling from '../../hooks/usePolling';

const PengembalianUser = () => {
    const [pengembalian, setPengembalian] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [returningId, setReturningId] = useState(null);

    // Modal states
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [kondisi, setKondisi] = useState('baik');
    const [foto, setFoto] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showPhotoDetail, setShowPhotoDetail] = useState(false);

    useEffect(() => {
        fetchPengembalian();
    }, []);

    const fetchPengembalian = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get('/peminjaman/user/my-peminjaman');
            const allData = response.data.data || [];

            // Filter only items that are approved (Disetujui) OR have been returned (Selesai)
            // This allows users to see history of returned items on this page
            const toReturn = allData.filter(p =>
                (p.status === 'Disetujui') ||
                (p.status === 'Selesai' && p.statusPengembalian === 'Sudah Dikembalikan')
            );
            setPengembalian(toReturn);
        } catch (err) {
            if (!silent) Toast.error('Gagal memuat data pengembalian');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Auto-refresh data every 5 seconds
    usePolling(() => fetchPengembalian(true), 5000);

    const handleReturnClick = (item) => {
        setSelectedItem(item);
        setKondisi('baik');
        setFoto(null);
        setImagePreview(null);
        setShowReturnModal(true);
    };

    const handleFileUpload = (file) => {
        if (file && file.type.startsWith('image/')) {
            setFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            Alert.error("File yang dipilih bukan format gambar. Harap pilih file PNG, JPG, atau GIF.", "Format File Tidak Valid");
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleRemoveImage = () => {
        setFoto(null);
        setImagePreview(null);
    };

    const handleSubmitReturn = async () => {
        if (!selectedItem?._id) return;
        if (!foto) {
            Alert.warning("Mohon unggah foto bukti kondisi barang sebelum mengembalikan.", "Foto Wajib Diunggah");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('peminjamanId', selectedItem._id);
            formData.append('kondisiBarang', kondisi);
            formData.append('foto', foto);

            await api.post('/pengembalian', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Toast.success('Permintaan pengembalian berhasil dikirim');
            setShowReturnModal(false);
            fetchPengembalian(); // Refresh data
        } catch (err) {
            Toast.error(err.response?.data?.message || 'Gagal mengirim permintaan pengembalian');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loading size="lg" text="Memuat data pengembalian..." />
            </div>
        );
    }

    const filteredData = pengembalian.filter(item =>
        item.barangId?.namaBarang?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Pengembalian Barang
                    </h1>
                    <p className="text-gray-300">Kelola dan kembalikan barang yang sedang Anda pinjam</p>
                </div>

                {/* Main Content */}
                <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-white/5 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Cari barang yang dipinjam..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/20 border-b border-white/5">
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Barang & Kategori</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 w-24">Jumlah</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Jadwal Pinjam</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Batas Kembali</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic text-sm">
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
                                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">{item.barangId?.kategori}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-medium text-gray-300">{item.jumlahPinjam} Unit</span>
                                                    {item.denda > 0 && (
                                                        <span className="text-[10px] font-bold text-red-400 mt-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                                                            Denda: Rp {item.denda.toLocaleString('id-ID')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                                                            <IoCalendar size={14} />
                                                        </div>
                                                        <span className="text-gray-200 font-bold">{format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-9">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
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
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-9">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">{item.waktuKembali} WIB</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {item.statusPengembalian === 'Sudah Dikembalikan' ? (
                                                        <span className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold">
                                                            <IoCheckmarkCircle />
                                                            Selesai
                                                        </span>
                                                    ) : item.statusPengembalian === 'Menunggu Verifikasi' ? (
                                                        <span className="flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-bold">
                                                            <IoTimeOutline />
                                                            Menunggu Verifikasi
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleReturnClick(item)}
                                                            className="flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                                        >
                                                            <IoReturnDownBack className="group-hover/btn:-translate-x-1 transition-transform" />
                                                            Kembalikan
                                                        </button>
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

                {/* Return Modal */}
                <Modal
                    isOpen={showReturnModal}
                    onClose={() => setShowReturnModal(false)}
                    title="Pengembalian Barang"
                    size="md"
                    theme="dark"
                >
                    {selectedItem && (
                        <div className="space-y-4">
                            {/* Item Info */}
                            <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-800 border border-white/5">
                                        <img src={getImageUrl(selectedItem.barangId?.foto)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{selectedItem.barangId?.namaBarang}</p>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">{selectedItem.barangId?.kategori}</p>
                                        <p className="text-xs text-gray-400 mt-1">Jumlah: {selectedItem.jumlahPinjam} unit</p>
                                    </div>
                                </div>
                            </div>

                            {/* Kondisi Select */}
                            <div>
                                <Select
                                    label="Kondisi Barang Saat Dikembalikan"
                                    value={kondisi}
                                    onChange={(e) => setKondisi(e.target.value)}
                                    options={[
                                        { value: 'baik', label: 'Baik' },
                                        { value: 'rusak ringan', label: 'Rusak Ringan' },
                                        { value: 'rusak berat', label: 'Rusak Berat' },
                                    ]}
                                    required
                                    theme="dark"
                                />
                            </div>

                            {/* Photo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Foto Kondisi Barang <span className="text-red-500">*</span>
                                </label>
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            onClick={() => setShowPhotoDetail(true)}
                                            className="w-full h-48 object-cover rounded-lg border-2 border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                                            title="Klik untuk melihat detail"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg z-10"
                                        >
                                            <IoClose size={20} />
                                        </button>
                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                            Klik untuk melihat detail
                                        </div>
                                    </div>
                                ) : (
                                    <label
                                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isDragging
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-white/10 bg-neutral-900/50 hover:bg-neutral-900/70'
                                            }`}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <IoCloudUpload size={48} className={`mb-3 ${isDragging ? 'text-purple-400' : 'text-gray-500'}`} />
                                            <p className="mb-2 text-sm text-gray-400">
                                                <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                                            </p>
                                            <p className="text-xs text-gray-600">PNG, JPG, GIF (Max: 5MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileUpload(e.target.files[0])}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowReturnModal(false)}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmitReturn}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Memproses...
                                        </>
                                    ) : (
                                        'Konfirmasi Pengembalian'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Photo Detail Modal */}
                <Modal
                    isOpen={showPhotoDetail}
                    onClose={() => setShowPhotoDetail(false)}
                    title="Detail Foto"
                    size="lg"
                    theme="dark"
                >
                    <div className="flex items-center justify-center">
                        <img
                            src={imagePreview}
                            alt="Detail Foto"
                            className="max-w-full max-h-[70vh] object-contain rounded-lg"
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default PengembalianUser;
