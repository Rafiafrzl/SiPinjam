import { useState } from 'react';
import {
  IoPerson,
  IoMail,
  IoSchool,
  IoCall,
  IoCreate,
  IoSave,
  IoShieldCheckmark,
  IoKey,
  IoClose
} from 'react-icons/io5';
import { toast } from 'react-toastify';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import api from '../../utils/api';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    kelas: user?.kelas || '',
    noTelepon: user?.noTelepon || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/users/profile', formData);
      toast.success('Profil berhasil diperbarui');
      setEditing(false);
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    try {
      setLoading(true);
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password berhasil diubah');
      setChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
      {/* Profile Header */}
      <div className="bg-blue-600 rounded-2xl p-5 sm:p-8">
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white/30">
            {getInitials(user?.nama)}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.nama}</h1>
            <p className="text-blue-100 text-sm">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 text-white text-xs sm:text-sm font-medium rounded-full">
              {user?.role === 'admin' ? 'Administrator' : user?.kelas || 'Siswa'}
            </span>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:bg-blue-50 transition-all text-sm"
            >
              <IoCreate size={18} />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Informasi Profil</h2>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <Input
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <Input
                value={formData.kelas}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                placeholder="Kelas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
              <Input
                value={formData.noTelepon}
                onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                placeholder="No, Telpon"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => {
                  setEditing(false);
                  setFormData({ nama: user?.nama || '', kelas: user?.kelas || '', noTelepon: user?.noTelepon || '' });
                }}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" fullWidth loading={loading}>
                <IoSave size={18} />
                Simpan
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <IoPerson className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Nama Lengkap</p>
                <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{user?.nama}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <IoMail className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <IoSchool className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Kelas</p>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">{user?.kelas || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                <IoCall className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">No. Telepon</p>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">{user?.noTelepon || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-lg sm:rounded-xl flex items-center justify-center">
              <IoShieldCheckmark className="text-white" size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Keamanan Akun</h2>
          </div>
          {!changingPassword && (
            <button
              onClick={() => setChangingPassword(true)}
              className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              <IoKey size={16} />
              Ubah Password
            </button>
          )}
        </div>

        {changingPassword && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Masukkan password lama"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Minimal 6 karakter"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Ulangi password baru"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => {
                  setChangingPassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                <IoClose size={18} />
                Batal
              </Button>
              <Button type="submit" variant="primary" fullWidth loading={loading}>
                <IoSave size={18} />
                Simpan
              </Button>
            </div>
          </form>
        )}

        {!changingPassword && (
          <p className="text-sm text-gray-500">
            Disarankan untuk mengubah password secara berkala demi keamanan akun Anda.
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
