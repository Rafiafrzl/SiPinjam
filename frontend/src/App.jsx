import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import UserLayout from "./components/layout/UserLayout";
import PublicLayout from "./components/layout/PublicLayout";
import { ToastContainer } from "react-toastify";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Public Pages
import LandingPage from "./pages/public/LandingPage";
import PublicKatalog from "./pages/public/PublicKatalog";

// User Pages
import Dashboard from "./pages/user/Dashboard";
import Barang from "./pages/user/Barang";
import PeminjamanUser from "./pages/user/PeminjamanUser";
import PengembalianUser from "./pages/user/PengembalianUser";
import Riwayat from "./pages/user/Riwayat";
import Notifikasi from "./pages/user/Notifikasi";
import Profile from "./pages/user/Profile";
import Bantuan from "./pages/user/Bantuan";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminBarang from "./pages/admin/KelolaBarang";
import AdminPeminjaman from "./pages/admin/Permintaan";
import AdminPengembalian from "./pages/admin/Pengembalian";
import AdminStatistik from "./pages/admin/Statistik";
import ProfileAdmin from "./pages/admin/ProfileAdmin";
import KelolaUser from "./pages/admin/KelolaUser";
import RiwayatAdmin from "./pages/admin/RiwayatAdmin";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Routes>
          {/* Public Routes - Landing */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route element={<PublicLayout />}>
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/katalog" element={<PublicKatalog />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected User Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute requiredRole="user">
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="barang" element={<Barang />} />
            <Route path="peminjaman" element={<PeminjamanUser />} />
            <Route path="pengembalian" element={<PengembalianUser />} />
            <Route path="riwayat" element={<Riwayat />} />
            <Route path="notifikasi" element={<Notifikasi />} />
            <Route path="profile" element={<Profile />} />
            <Route path="bantuan" element={<Bantuan />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="barang" element={<AdminBarang />} />
            <Route path="peminjaman" element={<AdminPeminjaman />} />
            <Route path="pengembalian" element={<AdminPengembalian />} />
            <Route path="statistik" element={<AdminStatistik />} />
            <Route path="users" element={<KelolaUser />} />
            <Route path="riwayat" element={<RiwayatAdmin />} />
            <Route path="profile" element={<ProfileAdmin />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
