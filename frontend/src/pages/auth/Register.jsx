import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../components/ui/Toast";
import api from "../../utils/api";
import logo from "../../assets/logo/sipinjam.png";
import bgImage from "../../assets/bg-login.png";
import PublicNavbar from "../../components/layout/PublicNavbar";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: "",
    nis: "",
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

    if (formData.nis && !/^\d+$/.test(formData.nis)) {
      newErrors.nis = "NIS hanya boleh berisi angka";
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
        Toast.success("Registrasi berhasil! Akun Anda akan aktif setelah disetujui oleh admin.");
        navigate("/login");
      }
    } catch (err) {
      Toast.error(
        err.response?.data?.message || "Registrasi gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicNavbar />
      <div className="h-screen flex relative bg-white overflow-hidden">
        {/* Left Panel - Background Image with Curved Edge */}
        <div
          className="hidden lg:block lg:w-[55%] relative"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {/* Curved Edge SVG - Half Circle */}
          <svg
            className="absolute right-0 top-0 h-full z-10"
            style={{ transform: "translateX(50%)" }}
            width="200"
            height="100%"
            viewBox="0 0 200 800"
            preserveAspectRatio="none"
            fill="white"
          >
            <path d="M200,0 L200,800 L0,800 C110,600 110,200 0,0 Z" />
          </svg>
        </div>

        {/* Right Panel - Register Form */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-white relative overflow-hidden">
          {/* Logo - Bottom Right */}
          <img
            src={logo}
            alt=""
            className="absolute -bottom-8 -right-8 w-64 h-64 opacity-10 pointer-events-none select-none hidden lg:block"
          />

          <div className="w-full max-w-md my-4 lg:my-0">
            {/* Register Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Daftar</h1>
            <p className="text-gray-500 mb-4 text-sm">Buat akun baru untuk mulai menggunakan SiPinjam</p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nama & Kelas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Nama lengkap"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kelas"
                    value={formData.kelas}
                    onChange={handleChange}
                    placeholder="X, XI, XII"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>

              {/* Email & NIS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    NIS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nis"
                    value={formData.nis}
                    onChange={handleChange}
                    placeholder="Nomor Induk Siswa"
                    required
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400 text-sm ${errors.nis ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.nis && (
                    <p className="text-red-500 text-xs mt-1">{errors.nis}</p>
                  )}
                </div>
              </div>

              {/* No Telepon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  No. Telepon <span className="text-gray-400 text-xs">(opsional)</span>
                </label>
                <input
                  type="tel"
                  name="noTelepon"
                  value={formData.noTelepon}
                  onChange={handleChange}
                  placeholder="Masukkan No Telepon"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan Password"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Konfirmasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 mt-2"
                style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)" }}
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-4 text-center text-gray-500 text-sm">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-purple-600 hover:underline font-medium">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

