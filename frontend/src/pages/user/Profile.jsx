import { useState, useRef } from 'react';
import {
  IoPerson,
  IoMail,
  IoSchool,
  IoCall,
  IoCreate,
  IoSave,
  IoShieldCheckmark,
  IoKey,
  IoClose,
  IoCamera,
  IoTrash
} from 'react-icons/io5';
import Toast from '../../components/ui/Toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageHelper';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    kelas: user?.kelas || '',
    noTelepon: user?.noTelepon || ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removedFoto, setRemovedFoto] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Toast.error('Ukuran file maksimal 5MB');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setRemovedFoto(false);
    }
  };

  const handleRemoveFoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRemovedFoto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let data;
      const isMultipart = selectedFile || removedFoto;

      if (isMultipart) {
        data = new FormData();
        data.append('nama', formData.nama);
        data.append('kelas', formData.kelas);
        data.append('noTelepon', formData.noTelepon);
        if (selectedFile) {
          data.append('foto', selectedFile);
        }
        if (removedFoto && !selectedFile) {
          data.append('removeFoto', 'true');
        }
      } else {
        data = formData;
      }

      const response = await api.put('/auth/profile', data, {
        headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {}
      });

      Toast.success('Profil berhasil diperbarui');
      setEditing(false);
      setSelectedFile(null);
      setRemovedFoto(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      if (response.data?.data) {
        updateUser(response.data.data);
      }
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Toast.error('Password baru tidak cocok');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Toast.error('Password minimal 6 karakter');
      return;
    }
    try {
      setLoading(true);
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      Toast.success('Password berhasil diubah');
      setChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
        {/* Profile Header */}
        <div className="rounded-2xl p-5 sm:p-8 relative overflow-hidden shadow-2xl border border-neutral-800" style={{ background: "linear-gradient(135deg, #171717 0%, #7c3aed 100%)" }}>
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <IoPerson size={120} />
          </div>
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-10">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white/30 backdrop-blur-sm shadow-xl overflow-hidden relative">
                {(!removedFoto && (previewUrl || user?.foto)) ? (
                  <img
                    src={previewUrl || getImageUrl(user.foto)}
                    alt={user?.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(user?.nama)
                )}

                {editing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <IoCamera size={24} className="text-white" />
                  </button>
                )}
              </div>

              {editing && (previewUrl || (!removedFoto && user?.foto)) && (
                <button
                  type="button"
                  onClick={handleRemoveFoto}
                  className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-4 border-neutral-900 text-white shadow-xl hover:bg-red-600 transition-all hover:scale-110 active:scale-95 z-20"
                  title="Batalkan/Hapus Foto Profil"
                >
                  <IoClose size={20} />
                </button>
              )}

              {editing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center border-4 border-neutral-900 text-white shadow-xl hover:bg-purple-500 transition-all hover:scale-110 active:scale-95 z-20"
                  title="Ubah Foto Profil"
                >
                  <IoCamera size={18} />
                </button>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.nama}</h1>
              <p className="text-purple-100 text-sm">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 text-white text-xs sm:text-sm font-medium rounded-full backdrop-blur-sm border border-white/10">
                {user?.role === 'admin' ? 'Administrator' : user?.kelas || 'Siswa'}
              </span>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-md border border-white/20 transition-all text-sm active:scale-95 shadow-lg shadow-black/10"
              >
                <IoCreate size={18} />
                Edit Profil
              </button>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-neutral-900/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/5 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-purple-600 rounded-full inline-block"></span>
            Informasi Profil
          </h2>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama lengkap"
                  className="bg-neutral-800 border-neutral-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
                  Kelas <span className="text-gray-500 text-xs">(opsional)</span>
                </label>
                <Input
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  placeholder="Masukkan Kelas anda"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
                  No. Telepon <span className="text-gray-500 text-xs">(opsional)</span>
                </label>
                <Input
                  value={formData.noTelepon}
                  onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                  placeholder="Masukkan No. Telepon anda"
                  className="bg-neutral-800 border-neutral-700 text-white"
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
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 sm:p-4 bg-neutral-800 border border-neutral-700/50 rounded-xl group hover:border-purple-500/30 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/20 text-purple-400 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <IoPerson size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Nama Lengkap</p>
                  <p className="font-semibold text-white text-sm sm:text-base truncate">{user?.nama}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 sm:p-4 bg-neutral-800 border border-neutral-700/50 rounded-xl group hover:border-purple-500/30 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/20 text-purple-400 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <IoMail size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</p>
                  <p className="font-semibold text-white text-sm sm:text-base truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 sm:p-4 bg-neutral-800 border border-neutral-700/50 rounded-xl group hover:border-purple-500/30 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/20 text-purple-400 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <IoSchool size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Kelas</p>
                  <p className="font-semibold text-white text-sm sm:text-base">{user?.kelas || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 sm:p-4 bg-neutral-800 border border-neutral-700/50 rounded-xl group hover:border-purple-500/30 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/20 text-purple-400 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <IoCall size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">No. Telepon</p>
                  <p className="font-semibold text-white text-sm sm:text-base">{user?.noTelepon || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-neutral-900/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/5 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/20">
                <IoShieldCheckmark className="text-white" size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Keamanan Akun</h2>
            </div>
            {!changingPassword && (
              <button
                onClick={() => setChangingPassword(true)}
                className="text-sm text-purple-400 font-semibold hover:text-purple-300 flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/10 rounded-lg border border-purple-500/20 transition-all"
              >
                <IoKey size={16} />
                Ubah Password
              </button>
            )}
          </div>

          {changingPassword && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Password Lama</label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Masukkan password lama"
                  className="bg-neutral-800 border-neutral-700 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Password Baru</label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Password"
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Konfirmasi Password</label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Ulangi password baru"
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>
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
                  Simpan Password
                </Button>
              </div>
            </form>
          )}

          {!changingPassword && (
            <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-xl border border-neutral-700/50">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-400 italic">
                Disarankan untuk mengubah password secara berkala demi keamanan akun Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
