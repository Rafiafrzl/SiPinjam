import { Link, Outlet, useLocation } from "react-router-dom";
import { IoHome, IoLibrary } from "react-icons/io5";
import PublicNavbar from "./PublicNavbar";
import logoSiPinjam from "../../assets/logo/sipinjam.png";

const PublicLayout = () => {
    const location = useLocation();

    const navLinks = [
        { path: "/welcome", label: "Beranda", icon: IoHome },
        { path: "/katalog", label: "Katalog Barang", icon: IoLibrary },
    ];

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <PublicNavbar />

            {/* Main Content */}
            <main className={`flex-1 ${location.pathname === '/welcome' ? '' : 'pt-24 lg:pt-28'}`}>
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
                                    <p className="text-xs text-purple-400">Sistem Peminjaman Barang Sekolah</p>
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
                                <li><Link to="/login" className="text-gray-500 hover:text-white transition-colors">Masuk</Link></li>
                                <li><Link to="/register" className="text-gray-500 hover:text-white transition-colors">Daftar</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/5 bg-black/50 py-6">
                    <div className="max-w-[1600px] mx-auto px-6 text-center">
                        <p className="text-xs text-gray-600">© 2026 SiPinjam. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
