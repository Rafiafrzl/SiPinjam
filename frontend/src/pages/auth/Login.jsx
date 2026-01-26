import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Toast from "../../components/ui/Toast";
import useAuth from "../../hooks/useAuth";
import api from "../../utils/api";
import logo from "../../assets/logo/sipinjam.png";
import bgImage from "../../assets/bg-login.png";
import PublicNavbar from "../../components/layout/PublicNavbar";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (location.state?.message) {
      Toast.success(location.state.message);
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
        Toast.success("Login berhasil!", { autoClose: 2000 });
        navigate(data.role === "admin" ? "/admin/dashboard" : "/dashboard");
      }
    } catch (err) {
      Toast.error(
        err.response?.data?.message || "Login gagal. Silakan coba lagi.",
        { autoClose: 3000 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicNavbar />
      <div className="h-screen flex relative bg-white overflow-hidden">
        {/* Left Panel - Background Image with Curved Edge (Desktop Only) */}
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

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-[45%] flex flex-col h-full bg-white relative">
          {/* Form Container - Centered */}
          <div className="flex-1 flex items-center justify-center px-6 py-8 lg:p-8">
            <div className="w-full max-w-sm">
              {/* Login Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Login</h1>
              <p className="text-gray-500 mb-8 text-sm lg:text-base">
                Masuk ke akun Anda untuk melanjutkan
              </p>

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="Masukkan email anda"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Masukkan password anda"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)" }}
                >
                  {loading ? "Memproses..." : "Login"}
                </button>
              </form>

              {/* Register Link */}
              <p className="mt-6 text-center text-gray-500 text-sm">
                Belum punya akun?{" "}
                <Link to="/register" className="text-purple-600 hover:underline font-medium">
                  Daftar Sekarang
                </Link>
              </p>
            </div>
          </div>

          {/* Logo Watermark - Bottom Right (Desktop Only) */}
          <img
            src={logo}
            alt=""
            className="absolute -bottom-8 -right-8 w-64 h-64 opacity-10 pointer-events-none select-none hidden lg:block"
          />
        </div>
      </div>
    </>
  );
};

export default Login;

