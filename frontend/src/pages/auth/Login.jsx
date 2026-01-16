import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { IoMail, IoLockClosed } from "react-icons/io5";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import api from "../../utils/api";
import logo from "../../assets/logo/smkn2sby.png";
import bgImage from "../../assets/bg-smekda.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", loginData);
      if (response.data.success) {
        const { data } = response.data;
        login(data, data.token);
        toast.success("Login berhasil!", { autoClose: 2000 });
        navigate(data.role === "admin" ? "/admin/dashboard" : "/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login gagal. Silakan coba lagi.",
        { autoClose: 3000 }
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

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
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
              Welcome Back!
            </h1>
            <p className="text-gray-500 text-sm">
              Masuk ke akun Anda untuk melanjutkan.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="Masukkan email anda  "
                  required
                  className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors bg-transparent text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Login Now"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Buat akun baru sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
