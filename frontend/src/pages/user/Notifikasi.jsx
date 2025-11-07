import { useState, useEffect } from 'react';
import { IoNotifications, IoCheckmark, IoTrash, IoCheckmarkDone } from 'react-icons/io5';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Notifikasi = () => {
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifikasi();
  }, []);

  const fetchNotifikasi = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifikasi');
      setNotifikasi(response.data.data);
    } catch (err) {
      toast.error('Gagal memuat notifikasi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifikasi/${id}/read`);
      setNotifikasi(notifikasi.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      toast.error('Gagal menandai notifikasi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifikasi/read-all');
      setNotifikasi(notifikasi.map(n => ({ ...n, isRead: true })));
      toast.success('Semua notifikasi ditandai sudah dibaca');
    } catch (err) {
      toast.error('Gagal menandai semua notifikasi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus notifikasi ini?')) return;

    try {
      await api.delete(`/notifikasi/${id}`);
      setNotifikasi(notifikasi.filter(n => n._id !== id));
      toast.success('Notifikasi berhasil dihapus');
    } catch (err) {
      toast.error('Gagal menghapus notifikasi');
    }
  };

  const getNotifIcon = (tipe) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[tipe] || 'ℹ️';
  };

  const getNotifBadge = (tipe) => {
    const variants = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'info'
    };
    return <Badge variant={variants[tipe]} size="sm">{tipe.toUpperCase()}</Badge>;
  };

  const filteredNotifikasi = notifikasi.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifikasi.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat notifikasi..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifikasi</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleMarkAllAsRead}
          >
            <IoCheckmarkDone size={18} />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Semua ({notifikasi.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'warning' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Belum Dibaca ({unreadCount})
        </Button>
        <Button
          variant={filter === 'read' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setFilter('read')}
        >
          Sudah Dibaca ({notifikasi.length - unreadCount})
        </Button>
      </div>

      {/* Notifikasi List */}
      {filteredNotifikasi.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <IoNotifications size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Tidak ada notifikasi</h3>
            <p>Notifikasi Anda akan muncul di sini</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifikasi.map((item) => (
            <Card
              key={item._id}
              className={`${!item.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">
                  {getNotifIcon(item.tipe)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">{item.judul}</h3>
                      <p className="text-sm text-gray-600">{item.pesan}</p>
                    </div>
                    {getNotifBadge(item.tipe)}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">
                      {format(new Date(item.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
                    </p>

                    <div className="flex gap-2">
                      {!item.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(item._id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <IoCheckmark size={18} />
                          Tandai Dibaca
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <IoTrash size={18} />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifikasi;
