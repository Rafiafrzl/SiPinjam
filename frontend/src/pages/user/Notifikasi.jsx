import { useState, useEffect } from 'react';
import {
  IoNotifications,
  IoCheckmarkDone,
  IoCheckmarkCircle,
  IoTime,
  IoClose,
  IoTrash,
  IoAlert
} from 'react-icons/io5';
import { toast } from 'react-toastify';
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
      toast.error('Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifikasi/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error('Gagal menandai notifikasi');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifikasi/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Semua notifikasi ditandai sudah dibaca');
    } catch (err) {
      toast.error('Gagal menandai notifikasi');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifikasi/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notifikasi dihapus');
    } catch (err) {
      toast.error('Gagal menghapus notifikasi');
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
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Notifikasi</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">{unreadCount} notifikasi belum dibaca</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all"
          >
            <IoCheckmarkDone size={18} />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { value: 'all', label: 'Semua' },
          { value: 'unread', label: 'Belum Dibaca' },
          { value: 'read', label: 'Sudah Dibaca' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all ${filter === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}
          >
            {tab.label}
            {tab.value === 'unread' && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 text-center">
          <IoNotifications className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-lg font-bold text-gray-700 mb-1">Tidak ada notifikasi</h3>
          <p className="text-sm text-gray-500">
            {filter === 'unread' ? 'Semua notifikasi sudah dibaca' : 'Belum ada notifikasi'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-xl p-3 sm:p-4 border transition-all ${item.isRead ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
                }`}
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.isRead ? 'bg-gray-100' : 'bg-white shadow'
                  }`}>
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm ${item.isRead ? 'text-gray-600' : 'font-semibold text-gray-800'}`}>
                      {item.judul}
                    </h3>
                    <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
                      {format(new Date(item.createdAt), 'dd MMM', { locale: id })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {item.pesan}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item._id)}
                        className="text-xs text-blue-600 font-medium hover:underline"
                      >
                        Tandai dibaca
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
                    >
                      <IoTrash size={12} />
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
  );
};

export default Notifikasi;
