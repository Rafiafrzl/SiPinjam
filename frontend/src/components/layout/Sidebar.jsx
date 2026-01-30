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
import logoSiPinjam from "../../assets/logo/sipinjam.png";
import api from "../../utils/api";

const Sidebar = ({ isOpen, onClose, onOpenNotif }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user?.role === "user") {
      const handleNotifUpdate = () => {
        fetchNotifCount();
      };
      window.addEventListener('notificationUpdated', handleNotifUpdate);

      return () => {
        window.removeEventListener('notificationUpdated', handleNotifUpdate);
      };
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
        { path: "/beranda", icon: IoHome, label: "Beranda" },
        { path: "/barang", icon: IoLibrary, label: "Daftar Barang" },
      ],
    },
    {
      title: "AKTIVITAS",
      items: [
        { path: "/peminjaman", icon: IoList, label: "Peminjaman Saya" },
        {
          path: "/pengembalian",
          icon: IoCheckmarkCircle,
          label: "Pengembalian",
        },
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
        { path: "/admin/riwayat", icon: IoTime, label: "Riwayat" },
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
          fixed lg:sticky top-0 left-0 z-40 h-screen w-72
          bg-[#0f172a] border-r border-slate-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 flex items-center justify-center ">
                  <img
                    src={logoSiPinjam}
                    alt="Logo"
                    className="w-9 h-9 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">SiPinjam</h2>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">
                    Sistem Peminjaman Barang Sekolah
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden text-slate-500 hover:text-white transition-colors"
              >
                <IoClose size={24} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
            <div className="space-y-8">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-600 px-4 tracking-[0.2em] uppercase">
                    {section.title}
                  </h3>

                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <li key={item.path}>
                          {item.path === "/notifikasi" || item.path === "/admin/notifikasi" ? (
                            <button
                              onClick={() => {
                                onOpenNotif();
                                onClose();
                              }}
                              className={`
                                w-full flex items-center justify-between px-4 py-3 rounded-xl
                                text-sm font-semibold transition-all duration-200
                                ${isActive
                                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                                }
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <Icon
                                  size={18}
                                  className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}
                                />
                                <span>{item.label}</span>
                              </div>
                              {item.badge > 0 && (
                                <span className={`
                                  text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center
                                  ${isActive ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"}
                                `}>
                                  {item.badge > 9 ? "9+" : item.badge}
                                </span>
                              )}
                            </button>
                          ) : (
                            <Link
                              to={item.path}
                              onClick={onClose}
                              className={`
                                flex items-center justify-between px-4 py-3 rounded-xl
                                text-sm font-semibold transition-all duration-200
                                ${isActive
                                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                                  : "text-slate-400 hover:bg-purple-800/50 hover:text-slate-100"
                                }
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <Icon
                                  size={18}
                                  className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}
                                />
                                <span>{item.label}</span>
                              </div>
                              {item.badge > 0 && (
                                <span className={`
                                  text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center
                                  ${isActive ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"}
                                `}>
                                  {item.badge > 9 ? "9+" : item.badge}
                                </span>
                              )}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-slate-800 bg-slate-900/30">
            <div className="relative">
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute bottom-full left-0 right-0 mb-4 bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 p-2 z-20 overflow-hidden ring-1 ring-white/5">
                    <Link
                      to={user?.role === "admin" ? "/admin/profile" : "/profile"}
                      onClick={() => { setShowUserMenu(false); onClose(); }}
                      className="flex items-center gap-3 p-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all"
                    >
                      <IoPerson size={18} className="text-indigo-400" />
                      <div>
                        <p className="text-xs font-bold">Profilku</p>
                        <p className="text-[10px] text-slate-500">Profile & Settings</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 p-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all mt-1"
                    >
                      <IoLogOut size={18} />
                      <p className="text-xs font-bold">Logout</p>
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full bg-slate-800/40 rounded-2xl p-3 hover:bg-slate-800/60 transition-all border border-slate-700/50 flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20 group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-sm">
                    {user?.nama?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.nama}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{user?.role}</p>
                </div>
                <IoChevronUp
                  size={16}
                  className={`text-slate-600 transition-transform duration-300 ${showUserMenu ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
