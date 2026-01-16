import { useState } from 'react';
import {
    IoHelpCircle,
    IoChevronDown,
    IoBook,
    IoTime,
    IoCheckmarkCircle,
    IoAlertCircle,
    IoDocumentText,
    IoArrowForward
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
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                    <IoHelpCircle className="text-blue-600" size={32} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Pusat Bantuan</h1>
                <p className="text-gray-500 max-w-lg mx-auto">
                    Temukan jawaban untuk pertanyaan umum tentang sistem peminjaman barang sekolah
                </p>
            </div>

            {/* Quick Guide */}
            <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <IoBook size={24} />
                    Panduan Cepat Peminjaman
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {guides.map((guide, index) => {
                        const Icon = guide.icon;
                        return (
                            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </span>
                                </div>
                                <Icon className="mx-auto text-white mb-2" size={28} />
                                <h3 className="font-semibold text-white text-sm mb-1">{guide.title}</h3>
                                <p className="text-blue-100 text-xs">{guide.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* FAQ Section */}
            <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <IoAlertCircle className="text-blue-600" size={24} />
                    Pertanyaan yang Sering Diajukan (FAQ)
                </h2>
                <div className="space-y-3">
                    {faqs.map((faq) => (
                        <div
                            key={faq.id}
                            className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all hover:border-blue-200"
                        >
                            <button
                                onClick={() => toggleFaq(faq.id)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <span className="font-medium text-gray-800 pr-4">{faq.question}</span>
                                <IoChevronDown
                                    className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === faq.id ? 'rotate-180' : ''
                                        }`}
                                    size={20}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-200 ${openFaq === faq.id ? 'max-h-48' : 'max-h-0'
                                    }`}
                            >
                                <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Links */}
            <section className="flex flex-wrap gap-3">
                <Link
                    to="/barang"
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all text-sm"
                >
                    Lihat Katalog Barang
                </Link>
                <Link
                    to="/peminjaman"
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-blue-300 transition-all text-sm"
                >
                    Peminjaman Saya
                </Link>
            </section>
        </div>
    );
};

export default Bantuan;
