import { useState, useEffect } from 'react';
import {
    IoPeople,
    IoSearch,
    IoPersonCircle,
    IoCheckmarkCircle,
    IoCloseCircle,
    IoTrash,
    IoMail,
    IoCall,
    IoSchool,
    IoClose
} from 'react-icons/io5';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import api from '../../utils/api';
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
            toast.error('Gagal memuat data user');
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
            toast.success(`User berhasil ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengubah status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setActionLoading(true);
            await api.delete(`/users/${selectedUser._id}`);
            toast.success('User berhasil dihapus');
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus user');
        } finally {
            setActionLoading(false);
        }
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
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
                    <Badge variant="primary" size="lg">
                        <IoPeople className="mr-1" />
                        {pagination.total || 0} User
                    </Badge>
                </div>
            </div>

            {/* Search & Filter */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Cari nama, email, atau kelas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-20 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSearch('');
                                    }}
                                    className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <IoClose size={18} />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                                Cari
                            </button>
                        </div>
                    </form>

                    {/* Filter Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                    >
                        <option value="all">Semua Status</option>
                        <option value="true">Aktif</option>
                        <option value="false">Nonaktif</option>
                    </select>
                </div>
            </Card>

            {/* User List */}
            {users.length === 0 ? (
                <Card className="p-8 text-center">
                    <IoPeople className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">Tidak ada user ditemukan</p>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {users.map((user) => (
                        <Card key={user._id} className="p-4">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-blue-600">
                                    {user.nama?.charAt(0).toUpperCase()}
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
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(user)}
                                        disabled={actionLoading}
                                        className={`p-2 rounded-lg transition-all ${user.isActive
                                                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                                            }`}
                                        title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                    >
                                        {user.isActive ? <IoCloseCircle size={20} /> : <IoCheckmarkCircle size={20} />}
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(user)}
                                        disabled={actionLoading}
                                        className="p-2 rounded-lg transition-all bg-red-100 text-red-600 hover:bg-red-200"
                                        title="Hapus"
                                    >
                                        <IoTrash size={20} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                    >
                        Sebelumnya
                    </button>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                        {currentPage} / {pagination.pages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === pagination.pages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                    >
                        Selanjutnya
                    </button>
                </div>
            )}

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
        </div>
    );
};

export default KelolaUser;
