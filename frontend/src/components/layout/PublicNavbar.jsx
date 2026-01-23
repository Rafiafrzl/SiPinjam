import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    IoHome,
    IoLibrary,
    IoLogIn,
    IoPersonAdd,
    IoMenu,
    IoClose,
} from "react-icons/io5";
import logoSiPinjam from "../../assets/logo/sipinjam.png";

const PublicNavbar = () => {
    const location = useLocation();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { path: "/welcome", label: "Beranda", icon: IoHome },
        { path: "/katalog", label: "Katalog Barang", icon: IoLibrary },
    ];

    const isActive = (path) => location.pathname === path;
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isAuthPage
                ? "bg-neutral-950/80 backdrop-blur-xl shadow-2xl border-b border-white/5"
                : "bg-transparent"
                }`}
            style={{
                boxShadow: isScrolled || isAuthPage ? "0 4px 30px rgba(124, 58, 237, 0.15)" : "none"
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo with Glow Effect */}
                    <Link to="/welcome" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <img
                                src={logoSiPinjam}
                                alt="Logo SiPinjam"
                                className="w-10 h-10 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">SiPinjam</h1>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-full px-2 py-1 border border-white/10">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive(link.path)
                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                                        : "text-gray-400 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            to="/login"
                            className={`relative flex items-center gap-2 px-5 py-2 font-medium rounded-full transition-all duration-300 text-sm overflow-hidden group ${location.pathname === "/login"
                                ? "text-white hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105"
                                : "text-gray-400 hover:text-white border border-white/20 hover:bg-white/5"
                                }`}
                            style={location.pathname === "/login" ? { background: "linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)" } : {}}
                        >
                            <IoLogIn size={18} className="relative z-10" />
                            <span className="relative z-10">Masuk</span>
                        </Link>
                        <Link
                            to="/register"
                            className={`relative flex items-center gap-2 px-5 py-2 font-medium rounded-full transition-all duration-300 text-sm overflow-hidden group ${location.pathname === "/register"
                                ? "text-white hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105"
                                : "text-gray-400 hover:text-white border border-white/20 hover:bg-white/5"
                                }`}
                            style={location.pathname === "/register" ? { background: "linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)" } : {}}
                        >
                            <IoPersonAdd size={18} className="relative z-10" />
                            <span className="relative z-10">Daftar</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                    >
                        {showMobileMenu ? <IoClose size={24} /> : <IoMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {showMobileMenu && (
                <>
                    <div
                        className="md:hidden fixed inset-0 bg-black/70 z-40"
                        onClick={() => setShowMobileMenu(false)}
                    />

                    <div className="md:hidden fixed top-0 right-0 h-full w-72 bg-neutral-950 border-l border-neutral-800 z-50 flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                            <span className="text-lg font-bold text-white">Menu</span>
                            <button
                                onClick={() => setShowMobileMenu(false)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg"
                            >
                                <IoClose size={24} />
                            </button>
                        </div>

                        <nav className="flex-1 p-4 space-y-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setShowMobileMenu(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive(link.path)
                                            ? "bg-purple-600 text-white"
                                            : "text-gray-400 hover:bg-neutral-800 hover:text-white"
                                            }`}
                                    >
                                        <Icon size={20} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-neutral-800 space-y-2">
                            <Link
                                to="/login"
                                onClick={() => setShowMobileMenu(false)}
                                className={`flex items-center justify-center gap-2 w-full px-4 py-3 font-medium rounded-lg ${location.pathname === "/login"
                                    ? "bg-purple-600 text-white"
                                    : "text-gray-400 border border-neutral-700 hover:bg-neutral-800 hover:text-white"
                                    }`}
                            >
                                <IoLogIn size={20} />
                                Masuk
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setShowMobileMenu(false)}
                                className={`flex items-center justify-center gap-2 w-full px-4 py-3 font-medium rounded-lg ${location.pathname === "/register"
                                    ? "bg-purple-600 text-white"
                                    : "text-gray-400 border border-neutral-700 hover:bg-neutral-800 hover:text-white"
                                    }`}
                            >
                                <IoPersonAdd size={20} />
                                Daftar
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
};

export default PublicNavbar;

