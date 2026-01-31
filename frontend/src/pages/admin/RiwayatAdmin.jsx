import { useState, useEffect } from 'react';
import {
    IoTime,
    IoCheckmarkCircle,
    IoClose,
    IoCalendar,
    IoLayers,
    IoSearch,
    IoFilter,
    IoPerson,
    IoLibrary,
    IoTrash
} from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import { Alert } from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const ITEMS_PER_PAGE = 10;

const RiwayatAdmin = () => {
    const [riwayat, setRiwayat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        disetujui: 0,
        ditolak: 0,
        selesai: 0
    });
    const [selectedIds, setSelectedIds] = useState([]);

    // Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [returnDetail, setReturnDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchRiwayat();
    }, []);

    const fetchRiwayat = async () => {
        try {
            setLoading(true);
            const response = await api.get('/peminjaman/admin/all');
            const allData = response.data.data || [];
            setRiwayat(allData);

            // Calculate stats
            const total = allData.length;
            const disetujui = allData.filter(p => p.status === 'Disetujui').length;
            const ditolak = allData.filter(p => p.status === 'Ditolak').length;
            const selesai = allData.filter(p => p.status === 'Selesai').length;

            setStats({ total, disetujui, ditolak, selesai });
        } catch (err) {
            Toast.error(err.response?.data?.message || 'Gagal memuat riwayat');
        } finally {
            setLoading(false);
        }
    };

    const handleShowDetail = async (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
        setReturnDetail(null);

        if (item.status === 'Selesai' || item.statusPengembalian === 'Menunggu Verifikasi') {
            try {
                setDetailLoading(true);
                const response = await api.get(`/pengembalian/peminjaman/${item._id}`);
                setReturnDetail(response.data.data);
            } catch (err) {
                console.log('Return detail not found for admin riwayat');
            } finally {
                setDetailLoading(false);
            }
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Menunggu': 'warning',
            'Disetujui': 'success',
            'Ditolak': 'danger',
            'Selesai': 'info',
        };
        return <Badge variant={variants[status] || 'secondary'} size="sm">{status}</Badge>;
    };

    // Filter data
    const filteredRiwayat = riwayat.filter(item => {
        const matchSearch =
            item.barangId?.namaBarang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.userId?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.userId?.kelas?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = filterStatus === '' || item.status === filterStatus;

        return matchSearch && matchStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredRiwayat.length / ITEMS_PER_PAGE);
    const paginatedRiwayat = filteredRiwayat.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page saat filter berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const currentPageIds = paginatedRiwayat.map(p => p._id);
        const allSelected = currentPageIds.every(id => selectedIds.includes(id));

        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...currentPageIds])]);
        }
    };

    const handleBulkDelete = async () => {
        const isConfirmed = await Alert.confirm(
            `Hapus ${selectedIds.length} riwayat peminjaman yang dipilih?`,
            'Konfirmasi Hapus Massal',
            'Hapus',
            'Batal'
        );
        if (!isConfirmed) return;

        try {
            await api.delete('/peminjaman/admin/bulk-delete', { data: { ids: selectedIds } });
            Toast.success(`Berhasil menghapus ${selectedIds.length} riwayat`);
            setSelectedIds([]);
            fetchRiwayat();
        } catch (err) {
            Toast.error(err.response?.data?.message || 'Gagal menghapus riwayat');
        }
    };

    if (loading) {
        return <Loading fullScreen text="Memuat riwayat..." />;
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Riwayat Peminjaman</h1>
                <p className="text-gray-600 text-sm mt-1">Log lengkap semua aktivitas peminjaman</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="!bg-blue-600 text-white p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-xs">Total</p>
                            <h3 className="text-xl font-bold mt-1">{stats.total}</h3>
                        </div>
                        <IoLayers size={24} className="text-white" />
                    </div>
                </Card>

                <Card className="!bg-green-600 text-white p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-xs">Disetujui</p>
                            <h3 className="text-xl font-bold mt-1">{stats.disetujui}</h3>
                        </div>
                        <IoCheckmarkCircle size={24} className="text-white" />
                    </div>
                </Card>

                <Card className="!bg-red-600 text-white p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-xs">Ditolak</p>
                            <h3 className="text-xl font-bold mt-1">{stats.ditolak}</h3>
                        </div>
                        <IoClose size={24} className="text-white" />
                    </div>
                </Card>

                <Card className="!bg-purple-600 text-white p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-xs">Selesai</p>
                            <h3 className="text-xl font-bold mt-1">{stats.selesai}</h3>
                        </div>
                        <IoTime size={24} className="text-white" />
                    </div>
                </Card>
            </div>

            {/* Search & Filter */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari nama barang, peminjam, atau kelas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<IoSearch size={18} />}
                        />
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <Select
                            placeholder="Semua Status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            options={[
                                { value: "Menunggu", label: "Menunggu" },
                                { value: "Disetujui", label: "Disetujui" },
                                { value: "Ditolak", label: "Ditolak" },
                                { value: "Selesai", label: "Selesai" }
                            ]}
                            className="text-sm"
                        />
                    </div>
                </div>

                {selectedIds.length > 0 && (
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <IoTrash size={16} />
                            Hapus {selectedIds.length} item
                        </button>
                    </div>
                )}
            </Card>

            {/* Riwayat List */}
            <Card>
                <Card.Header className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <Card.Title className="text-base">
                            Daftar Riwayat ({filteredRiwayat.length} data)
                        </Card.Title>
                        {paginatedRiwayat.length > 0 && (
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={paginatedRiwayat.every(p => selectedIds.includes(p._id))}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                Pilih Semua
                            </label>
                        )}
                    </div>
                </Card.Header>
                <Card.Content className="p-0">
                    {filteredRiwayat.length === 0 ? (
                        <div className="p-8 text-center">
                            <IoTime className="mx-auto mb-4 text-gray-300" size={48} />
                            <h3 className="text-lg font-bold text-gray-700 mb-1">Tidak ada data</h3>
                            <p className="text-sm text-gray-500">
                                {searchTerm || filterStatus !== ''
                                    ? 'Coba ubah filter pencarian'
                                    : 'Belum ada riwayat peminjaman'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {paginatedRiwayat.map((item) => (
                                <div
                                    key={item._id}
                                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                                    onClick={() => handleShowDetail(item)}
                                >
                                    <div className="flex gap-4">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item._id)}
                                                onChange={() => toggleSelection(item._id)}
                                                className="w-4 h-4 mt-1 text-indigo-600 rounded focus:ring-indigo-500 flex-shrink-0"
                                            />
                                        </div>
                                        {/* Image */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img
                                                src={getImageUrl(item.barangId?.foto, 'https://via.placeholder.com/80')}
                                                alt={item.barangId?.namaBarang}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">
                                                        {item.barangId?.namaBarang || 'Barang tidak ditemukan'}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        {item.jumlahPinjam} unit • {item.barangId?.kategori}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(item.status)}
                                                    <IoEye size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </div>

                                            {/* User Info */}
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <IoPerson size={12} />
                                                    <span>{item.userId?.nama || 'User tidak ditemukan'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <IoLibrary size={12} />
                                                    <span>{item.userId?.kelas || '-'}</span>
                                                </div>
                                            </div>

                                            {/* Dates */}
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <IoCalendar size={12} />
                                                    <span>Pinjam: {format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <IoCalendar size={12} />
                                                    <span>Kembali: {format(new Date(item.tanggalKembali), 'dd MMM yyyy', { locale: id })}</span>
                                                </div>
                                            </div>

                                            {/* Quick Preview of Rejection */}
                                            {item.status === 'Ditolak' && item.alasanPenolakan && (
                                                <div className="mt-2 text-xs text-red-500 italic line-clamp-1">
                                                    Alasan: {item.alasanPenolakan}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card.Content>
            </Card>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Peminjaman & Pengembalian"
                size="lg"
            >
                {selectedItem && (
                    <div className="space-y-6">
                        {/* Status Banner */}
                        <div className={`p-4 rounded-xl border flex items-center justify-between ${selectedItem.status === 'Selesai' ? 'bg-blue-50 border-blue-100' :
                            selectedItem.status === 'Disetujui' ? 'bg-green-50 border-green-100' :
                                selectedItem.status === 'Ditolak' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                            }`}>
                            <div className="flex items-center gap-3">
                                {selectedItem.status === 'Selesai' ? <IoCheckmarkCircle className="text-blue-500" size={24} /> :
                                    selectedItem.status === 'Disetujui' ? <IoCheckmarkCircle className="text-green-500" size={24} /> :
                                        selectedItem.status === 'Ditolak' ? <IoClose className="text-red-500" size={24} /> : <IoTime className="text-amber-500" size={24} />
                                }
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Status: {selectedItem.status}</p>
                                    <p className="text-xs text-gray-600">ID: {selectedItem._id}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Barang and User Info */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Informasi Barang</h4>
                                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={getImageUrl(selectedItem.barangId?.foto)} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{selectedItem.barangId?.namaBarang}</p>
                                            <p className="text-xs text-gray-500">{selectedItem.barangId?.kategori}</p>
                                            <p className="text-xs font-medium text-indigo-600 mt-1">{selectedItem.jumlahPinjam} Unit dipinjam</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Peminjam</h4>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-sm font-bold text-gray-800">{selectedItem.userId?.nama}</p>
                                        <p className="text-xs text-gray-500">{selectedItem.userId?.kelas} • {selectedItem.userId?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Dates and Notes */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Waktu Peminjaman</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                                            <span className="text-gray-500">Tgl Pinjam</span>
                                            <span className="font-medium">{format(new Date(selectedItem.tanggalPinjam), 'dd MMMM yyyy', { locale: id })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                                            <span className="text-gray-500">Tgl Kembali</span>
                                            <span className="font-medium text-amber-600">{format(new Date(selectedItem.tanggalKembali), 'dd MMMM yyyy', { locale: id })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2">
                                            <span className="text-gray-500">Lama Pinjam</span>
                                            <span className="font-medium">{selectedItem.waktuPinjam}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Keperluan</h4>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 min-h-[60px]">
                                        {selectedItem.keperluan || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pengembalian Detail Section */}
                        {(selectedItem.status === 'Selesai' || selectedItem.statusPengembalian === 'Menunggu Verifikasi') && (
                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <IoTime className="text-indigo-600" />
                                    Data Pengembalian
                                </h3>

                                {detailLoading ? (
                                    <div className="py-8 flex flex-col items-center justify-center gap-2">
                                        <Loading size="sm" />
                                        <p className="text-xs text-gray-500">Memuat detail pengembalian...</p>
                                    </div>
                                ) : returnDetail ? (
                                    <div className="bg-indigo-50/30 rounded-2xl p-4 border border-indigo-100 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kondisi</p>
                                                <Badge variant={
                                                    returnDetail.kondisiBarang === 'baik' ? 'success' :
                                                        returnDetail.kondisiBarang === 'rusak ringan' ? 'warning' : 'danger'
                                                }>
                                                    {returnDetail.kondisiBarang?.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Denda</p>
                                                <p className={`text-sm font-bold ${returnDetail.denda > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                                    Rp {returnDetail.denda?.toLocaleString('id-ID') || 0}
                                                </p>
                                            </div>
                                        </div>

                                        {returnDetail.fotoPengembalian && (
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Foto Dokumentasi</p>
                                                <div className="w-full max-h-64 rounded-xl overflow-hidden border border-gray-200">
                                                    <img src={getImageUrl(returnDetail.fotoPengembalian)} className="w-full h-full object-contain bg-black" />
                                                </div>
                                            </div>
                                        )}

                                        {returnDetail.catatanPengembalian && (
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Catatan Siswa</p>
                                                <p className="text-sm text-gray-700 italic">"{returnDetail.catatanPengembalian}"</p>
                                            </div>
                                        )}

                                        {returnDetail.catatanAdmin && (
                                            <div className="pt-3 border-t border-indigo-100/50">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Catatan Verifikasi</p>
                                                <p className="text-sm text-indigo-700">{returnDetail.catatanAdmin}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                                        <p className="text-xs text-gray-500 italic">Detail pengembalian tidak ditemukan di server.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4 flex justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => setShowDetailModal(false)}
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RiwayatAdmin;
