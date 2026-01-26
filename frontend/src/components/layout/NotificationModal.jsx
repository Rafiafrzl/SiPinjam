import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoNotifications,
    IoCheckmarkDone,
    IoCheckmarkCircle,
    IoTime,
    IoClose,
    IoTrash,
    IoAlert
} from 'react-icons/io5';
import Toast from '../ui/Toast';
import Loading from '../ui/Loading';
import api from '../../utils/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const NotificationModal = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifikasi');
            setNotifications(response.data.data);
        } catch (err) {
            Toast.error('Gagal memuat notifikasi');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifikasi/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            window.dispatchEvent(new Event('notificationUpdated'));
        } catch (err) {
            Toast.error('Gagal menandai notifikasi');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifikasi/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            window.dispatchEvent(new Event('notificationUpdated'));
            Toast.success('Semua notifikasi ditandai sudah dibaca');
        } catch (err) {
            Toast.error('Gagal menandai notifikasi');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifikasi/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            Toast.success('Notifikasi dihapus');
        } catch (err) {
            Toast.error('Gagal menghapus notifikasi');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'approval':
                return <IoCheckmarkCircle className="text-emerald-500" size={20} />;
            case 'rejection':
                return <IoClose className="text-red-500" size={20} />;
            case 'reminder':
                return <IoTime className="text-amber-500" size={20} />;
            case 'warning':
                return <IoAlert className="text-orange-500" size={20} />;
            default:
                return <IoNotifications className="text-blue-500" size={20} />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-neutral-950 border-l border-white/10 shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    Notifikasi
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] rounded-full">
                                            {unreadCount} Baru
                                        </span>
                                    )}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">Pemberitahuan aktivitas peminjaman Anda</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                <IoClose size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {/* Filter Tabs */}
                            <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl">
                                {[
                                    { value: 'all', label: 'Semua' },
                                    { value: 'unread', label: 'Belum Dibaca' },
                                    { value: 'read', label: 'Sudah Dibaca' }
                                ].map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => setFilter(tab.value)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter === tab.value
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Actions */}
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="w-full mb-6 py-3 border border-purple-500/30 bg-purple-500/5 text-purple-400 text-xs font-bold rounded-xl hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <IoCheckmarkDone size={18} />
                                    Tandai Semua Dibaca
                                </button>
                            )}

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loading size="md" />
                                    <p className="text-sm text-gray-500 mt-4">Memuat notifikasi...</p>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <IoNotifications className="text-gray-600" size={40} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-300">Kosong</h3>
                                    <p className="text-sm text-gray-500 max-w-[200px] mt-2">
                                        {filter === 'unread'
                                            ? 'Semua notifikasi sudah Anda baca.'
                                            : 'Belum ada notifikasi untuk saat ini.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredNotifications.map((item) => (
                                        <motion.div
                                            layout
                                            key={item._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`group p-4 rounded-2xl border transition-all duration-300 ${item.isRead
                                                    ? 'bg-white/[0.02] border-white/5'
                                                    : 'bg-purple-500/5 border-purple-500/20 shadow-lg shadow-purple-500/5'
                                                }`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.isRead ? 'bg-white/5' : 'bg-purple-600 shadow-lg shadow-purple-600/20'
                                                    }`}>
                                                    {getIcon(item.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className={`text-sm tracking-tight ${item.isRead ? 'text-gray-400' : 'font-bold text-white'}`}>
                                                            {item.judul}
                                                        </h4>
                                                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                                            {format(new Date(item.createdAt), 'dd MMM', { locale: id })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                                                        {item.pesan}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        {!item.isRead && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(item._id)}
                                                                className="text-[10px] text-purple-400 font-bold hover:text-purple-300 flex items-center gap-1"
                                                            >
                                                                <IoCheckmarkDone size={14} />
                                                                Baca
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="text-[10px] text-red-500/70 font-bold hover:text-red-400 flex items-center gap-1"
                                                        >
                                                            <IoTrash size={12} />
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationModal;
