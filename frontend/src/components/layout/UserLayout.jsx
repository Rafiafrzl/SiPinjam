import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoHome,
  IoLibrary,
  IoList,
  IoCheckmarkCircle,
  IoTime,
  IoNotifications,
  IoPerson,
  IoLogOut,
  IoMenu,
  IoClose,
  IoChevronDown,
  IoSearch,
  IoHelpCircle,
} from "react-icons/io5";
import useAuth from "../../hooks/useAuth";
import logoSiPinjam from "../../assets/logo/sipinjam.png";
import api from "../../utils/api";
import NotificationModal from "./NotificationModal";

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    fetchNotifCount();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchNotifCount = async () => {
    try {
      const response = await api.get("/notifikasi", {
        params: { isRead: false },
      });
      setNotifCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notif count:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/barang?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { path: "/dashboard", label: "Beranda", icon: IoHome },
    { path: "/barang", label: "Katalog Barang", icon: IoLibrary },
    { path: "/peminjaman", label: "Peminjaman Saya", icon: IoList },
    { path: "/pengembalian", label: "Pengembalian", icon: IoCheckmarkCircle },
    { path: "/riwayat", label: "Riwayat", icon: IoTime },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-xl ${isScrolled
          ? "bg-black/60 shadow-lg border-b border-white/5"
          : "bg-black/40 border-b border-white/5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center gap-3 flex-shrink-0"
            >
              <img
                src={logoSiPinjam}
                alt="Logo SiPinjam"
                className="w-12 h-12 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">SiPinjam</h1>
                <p className="text-xs text-gray-400">Sistem Peminjaman Barang Sekolah</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-xl mx-8"
            >
              <div className="relative w-full">
                <IoSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Cari barang yang ingin dipinjam..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-full focus:outline-none focus:border-purple-500 focus:bg-neutral-800 transition-all text-sm text-white"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors flex items-center gap-1"
                >
                  <IoSearch size={18} />
                  <span className="hidden lg:inline text-sm font-medium">
                    Cari
                  </span>
                </button>
              </div>
            </form>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Notification */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className={`relative p-2.5 rounded-full transition-all ${isNotifOpen
                  ? "bg-purple-600/20 text-purple-400"
                  : "text-gray-400 hover:bg-neutral-800 hover:text-white"
                  }`}
              >
                <IoNotifications size={22} />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center animate-pulse">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-neutral-800 mx-2"></div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-neutral-800 transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user?.nama?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-white leading-tight max-w-[100px] truncate">
                      {user?.nama?.split(" ")[0]}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.kelas || "User"}
                    </p>
                  </div>
                  <IoChevronDown
                    size={16}
                    className={`hidden lg:block text-gray-500 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-900 rounded-2xl shadow-xl border border-neutral-800 py-2 z-20 overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-neutral-800">
                        <p className="font-semibold text-white">
                          {user?.nama}
                        </p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-neutral-800 transition-colors"
                      >
                        <IoPerson size={20} className="text-gray-500" />
                        <span>Profile Saya</span>
                      </Link>
                      <Link
                        to="/riwayat"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-neutral-800 transition-colors"
                      >
                        <IoTime size={20} className="text-gray-500" />
                        <span>Riwayat Peminjaman</span>
                      </Link>
                      <Link
                        to="/bantuan"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-neutral-800 transition-colors"
                      >
                        <IoHelpCircle size={20} className="text-gray-500" />
                        <span>Bantuan</span>
                      </Link>
                      <div className="border-t border-neutral-800 mt-1 pt-1">
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <IoLogOut size={20} />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2.5 text-gray-400 hover:bg-neutral-800 hover:text-white rounded-full transition-all"
              >
                {showMobileMenu ? <IoClose size={24} /> : <IoMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Bar - Desktop Centered & Glass */}
        <div className="bg-white/5 backdrop-blur-md hidden lg:block border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center justify-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative group ${isActive(link.path)
                      ? "text-purple-400"
                      : "text-gray-400 hover:text-white"
                      }`}
                  >
                    <Icon size={18} />
                    {link.label}
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 py-3 bg-neutral-950 border-t border-neutral-800">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <IoSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-full focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm text-white"
              />
            </div>
          </form>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <>
            {/* Overlay */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Mobile Menu Panel */}
            <div className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-neutral-950 border-l border-neutral-800 z-50 flex flex-col animate-slide-in">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <h2 className="text-lg font-bold text-white">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-full"
                >
                  <IoClose size={24} />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 bg-purple-600">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                    {user?.nama?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user?.nama}</p>
                    <p className="text-purple-100 text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${isActive(link.path)
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-gray-400 hover:bg-neutral-800 hover:text-white"
                        }`}
                    >
                      <Icon size={22} />
                      {link.label}
                    </Link>
                  );
                })}

                {/* Profile Link */}
                <Link
                  to="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${isActive("/profile")
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:bg-neutral-800 hover:text-white"
                    }`}
                >
                  <IoPerson size={22} />
                  Profile Saya
                </Link>
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-neutral-800">
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 font-medium rounded-xl hover:bg-red-500/20 transition-all"
                >
                  <IoLogOut size={20} />
                  Keluar
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            {/* About */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                <img
                  src={logoSiPinjam}
                  alt="Logo SiPinjam"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">SiPinjam</h3>
                  <p className="text-sm text-purple-400">Sistem Peminjaman</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 max-w-sm">
                Sistem peminjaman barang online untuk memudahkan siswa
                dalam meminjam peralatan sekolah dengan mudah dan efisien.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-white font-semibold mb-4">Menu</h4>
              <ul className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm">
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <IoHome size={16} />
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link
                    to="/barang"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <IoLibrary size={16} />
                    Katalog Barang
                  </Link>
                </li>
                <li>
                  <Link
                    to="/peminjaman"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <IoList size={16} />
                    Peminjaman Saya
                  </Link>
                </li>
                <li>
                  <Link
                    to="/riwayat"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <IoTime size={16} />
                    Riwayat
                  </Link>
                </li>
                <li>
                  <Link
                    to="/bantuan"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <IoHelpCircle size={16} />
                    Bantuan
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-neutral-800 bg-black">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-sm text-center text-gray-500">© 2026 SiPinjam</p>
          </div>
        </div>
      </footer>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </div>
  );
};

export default UserLayout;
