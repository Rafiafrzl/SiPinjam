import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
    IoHome,
    IoLibrary,
    IoLogIn,
    IoPersonAdd,
    IoMenu,
    IoClose,
} from "react-icons/io5";
import logoSiPinjam from "../../assets/logo/sipinjam.png";

const PublicLayout = () => {
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

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all ${isScrolled
                    ? "bg-black/95 backdrop-blur-sm shadow-lg border-b border-neutral-800"
                    : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/welcome" className="flex items-center gap-3">
                            <img
                                src={logoSiPinjam}
                                alt="Logo SiPinjam"
                                className="w-10 h-10 object-contain"
                            />
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-white">SiPinjam</h1>

                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                                            ? "bg-purple-600/20 text-purple-400"
                                            : "text-gray-400 hover:text-white hover:bg-neutral-800"
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
                                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors text-sm"
                            >
                                <IoLogIn size={18} />
                                Masuk
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors text-sm"
                            >
                                <IoPersonAdd size={18} />
                                Daftar
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg"
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
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-gray-400 font-medium rounded-lg border border-neutral-700 hover:bg-neutral-800 hover:text-white"
                                >
                                    <IoLogIn size={20} />
                                    Masuk
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-500"
                                >
                                    <IoPersonAdd size={20} />
                                    Daftar
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-16">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-neutral-950 border-t border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={logoSiPinjam}
                                alt="Logo SiPinjam"
                                className="w-10 h-10 object-contain"
                            />
                            <div>
                                <h3 className="font-bold text-white">SiPinjam</h3>

                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <Link to="/welcome" className="text-gray-500 hover:text-white text-sm">
                                Beranda
                            </Link>
                            <Link to="/katalog" className="text-gray-500 hover:text-white text-sm">
                                Katalog
                            </Link>
                            <Link to="/login" className="text-gray-500 hover:text-white text-sm">
                                Masuk
                            </Link>
                            <Link to="/register" className="text-gray-500 hover:text-white text-sm">
                                Daftar
                            </Link>
                        </div>
                    </div>

                    <div className="border-t border-neutral-800 mt-6 pt-6 text-center">
                        <p className="text-sm text-gray-600">
                            © 2026 SiPinjam
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
