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
import { getImageUrl } from "../../utils/imageHelper";

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
  const [hoveredPath, setHoveredPath] = useState(null);

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
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-black/60 backdrop-blur-xl shadow-lg border-b border-white/10 py-2"
          : "bg-transparent border-b border-transparent py-4"
          }`}
      >
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-16 gap-8">
            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center gap-3 flex-shrink-0"
            >
              <img
                src={logoSiPinjam}
                alt="Logo SiPinjam"
                className="w-10 h-10 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white leading-tight">SiPinjam</h1>
                <p className="text-[10px] text-gray-400">Peminjaman Barang</p>
              </div>
            </Link>

            <nav
              className="hidden lg:flex items-center gap-1 ml-4"
              onMouseLeave={() => setHoveredPath(null)}
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onMouseEnter={() => setHoveredPath(link.path)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all relative group rounded-lg ${isActive(link.path)
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                      }`}
                  >
                    {/* Hover Background Highlight */}
                    {hoveredPath === link.path && (
                      <motion.div
                        layoutId="hover-bg"
                        className="absolute inset-0 bg-white/5 rounded-lg -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    <Icon size={16} className={isActive(link.path) ? "text-purple-400" : "text-gray-500 group-hover:text-gray-300"} />
                    {link.label}

                    {/* Active Underline */}
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="nav-active"
                        initial={false}
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                          mass: 1
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex items-center flex-1 max-w-sm ml-6">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <IoSearch className="text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anything..."
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/5 focus:border-purple-500/50 text-white text-sm rounded-xl pl-11 pr-4 py-2 transition-all outline-none backdrop-blur-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">

                  </div>
                </div>
              </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Notification */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className={`relative p-2 rounded-full transition-all ${isNotifOpen
                  ? "bg-purple-600/20 text-purple-400"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <IoNotifications size={22} />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center animate-pulse">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>

              <div className="hidden sm:block w-px h-6 bg-white/10 mx-2"></div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg overflow-hidden">
                    {user?.foto ? (
                      <img
                        src={getImageUrl(user.foto)}
                        alt={user?.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.nama?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <IoChevronDown
                    size={14}
                    className={`hidden lg:block text-gray-500 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-3 w-64 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden py-1">
                      <div className="px-4 py-3 bg-white/5 border-b border-white/5">
                        <p className="font-semibold text-white">{user?.nama}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
                          <IoPerson size={18} />
                        </div>
                        Profile Saya
                      </Link>
                      <Link to="/riwayat" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
                          <IoTime size={18} />
                        </div>
                        Riwayat Peminjaman
                      </Link>
                      <Link to="/bantuan" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all border-b border-white/5 pb-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
                          <IoHelpCircle size={18} />
                        </div>
                        Bantuan & Panduan
                      </Link>
                      <button onClick={() => { handleLogout(); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all mt-1">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                          <IoLogOut size={18} />
                        </div>
                        Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-gray-400 hover:bg-white/10 hover:text-white rounded-full transition-all"
              >
                {showMobileMenu ? <IoClose size={24} /> : <IoMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <>
            <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowMobileMenu(false)} />
            <div className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-neutral-950 border-l border-white/10 z-50 flex flex-col animate-slide-in">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
                  <IoClose size={24} />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-white/5">
                <form onSubmit={handleSearch} className="relative group">
                  <IoSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anything..."
                    className="w-full bg-white/5 border border-white/5 text-white text-sm rounded-xl pl-11 pr-4 py-3 outline-none focus:border-purple-500/50 transition-all"
                  />
                </form>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</div>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold transition-all ${isActive(link.path)
                        ? "bg-purple-600 text-white shadow-xl shadow-purple-600/20"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <Icon size={20} className={isActive(link.path) ? "text-white" : "text-gray-500"} />
                      {link.label}
                    </Link>
                  );
                })}

                <div className="pt-8 mb-4 border-t border-white/5">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-4">Account</div>
                  <Link
                    to="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 overflow-hidden">
                      {user?.foto ? (
                        <img
                          src={getImageUrl(user.foto)}
                          alt={user?.nama}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <IoPerson size={20} />
                      )}
                    </div>
                    Profile Saya
                  </Link>
                  <Link
                    to="/riwayat"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <IoTime size={20} className="text-gray-500" />
                    Riwayat Peminjaman
                  </Link>
                  <Link
                    to="/bantuan"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <IoHelpCircle size={20} className="text-gray-500" />
                    Bantuan & Panduan
                  </Link>
                </div>

                <div className="pt-4 pb-12">
                  <button
                    onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
                  >
                    <IoLogOut size={20} />
                    Keluar
                  </button>
                </div>
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${location.pathname === '/dashboard' ? '' : 'pt-24 lg:pt-28'}`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                <img src={logoSiPinjam} alt="Logo SiPinjam" className="w-10 h-10 object-contain" />
                <div>
                  <h3 className="text-lg font-bold text-white">SiPinjam</h3>
                  <p className="text-xs text-purple-400">Sistem Peminjaman Sekolah</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                Platform peminjaman barang terpadu untuk memudahkan operasional sekolah secara efisien dan transparan.
              </p>
            </div>
            <div className="text-center md:text-left">

              <ul className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm">
                {navLinks.map(link => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-gray-500 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 bg-black/50 py-6">
          <div className="max-w-[1600px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">© 2026 SiPinjam. All rights reserved.</p>

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
