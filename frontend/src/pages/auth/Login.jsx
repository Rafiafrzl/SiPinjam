import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { IoMail, IoLockClosed } from "react-icons/io5";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import useAuth from "../../hooks/useAuth";
import api from "../../utils/api";
import logo from "../../assets/logo/smkn2sby.png";
import bgsmkn2 from "../../assets/bg-smekda.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Check for success message from register
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      if (response.data.success) {
        const { data } = response.data;
        login(data, data.token);

        toast.success("Login berhasil!", { autoClose: 2000 });

        // Redirect berdasarkan role
        if (data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login gagal. Silakan coba lagi.",
        {
          autoClose: 3000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgsmkn2})`,
          filter: "blur(3px)",
        }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <img
                src={logo}
                alt="Logo SMKN 2 Surabaya"
                className="w-24 h-24 object-contain mx-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Selamat Datang!
            </h1>
            <p className="text-gray-600">Sistem Peminjaman Barang Sekolah</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              icon={<IoLockClosed size={20} />}
              required
            />

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-purple-600 font-semibold hover:underline"
              >
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
