import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoPerson,
  IoMail,
  IoLockClosed,
  IoSchool,
  IoCall,
} from "react-icons/io5";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../utils/api";
import bgsmkn2 from "../../assets/bg-smekda.png";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    kelas: "",
    noTelepon: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await api.post("/auth/register", registerData);

      if (response.data.success) {
        toast.success("Registrasi berhasil! Silakan login dengan akun Anda.");
        // Redirect ke login
        navigate("/login");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registrasi gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image  */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgsmkn2})`,
          filter: "blur(3px)",
        }}
      />
      <div className="absolute inset-0 bg-black/30" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-purple-100 p-4 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Daftar Akun Baru
            </h1>
            <p className="text-gray-600">Isi data diri untuk membuat akun</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Nama Lengkap"
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                icon={<IoPerson size={20} />}
                required
              />

              <Input
                label="Kelas"
                type="text"
                name="kelas"
                value={formData.kelas}
                onChange={handleChange}
                placeholder="X, XI, XII"
                icon={<IoSchool size={20} />}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              icon={<IoMail size={20} />}
              required
            />

            <Input
              label="No. Telepon"
              type="tel"
              name="noTelepon"
              value={formData.noTelepon}
              onChange={handleChange}
              placeholder="Telepon"
              icon={<IoCall size={20} />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                icon={<IoLockClosed size={20} />}
                error={errors.password}
                required
              />

              <Input
                label="Konfirmasi Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Konfirmasi Password"
                icon={<IoLockClosed size={20} />}
                error={errors.confirmPassword}
                required
              />
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Daftar Sekarang
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="text-purple-600 font-semibold hover:underline"
              >
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
