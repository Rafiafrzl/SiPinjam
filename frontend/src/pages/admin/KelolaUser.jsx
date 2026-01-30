import { useState, useEffect } from 'react';
import {
    IoPeople,
    IoSearch,
    IoCheckmarkCircle,
    IoCloseCircle,
    IoTrash,
    IoMail,
    IoCall,
    IoSchool,
    IoClose,
    IoCheckbox,
    IoSquareOutline
} from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const KelolaUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});

    // Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Multi-select state
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [search, filterStatus, currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10
            };
            if (search) params.search = search;
            if (filterStatus !== 'all') params.isActive = filterStatus;

            const response = await api.get('/users', { params });
            setUsers(response.data.data);
            setPagination(response.data.pagination);
        } catch (err) {
            Toast.error('Gagal memuat data user');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchQuery);
        setCurrentPage(1);
    };

    const handleToggleStatus = async (user) => {
        try {
            setActionLoading(true);
            await api.put(`/users/${user._id}/toggle-status`);
            Toast.success(`User berhasil ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
            fetchUsers();
        } catch (err) {
            Toast.error(err.response?.data?.message || 'Gagal mengubah status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setActionLoading(true);
            await api.delete(`/users/${selectedUser._id}`);
            Toast.success('User berhasil dihapus');
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            Toast.error(err.response?.data?.message || 'Gagal menghapus user');
        } finally {
            setActionLoading(false);
        }
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    // Multi-select handlers
    const handleSelectOne = (userId) => {
        setSelectedIds(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            }
            return [...prev, userId];
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.length === users.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(users.map(user => user._id));
        }
    };

    const handleBulkDelete = async () => {
        try {
            setActionLoading(true);
            for (const userId of selectedIds) {
                await api.delete(`/users/${userId}`);
            }
            Toast.success(`${selectedIds.length} user berhasil dihapus`);
            setShowBulkDeleteModal(false);
            setSelectedIds([]);
            fetchUsers();
        } catch (err) {
            Toast.error(err.response?.data?.message || 'Gagal menghapus user');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && users.length === 0) {
        return <Loading fullScreen text="Memuat data user..." />;
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Kelola User</h1>
                    <p className="text-gray-600 text-sm mt-1">Manajemen data pengguna sistem</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                        <Button
                            variant="danger"
                            onClick={() => setShowBulkDeleteModal(true)}
                        >
                            <IoTrash size={18} />
                            Hapus {selectedIds.length} Terpilih
                        </Button>
                    )}
                    <Badge variant="primary" size="lg">
                        <IoPeople className="mr-1" />
                        {pagination.total || 0} User
                    </Badge>
                </div>
            </div>

            {/* Search & Filter */}
            <Card className="p-4 flex flex-col gap-4">

                <form onSubmit={handleSearch} className="w-full">
                    <Input
                        placeholder="Cari nama, email, atau kelas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<IoSearch size={20} />}
                        className="text-sm"
                    />
                </form>

                {/* Filter Status  */}
                <div className="flex justify-end">
                    <div className="w-full md:w-56">
                        <Select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            options={[
                                { value: "all", label: "Semua Status Akun" },
                                { value: "true", label: "Hanya User Aktif" },
                                { value: "false", label: "Hanya User Nonaktif" }
                            ]}
                            className="text-sm"
                        />
                    </div>
                </div>
            </Card>

            {/* User List */}
            {users.length === 0 ? (
                <Card className="p-8 text-center">
                    <IoPeople className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">Tidak ada user ditemukan</p>
                </Card>
            ) : (
                <div className="space-y-2">
                    {/* Select All Checkbox */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                        <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            {selectedIds.length === users.length && users.length > 0 ? (
                                <IoCheckbox size={22} className="text-blue-600" />
                            ) : (
                                <IoSquareOutline size={22} />
                            )}
                            <span className="font-medium">
                                {selectedIds.length === users.length && users.length > 0
                                    ? 'Batal Pilih Semua'
                                    : 'Pilih Semua'}
                            </span>
                        </button>
                        {selectedIds.length > 0 && (
                            <span className="text-xs text-gray-500">
                                ({selectedIds.length} dipilih)
                            </span>
                        )}
                    </div>

                    {/* User Cards */}
                    <div className="grid gap-3">
                        {users.map((user) => (
                            <Card
                                key={user._id}
                                className={`p-4 transition-all ${selectedIds.includes(user._id)
                                    ? 'ring-2 ring-blue-500 bg-blue-50'
                                    : ''
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleSelectOne(user._id)}
                                        className="flex-shrink-0"
                                    >
                                        {selectedIds.includes(user._id) ? (
                                            <IoCheckbox size={24} className="text-blue-600" />
                                        ) : (
                                            <IoSquareOutline size={24} className="text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>

                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-indigo-600 overflow-hidden shadow-inner border border-gray-100 flex-shrink-0">
                                        {user.foto ? (
                                            <img
                                                src={getImageUrl(user.foto)}
                                                alt={user.nama}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            user.nama?.charAt(0).toUpperCase()
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-800 truncate">{user.nama}</h3>
                                            <Badge variant={user.isActive ? 'success' : 'danger'} size="sm">
                                                {user.isActive ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <IoMail size={14} />
                                                {user.email}
                                            </span>
                                            {user.kelas && (
                                                <span className="flex items-center gap-1">
                                                    <IoSchool size={14} />
                                                    {user.kelas}
                                                </span>
                                            )}
                                            {user.noTelepon && (
                                                <span className="flex items-center gap-1">
                                                    <IoCall size={14} />
                                                    {user.noTelepon}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Bergabung {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: id })}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                disabled={actionLoading}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${user.isActive
                                                    ? 'bg-purple-600 shadow-lg shadow-purple-600/20'
                                                    : 'bg-gray-300'
                                                    }`}
                                                title={user.isActive ? 'Klik untuk Nonaktifkan' : 'Klik untuk Aktifkan'}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${user.isActive ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">
                                                {user.isActive ? 'Aktif' : 'Off'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center gap-1">
                                            <button
                                                onClick={() => openDeleteModal(user)}
                                                disabled={actionLoading}
                                                className="p-1 px-2.5 rounded-xl transition-all bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center min-h-[24px]"
                                                title="Hapus Permanent"
                                            >
                                                <IoTrash size={18} />
                                            </button>
                                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">
                                                Hapus
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Pagination - menggunakan komponen global Pagination */}
            <Pagination
                currentPage={currentPage}      // Halaman saat ini
                totalPages={pagination.pages}  // Total halaman dari API
                onPageChange={setCurrentPage}  // Fungsi untuk ganti halaman
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Hapus User"
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IoTrash className="text-red-600" size={32} />
                    </div>
                    <p className="text-gray-600 mb-2">
                        Apakah Anda yakin ingin menghapus user:
                    </p>
                    <p className="font-semibold text-gray-800 mb-4">
                        {selectedUser?.nama}
                    </p>
                    <p className="text-sm text-red-500 mb-4">
                        Tindakan ini tidak dapat dibatalkan!
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            fullWidth
                            loading={actionLoading}
                            onClick={handleDelete}
                        >
                            Hapus
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Konfirmasi Hapus Massal */}
            <Modal
                isOpen={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                title="Hapus User Terpilih"
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IoTrash className="text-red-600" size={32} />
                    </div>
                    <p className="text-gray-600 mb-2">
                        Apakah Anda yakin ingin menghapus:
                    </p>
                    <p className="font-semibold text-gray-800 mb-4">
                        {selectedIds.length} user terpilih
                    </p>
                    <p className="text-sm text-red-500 mb-4">
                        Tindakan ini tidak dapat dibatalkan!
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowBulkDeleteModal(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            fullWidth
                            loading={actionLoading}
                            onClick={handleBulkDelete}
                        >
                            Hapus Semua
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default KelolaUser;
