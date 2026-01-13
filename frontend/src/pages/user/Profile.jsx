import { useState } from "react";
import {
  IoPerson,
  IoMail,
  IoSchool,
  IoCall,
  IoLockClosed,
  IoSave,
} from "react-icons/io5";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import useAuth from "../../hooks/useAuth";
import api from "../../utils/api";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: user?.nama || "",
    kelas: user?.kelas || "",
    noTelepon: user?.noTelepon || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put("/auth/profile", formData);
      updateUser(response.data.data);
      toast.success("Profile berhasil diupdate");
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password baru tidak cocok");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password berhasil diubah");
      setChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error(err.response?.data?.message || "Gagal ubah password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Profile Saya</h1>
        <p className="text-gray-600 mt-1">Kelola informasi profile Anda</p>
      </div>

      {/* Profile Info */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>Informasi Profile</Card.Title>
            {!editing && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </Card.Header>

        <Card.Content>
          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Nama Lengkap"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                icon={<IoPerson size={20} />}
                required
              />

              <Input
                label="Email"
                type="email"
                value={user?.email}
                icon={<IoMail size={20} />}
                disabled
              />

              <Input
                label="Kelas"
                name="kelas"
                value={formData.kelas}
                onChange={handleChange}
                icon={<IoSchool size={20} />}
                required
              />

              <Input
                label="No. Telepon"
                name="noTelepon"
                value={formData.noTelepon}
                onChange={handleChange}
                icon={<IoCall size={20} />}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      nama: user?.nama || "",
                      kelas: user?.kelas || "",
                      noTelepon: user?.noTelepon || "",
                    });
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                  <IoSave size={18} />
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <IoPerson className="text-gray-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Nama Lengkap</p>
                  <p className="font-semibold text-gray-800">{user?.nama}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <IoMail className="text-gray-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <IoSchool className="text-gray-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Kelas</p>
                  <p className="font-semibold text-gray-800">
                    {user?.kelas || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <IoCall className="text-gray-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">No. Telepon</p>
                  <p className="font-semibold text-gray-800">
                    {user?.noTelepon || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Change Password */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>Ubah Password</Card.Title>
            {!changingPassword && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChangingPassword(true)}
              >
                <IoLockClosed size={18} />
                Ubah Password
              </Button>
            )}
          </div>
        </Card.Header>

        {changingPassword && (
          <Card.Content>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Password Lama"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Masukkan password lama"
                icon={<IoLockClosed size={20} />}
                required
              />

              <Input
                label="Password Baru"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Minimal 6 karakter"
                icon={<IoLockClosed size={20} />}
                required
              />

              <Input
                label="Konfirmasi Password Baru"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Ketik ulang password baru"
                icon={<IoLockClosed size={20} />}
                required
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordData({
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                  <IoSave size={18} />
                  Simpan Password
                </Button>
              </div>
            </form>
          </Card.Content>
        )}
      </Card>
    </div>
  );
};

export default Profile;
