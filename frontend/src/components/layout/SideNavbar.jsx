import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoNotifications, IoMenu, IoLogOut, IoPerson } from "react-icons/io5";
import useAuth from "../../hooks/useAuth";
import logoSmkn2 from "../../assets/logo/smkn2sby.png";

const Navbar = ({ toggleSidebar, notifCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg lg:hidden transition-colors"
            >
              <IoMenu size={24} />
            </button>

            <Link
              to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
              className="flex items-center gap-3"
            >
              <img
                src={logoSmkn2}
                alt="Logo SMKN 2 Surabaya"
                className="w-8 h-8 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">
                  {user?.role === "admin"
                    ? "SMK NEGERI 2 SURABAYA"
                    : "Peminjaman Barang"}
                </h1>
              </div>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notifikasi */}
            {user?.role === "user" && (
              <Link
                to="/notifikasi"
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoNotifications size={22} />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center">
                  <IoPerson size={18} className="text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.nama}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === "admin" ? "Admin" : user?.kelas}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <IoPerson size={16} />
                      <span>Profile</span>
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                      <IoLogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
