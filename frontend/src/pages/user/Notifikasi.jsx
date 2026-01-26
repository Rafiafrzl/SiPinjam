import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IoNotifications,
  IoCheckmarkDone,
  IoCheckmarkCircle,
  IoTime,
  IoClose,
  IoTrash,
  IoAlert
} from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Notifikasi = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat notifikasi..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            Notifikasi
            {unreadCount > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} notifikasi belum dibaca</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 active:scale-95 animate-in fade-in slide-in-from-right-4 duration-500"
          >
            <IoCheckmarkDone size={20} />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { value: 'all', label: 'Semua' },
          { value: 'unread', label: 'Belum Dibaca' },
          { value: 'read', label: 'Sudah Dibaca' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${filter === tab.value
              ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/20'
              : 'bg-neutral-900 text-gray-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
              }`}
          >
            {tab.label}
            {tab.value === 'unread' && unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
        {filteredNotifications.length === 0 ? (
          <div className="bg-neutral-900 rounded-2xl p-10 sm:p-16 text-center border border-neutral-800 border-dashed">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-800 rounded-full mb-6">
              <IoNotifications className="text-neutral-600" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">Tidak ada notifikasi</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              {filter === 'unread' ? 'Semua notifikasi Anda sudah dibaca dengan rapi!' : 'Belum ada notifikasi baru for Anda saat ini.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item) => (
              <div
                key={item._id}
                className={`group bg-neutral-900 rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${item.isRead
                  ? 'border-neutral-800 hover:border-neutral-700'
                  : 'border-purple-500/30 bg-purple-500/5 shadow-lg shadow-purple-500/5'
                  }`}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${item.isRead
                    ? 'bg-neutral-800 text-gray-500'
                    : 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-4 ring-purple-500/10'
                    }`}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className={`text-base transition-colors ${item.isRead ? 'text-gray-400' : 'font-bold text-gray-100 group-hover:text-purple-400'}`}>
                        {item.judul}
                      </h3>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap bg-neutral-800 px-2 py-1 rounded-lg border border-neutral-700/50">
                        {format(new Date(item.createdAt), 'dd MMM', { locale: id })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                      {item.pesan}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      {!item.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(item._id)}
                          className="text-xs text-purple-400 font-bold hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                        >
                          <IoCheckmarkDone size={16} />
                          Tandai Dibaca
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-xs text-red-400 font-bold hover:text-red-300 flex items-center gap-1.5 transition-colors"
                      >
                        <IoTrash size={14} />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Notifikasi;
