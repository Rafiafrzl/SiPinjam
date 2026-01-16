import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  IoHome,
  IoLibrary,
  IoList,
  IoTime,
  IoStatsChart,
  IoCheckmarkCircle,
  IoClose,
  IoNotifications,
  IoLogOut,
  IoMenu,
  IoChevronUp,
  IoPerson,
  IoPeople,
} from "react-icons/io5";
import useAuth from "../../hooks/useAuth";
import logoSmkn2 from "../../assets/logo/smkn2sby.png";
import api from "../../utils/api";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user?.role === "user") {
      fetchNotifCount();
    }
  }, [user]);

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

  const userMenuSections = [
    {
      title: "MENU UTAMA",
      items: [
        { path: "/dashboard", icon: IoHome, label: "Dashboard" },
        { path: "/barang", icon: IoLibrary, label: "Daftar Barang" },
      ],
    },
    {
      title: "AKTIVITAS",
      items: [
        { path: "/peminjaman", icon: IoList, label: "Peminjaman Saya" },
        { path: "/pengembalian", icon: IoCheckmarkCircle, label: "Pengembalian" },
        { path: "/riwayat", icon: IoTime, label: "Riwayat" },
      ],
    },
    {
      title: "LAINNYA",
      items: [
        {
          path: "/notifikasi",
          icon: IoNotifications,
          label: "Notifikasi",
          badge: notifCount,
        },
      ],
    },
  ];

  const adminMenuSections = [
    {
      title: "MENU UTAMA",
      items: [
        { path: "/admin/dashboard", icon: IoHome, label: "Dashboard" },
        { path: "/admin/statistik", icon: IoStatsChart, label: "Statistik" },
      ],
    },
    {
      title: "KELOLA DATA",
      items: [
        { path: "/admin/barang", icon: IoLibrary, label: "Kelola Barang" },
        { path: "/admin/users", icon: IoPeople, label: "Kelola User" },
        { path: "/admin/peminjaman", icon: IoList, label: "Permintaan" },
        {
          path: "/admin/pengembalian",
          icon: IoCheckmarkCircle,
          label: "Pengembalian",
        },
      ],
    },
  ];

  const menuSections =
    user?.role === "admin" ? adminMenuSections : userMenuSections;

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen w-64
          bg-indigo-600 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10">
                <img
                  src={logoSmkn2}
                  alt="Logo SMKN 2"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  SMKN 2 Surabaya
                </h2>
                <p className="text-xs text-white/70">
                  {user?.role === "admin" ? "Admin" : "Dashboard"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Menu Items with Sections */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {/* Section Header */}
                  <h3 className="text-xs font-bold text-white/50 px-4 mb-2 tracking-wider">
                    {section.title}
                  </h3>

                  {/* Section Items */}
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={onClose}
                            className={`
                              flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                              text-sm font-medium transition-all duration-200
                              ${isActive
                                ? "bg-white text-indigo-600 shadow-lg transform scale-105"
                                : "text-white/90 hover:bg-indigo-700 hover:text-white hover:translate-x-1"
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                size={22}
                                className={
                                  isActive ? "text-indigo-600" : "text-white/80"
                                }
                              />
                              <span>{item.label}</span>
                            </div>
                            {item.badge > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center animate-pulse">
                                {item.badge > 9 ? "9+" : item.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Footer Section - User Profile Dropdown */}
          <div className="p-4 border-t border-white/20">
            <div className="relative">
              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20 overflow-hidden">
                    <Link
                      to={
                        user?.role === "admin" ? "/admin/profile" : "/profile"
                      }
                      onClick={() => {
                        setShowUserMenu(false);
                        onClose();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 transition-colors"
                    >
                      <IoPerson size={20} className="text-indigo-600" />
                      <div>
                        <p className="text-sm font-medium">Profile</p>
                        <p className="text-xs text-gray-500">
                          Lihat & edit profile
                        </p>
                      </div>
                    </Link>

                    <div className="border-t border-gray-200 my-1"></div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <IoLogOut size={20} />
                      <div className="text-left">
                        <p className="text-sm font-medium">Logout</p>
                        <p className="text-xs text-red-500">Keluar dari akun</p>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {/* User Profile Button */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full bg-indigo-700 rounded-xl p-3 hover:bg-indigo-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-indigo-600 font-bold text-sm">
                      {user?.nama?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.nama}
                    </p>
                    <p className="text-xs text-white/80">
                      {user?.role === "admin" ? "Administrator" : user?.kelas}
                    </p>
                  </div>
                  <IoChevronUp
                    size={20}
                    className={`text-white/80 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""
                      }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
