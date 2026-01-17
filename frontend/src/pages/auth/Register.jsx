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
import api from "../../utils/api";
import logo from "../../assets/logo/smkn2sby.png";
import bgImage from "../../assets/bg-smekda.png";

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
    <div className="min-h-screen flex">
      {/* Left Panel - Background Image with Blur */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image with Blur Effect */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(3px)",
            transform: "scale(1.05)",
          }}
        />

        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Centered Logo with Opacity */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <img
            src={logo}
            alt="Logo SMKN 2 Surabaya"
            className="w-96 h-96"
            style={{ opacity: 0.7 }}
          />
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <img
              src={logo}
              alt="Logo SMKN 2 Surabaya"
              className="w-16 h-16 mx-auto mb-4"
            />
          </div>

          {/* App Name */}
          <h2 className="text-2xl font-bold text-gray-900 mb-8">SiPinjam</h2>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Buat Akun Baru
            </h1>
            <p className="text-gray-500 text-sm">
              Isi data diri Anda untuk mendaftar.
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama & Kelas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Nama Lengkap"
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="kelas"
                    value={formData.kelas}
                    onChange={handleChange}
                    placeholder="Masukkan Kelas anda"
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan Email anda"
                  required
                  className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* No Telepon Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Telepon <span className="text-gray-400 text-xs">(opsional)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="noTelepon"
                  value={formData.noTelepon}
                  onChange={handleChange}
                  placeholder="Masukkan No. Telepon anda"
                  className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password"
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
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
