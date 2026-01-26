import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoTime, IoCheckmarkCircle, IoClose, IoCalendar, IoLayers } from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Riwayat = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    disetujui: 0,
    ditolak: 0
  });

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const [riwayatRes, statsRes] = await Promise.all([
        api.get('/peminjaman/user/my-peminjaman'),
        api.get('/statistik/user')
      ]);

      const allData = riwayatRes.data.data || [];
      setRiwayat(allData);

      const total = allData.length;
      const disetujui = allData.filter(p => p.status === 'Disetujui' || p.status === 'Selesai').length;
      const ditolak = allData.filter(p => p.status === 'Ditolak').length;

      setStats({ total, disetujui, ditolak });
    } catch (err) {
      Toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'Menunggu': { bg: 'bg-amber-500', text: 'text-white', icon: IoTime },
      'Disetujui': { bg: 'bg-emerald-500', text: 'text-white', icon: IoCheckmarkCircle },
      'Ditolak': { bg: 'bg-red-500', text: 'text-white', icon: IoClose },
      'Selesai': { bg: 'bg-blue-500', text: 'text-white', icon: IoCheckmarkCircle },
    };
    const c = config[status] || config['Menunggu'];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full ${c.bg} ${c.text}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Memuat riwayat..." />
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
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Riwayat Peminjaman</h1>
        <p className="text-sm text-gray-400 mt-1">Semua aktivitas peminjaman Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 sm:p-4 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 mx-auto mb-2 bg-purple-600/20 rounded-lg flex items-center justify-center relative z-10">
            <IoLayers className="text-purple-400" size={20} />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white relative z-10">{stats.total}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 relative z-10">Total</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 sm:p-4 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 mx-auto mb-2 bg-emerald-600/20 rounded-lg flex items-center justify-center relative z-10">
            <IoCheckmarkCircle className="text-emerald-400" size={20} />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white relative z-10">{stats.disetujui}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 relative z-10">Disetujui</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 sm:p-4 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 mx-auto mb-2 bg-red-600/20 rounded-lg flex items-center justify-center relative z-10">
            <IoClose className="text-red-400" size={20} />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white relative z-10">{stats.ditolak}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 relative z-10">Ditolak</p>
        </div>
      </div>

      {/* List */}
      {riwayat.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 sm:p-12 text-center border-dashed">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-800 rounded-full mb-4">
            <IoTime className="text-neutral-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-400 mb-1">Belum ada riwayat</h3>
          <p className="text-sm text-gray-500">Riwayat peminjaman Anda akan muncul di sini</p>
        </div>
      ) : (
        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-3">
            {riwayat.map((item) => (
              <div key={item._id} className="bg-neutral-900 rounded-xl p-3 sm:p-4 border border-neutral-800 hover:border-purple-500/50 transition-all group">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                    <img
                      src={getImageUrl(item.barangId?.foto, 'https://via.placeholder.com/80')}
                      alt={item.barangId?.namaBarang}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-white text-sm truncate group-hover:text-purple-400 transition-colors">
                        {item.barangId?.namaBarang}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{item.jumlahPinjam} unit</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <IoCalendar size={12} />
                      <span>{format(new Date(item.tanggalPinjam), 'dd MMM yyyy', { locale: id })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Riwayat;
