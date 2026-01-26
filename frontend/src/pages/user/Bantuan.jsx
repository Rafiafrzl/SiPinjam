import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoHelpCircle,
    IoChevronDown,
    IoBook,
    IoTime,
    IoCheckmarkCircle,
    IoAlertCircle,
    IoDocumentText,
    IoArrowForward,
    IoList
} from 'react-icons/io5';
import { Link } from 'react-router-dom';

const Bantuan = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            id: 1,
            question: 'Bagaimana cara meminjam barang?',
            answer: 'Untuk meminjam barang, buka halaman Katalog Barang, pilih barang yang ingin dipinjam, klik tombol "Pinjam", isi form peminjaman dengan lengkap (tanggal pinjam, tanggal kembali, alasan), lalu klik "Ajukan". Peminjaman akan diproses oleh admin.'
        },
        {
            id: 2,
            question: 'Berapa lama proses persetujuan peminjaman?',
            answer: 'Proses persetujuan biasanya memakan waktu 1-2 hari kerja. Anda akan mendapat notifikasi ketika peminjaman disetujui atau ditolak.'
        },
        {
            id: 3,
            question: 'Bagaimana cara mengembalikan barang?',
            answer: 'Buka halaman Pengembalian, pilih barang yang ingin dikembalikan, lalu klik tombol "Ajukan Pengembalian". Serahkan barang ke petugas dan tunggu konfirmasi pengembalian dari admin.'
        },
        {
            id: 4,
            question: 'Apa yang terjadi jika terlambat mengembalikan?',
            answer: 'Keterlambatan pengembalian akan dicatat dalam riwayat peminjaman Anda. Usahakan untuk mengembalikan tepat waktu agar tidak mengganggu peminjam lainnya.'
        },
        {
            id: 5,
            question: 'Bagaimana jika barang rusak saat dipinjam?',
            answer: 'Segera laporkan kerusakan kepada petugas. Jelaskan kondisi kerusakan dan jika diperlukan, Anda mungkin diminta untuk mengganti barang yang rusak.'
        },
        {
            id: 6,
            question: 'Apakah bisa memperpanjang masa pinjam?',
            answer: 'Untuk saat ini, perpanjangan harus dilakukan dengan mengajukan peminjaman baru setelah mengembalikan barang. Pastikan tidak ada antrian peminjam lain untuk barang tersebut.'
        },
        {
            id: 7,
            question: 'Bagaimana cara membatalkan peminjaman?',
            answer: 'Peminjaman dengan status "Menunggu" dapat dibatalkan. Buka halaman Peminjaman Saya, temukan peminjaman yang ingin dibatalkan, dan hubungi admin untuk proses pembatalan.'
        }
    ];

    const guides = [
        {
            icon: IoDocumentText,
            title: 'Ajukan Peminjaman',
            desc: 'Pilih barang dari katalog dan isi form peminjaman',
            color: 'blue'
        },
        {
            icon: IoTime,
            title: 'Tunggu Persetujuan',
            desc: 'Admin akan memproses ',
            color: 'amber'
        },
        {
            icon: IoCheckmarkCircle,
            title: 'Ambil Barang',
            desc: 'Setelah disetujui, ambil barang sesuai jadwal',
            color: 'emerald'
        },
        {
            icon: IoArrowForward,
            title: 'Kembalikan Tepat Waktu',
            desc: 'Kembalikan sebelum atau pada tanggal jatuh tempo',
            color: 'purple'
        }
    ];

    const toggleFaq = (id) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/10 rounded-2xl mb-4 border border-purple-500/20 shadow-lg shadow-purple-500/10">
                    <IoHelpCircle className="text-purple-400" size={32} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Pusat Bantuan</h1>
                <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
                    Temukan jawaban untuk pertanyaan umum tentang sistem peminjaman barang sekolah
                </p>
            </motion.div>

            {/* Quick Guide */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl p-5 sm:p-8 relative overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)" }}
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <IoBook size={100} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                    <IoBook size={24} className="text-purple-200" />
                    Panduan Cepat Peminjaman
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    {guides.map((guide, index) => {
                        const Icon = guide.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all text-center group"
                            >
                                <div className="flex items-center justify-center mb-3">
                                    <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm border border-white/30 group-hover:scale-110 transition-transform">
                                        {index + 1}
                                    </span>
                                </div>
                                <Icon className="mx-auto text-white mb-3" size={32} />
                                <h3 className="font-bold text-white text-sm mb-2">{guide.title}</h3>
                                <p className="text-purple-100 text-xs leading-relaxed">{guide.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            {/* FAQ Section */}
            <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                    <IoAlertCircle className="text-purple-500" size={24} />
                    Pertanyaan yang Sering Diajukan (FAQ)
                </h2>
                <div className="space-y-3">
                    {faqs.map((faq) => (
                        <div
                            key={faq.id}
                            className={`bg-neutral-900 rounded-2xl border transition-all duration-300 ${openFaq === faq.id ? 'border-purple-500 bg-purple-500/5' : 'border-neutral-800 hover:border-neutral-700'
                                }`}
                        >
                            <button
                                onClick={() => toggleFaq(faq.id)}
                                className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                            >
                                <span className={`font-semibold text-sm sm:text-base pr-4 transition-colors ${openFaq === faq.id ? 'text-purple-400' : 'text-gray-200'
                                    }`}>
                                    {faq.question}
                                </span>
                                <motion.div
                                    animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${openFaq === faq.id ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-gray-500'
                                        }`}
                                >
                                    <IoChevronDown size={18} />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {openFaq === faq.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="px-5 pb-5 pt-0">
                                            <div className="h-px bg-neutral-800 mb-4"></div>
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Links */}
            <section className="flex flex-wrap gap-4 pt-4">
                <Link
                    to="/barang"
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-500 transition-all text-sm shadow-lg shadow-purple-600/20 active:scale-95"
                >
                    <IoBook size={20} />
                    Lihat Katalog Barang
                </Link>
                <Link
                    to="/peminjaman"
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-neutral-900 text-gray-200 font-bold rounded-2xl border border-neutral-800 hover:bg-neutral-800 transition-all text-sm active:scale-95"
                >
                    <IoList size={20} />
                    Peminjaman Saya
                </Link>
            </section>
        </div>
    );
};

export default Bantuan;
