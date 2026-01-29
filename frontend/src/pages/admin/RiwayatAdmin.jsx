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
    IoLibrary
} from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import Pagination from '../../components/ui/Pagination';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const ITEMS_PER_PAGE = 10;

const RiwayatAdmin = () => {
    const [riwayat, setRiwayat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        disetujui: 0,
        ditolak: 0,
        selesai: 0
    });

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

        const matchStatus = filterStatus === 'semua' || item.status === filterStatus;

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
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            options={[
                                { value: "semua", label: "Semua Status" },
                                { value: "Menunggu", label: "Menunggu" },
                                { value: "Disetujui", label: "Disetujui" },
                                { value: "Ditolak", label: "Ditolak" },
                                { value: "Selesai", label: "Selesai" }
                            ]}
                            className="text-sm"
                        />
                    </div>
                </div>
            </Card>

            {/* Riwayat List */}
            <Card>
                <Card.Header className="p-4 border-b">
                    <Card.Title className="text-base">
                        Daftar Riwayat ({filteredRiwayat.length} data)
                    </Card.Title>
                </Card.Header>
                <Card.Content className="p-0">
                    {filteredRiwayat.length === 0 ? (
                        <div className="p-8 text-center">
                            <IoTime className="mx-auto mb-4 text-gray-300" size={48} />
                            <h3 className="text-lg font-bold text-gray-700 mb-1">Tidak ada data</h3>
                            <p className="text-sm text-gray-500">
                                {searchTerm || filterStatus !== 'semua'
                                    ? 'Coba ubah filter pencarian'
                                    : 'Belum ada riwayat peminjaman'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {paginatedRiwayat.map((item) => (
                                <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-4">
                                        {/* Image */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img
                                                src={getImageUrl(item.barangId?.foto, 'https://via.placeholder.com/80')}
                                                alt={item.barangId?.namaBarang}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-sm">
                                                        {item.barangId?.namaBarang || 'Barang tidak ditemukan'}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        {item.jumlahPinjam} unit • {item.barangId?.kategori}
                                                    </p>
                                                </div>
                                                {getStatusBadge(item.status)}
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

                                            {/* Alasan jika ditolak */}
                                            {item.status === 'Ditolak' && item.alasanPenolakan && (
                                                <div className="mt-2 p-2 bg-red-50 rounded-lg">
                                                    <p className="text-xs text-red-600">
                                                        <span className="font-medium">Alasan: </span>
                                                        {item.alasanPenolakan}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Keperluan */}
                                            {item.keperluan && (
                                                <p className="mt-2 text-xs text-gray-500 line-clamp-1">
                                                    <span className="font-medium">Keperluan: </span>
                                                    {item.keperluan}
                                                </p>
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
        </div>
    );
};

export default RiwayatAdmin;
