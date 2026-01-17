import { useState, useEffect } from 'react';
import {
  IoStatsChart,
  IoArchive,
  IoPeople,
  IoList,
  IoDownload,
  IoDocumentText,
  IoCalendar
} from 'react-icons/io5';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Statistik = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [peminjaman, setPeminjaman] = useState([]);
  const [periode, setPeriode] = useState('bulanan'); // harian, mingguan, bulanan
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (peminjaman.length > 0) {
      generateChartData();
    }
  }, [peminjaman, periode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, peminjamanRes] = await Promise.all([
        api.get('/statistik/admin'),
        api.get('/peminjaman/admin/all')
      ]);

      setStats(statsRes.data.data || statsRes.data || null);
      setPeminjaman(peminjamanRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    const now = new Date();
    let intervals = [];
    let data = [];

    if (periode === 'harian') {
      // Last 7 days
      intervals = eachDayOfInterval({
        start: subDays(now, 6),
        end: now
      });

      data = intervals.map(date => {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const dayPeminjaman = peminjaman.filter(p => {
          const pDate = new Date(p.createdAt || p.tanggalPinjam);
          return pDate >= dayStart && pDate <= dayEnd;
        });

        return {
          name: format(date, 'dd MMM', { locale: id }),
          total: dayPeminjaman.length,
          disetujui: dayPeminjaman.filter(p => p.status === 'Disetujui' || p.status === 'Selesai').length,
          ditolak: dayPeminjaman.filter(p => p.status === 'Ditolak').length,
          menunggu: dayPeminjaman.filter(p => p.status === 'Menunggu').length
        };
      });
    } else if (periode === 'mingguan') {
      // Last 4 weeks
      intervals = eachWeekOfInterval({
        start: subWeeks(now, 3),
        end: now
      });

      data = intervals.map((weekStart, index) => {
        const weekEnd = index < intervals.length - 1 ? intervals[index + 1] : now;

        const weekPeminjaman = peminjaman.filter(p => {
          const pDate = new Date(p.createdAt || p.tanggalPinjam);
          return pDate >= weekStart && pDate < weekEnd;
        });

        return {
          name: `Minggu ${index + 1}`,
          total: weekPeminjaman.length,
          disetujui: weekPeminjaman.filter(p => p.status === 'Disetujui' || p.status === 'Selesai').length,
          ditolak: weekPeminjaman.filter(p => p.status === 'Ditolak').length,
          menunggu: weekPeminjaman.filter(p => p.status === 'Menunggu').length
        };
      });
    } else {
      // Last 6 months
      intervals = eachMonthOfInterval({
        start: subMonths(now, 5),
        end: now
      });

      data = intervals.map((monthStart, index) => {
        const monthEnd = index < intervals.length - 1 ? intervals[index + 1] : now;

        const monthPeminjaman = peminjaman.filter(p => {
          const pDate = new Date(p.createdAt || p.tanggalPinjam);
          return pDate >= monthStart && pDate < monthEnd;
        });

        return {
          name: format(monthStart, 'MMM yyyy', { locale: id }),
          total: monthPeminjaman.length,
          disetujui: monthPeminjaman.filter(p => p.status === 'Disetujui' || p.status === 'Selesai').length,
          ditolak: monthPeminjaman.filter(p => p.status === 'Ditolak').length,
          menunggu: monthPeminjaman.filter(p => p.status === 'Menunggu').length
        };
      });
    }

    setChartData(data);
  };

  const statusData = [
    { name: 'Menunggu', value: stats?.peminjaman?.menunggu || 0, color: '#F59E0B' },
    { name: 'Disetujui', value: stats?.peminjaman?.disetujui || 0, color: '#10B981' },
    { name: 'Ditolak', value: stats?.peminjaman?.ditolak || 0, color: '#EF4444' },
    { name: 'Selesai', value: stats?.peminjaman?.selesai || 0, color: '#3B82F6' }
  ];


  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Fungsi untuk convert gambar ke base64
      const getBase64FromUrl = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      };

      // Load logo dan convert ke base64
      let logoBase64 = null;
      try {
        // Import logo dari assets
        const logoUrl = new URL('../../assets/logo/smkn2sby.png', import.meta.url).href;
        logoBase64 = await getBase64FromUrl(logoUrl);
      } catch (err) {
        console.log('Logo tidak ditemukan, lanjut tanpa logo');
      }

      // Fungsi untuk menambah header dengan logo
      const addHeader = (doc) => {
        // Tambahkan logo jika berhasil di-load
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', 14, 8, 20, 20);
        }

        // Judul di samping logo
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('LAPORAN STATISTIK', logoBase64 ? 38 : 14, 15);

        doc.setFontSize(12);
        doc.text('Sistem Peminjaman Barang Sekolah', logoBase64 ? 38 : 14, 22);

        // Garis pembatas
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.5);
        doc.line(14, 30, pageWidth - 14, 30);
      };

      // Fungsi untuk menambah footer
      const addFooter = (doc, nomorHalaman, totalHalaman) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Halaman ${nomorHalaman} dari ${totalHalaman}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          'Dokumen ini digenerate otomatis oleh Sistem Peminjaman Barang Sekolah',
          pageWidth / 2,
          pageHeight - 6,
          { align: 'center' }
        );
      };

      // HALAMAN 1
      addHeader(doc);

      // Info periode dan tanggal cetak
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont(undefined, 'normal');
      doc.text(`Periode: ${periode.charAt(0).toUpperCase() + periode.slice(1)}`, 14, 38);
      doc.text(`Dicetak: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })} WIB`, pageWidth - 14, 38, { align: 'right' });

      // Posisi awal konten
      let posisiY = 48;


      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont(undefined, 'bold');
      doc.text('A. RINGKASAN UMUM', 14, posisiY);

      // Tabel ringkasan
      autoTable(doc, {
        startY: posisiY + 4,
        head: [['No', 'Kategori', 'Jumlah', 'Keterangan']],
        body: [
          ['1', 'Total Barang Tersedia', stats?.barang?.total || 0, 'Jumlah seluruh barang dalam sistem'],
          ['2', 'Total User Terdaftar', stats?.user?.total || 0, 'Jumlah user yang terdaftar'],
          ['3', 'Total Peminjaman', stats?.peminjaman?.total || 0, 'Seluruh transaksi peminjaman'],
          ['4', 'Barang Sedang Dipinjam', stats?.aktivitas?.sedangDipinjam || 0, 'Barang yang belum dikembalikan'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 12 }, 2: { cellWidth: 25, halign: 'center' } }
      });

      // Update posisi Y setelah tabel
      let finalY = doc.lastAutoTable?.finalY || posisiY + 40;


      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('B. DISTRIBUSI STATUS PEMINJAMAN', 14, finalY + 12);

      const totalPeminjaman = (stats?.peminjaman?.menunggu || 0) + (stats?.peminjaman?.disetujui || 0) +
        (stats?.peminjaman?.ditolak || 0) + (stats?.peminjaman?.selesai || 0);

      autoTable(doc, {
        startY: finalY + 16,
        head: [['Status', 'Jumlah', 'Persentase']],
        body: [
          ['Menunggu Persetujuan', stats?.peminjaman?.menunggu || 0, totalPeminjaman > 0 ? `${((stats?.peminjaman?.menunggu || 0) / totalPeminjaman * 100).toFixed(1)}%` : '0%'],
          ['Disetujui', stats?.peminjaman?.disetujui || 0, totalPeminjaman > 0 ? `${((stats?.peminjaman?.disetujui || 0) / totalPeminjaman * 100).toFixed(1)}%` : '0%'],
          ['Ditolak', stats?.peminjaman?.ditolak || 0, totalPeminjaman > 0 ? `${((stats?.peminjaman?.ditolak || 0) / totalPeminjaman * 100).toFixed(1)}%` : '0%'],
          ['Selesai', stats?.peminjaman?.selesai || 0, totalPeminjaman > 0 ? `${((stats?.peminjaman?.selesai || 0) / totalPeminjaman * 100).toFixed(1)}%` : '0%'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } }
      });

      finalY = doc.lastAutoTable?.finalY || finalY + 50;


      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('C. STATISTIK BARANG PER KATEGORI', 14, finalY + 12);

      autoTable(doc, {
        startY: finalY + 16,
        head: [['No', 'Kategori', 'Jumlah Barang']],
        body: [
          ['1', 'Elektronik', stats?.barang?.elektronik || 0],
          ['2', 'Olahraga', stats?.barang?.olahraga || 0],
        ],
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 12 }, 2: { halign: 'center' } }
      });

      finalY = doc.lastAutoTable?.finalY || finalY + 30;


      if (chartData.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`D. TREN PEMINJAMAN (${periode.toUpperCase()})`, 14, finalY + 12);

        autoTable(doc, {
          startY: finalY + 16,
          head: [['Periode', 'Total', 'Disetujui', 'Ditolak', 'Menunggu']],
          body: chartData.map(d => [d.name, d.total, d.disetujui, d.ditolak, d.menunggu]),
          theme: 'grid',
          headStyles: { fillColor: [245, 158, 11], fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } }
        });

        finalY = doc.lastAutoTable?.finalY || finalY + 50;
      }

      // Add page numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
      }

      doc.save(`Laporan_Statistik_SiPinjam_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
      toast.success('Laporan PDF berhasil di-export!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Gagal export PDF');
    }
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Ringkasan
      const summaryData = [
        ['Laporan Statistik SiPinjam'],
        [`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`],
        [`Periode: ${periode}`],
        [],
        ['Ringkasan'],
        ['Kategori', 'Jumlah'],
        ['Total Barang', stats?.barang?.total || 0],
        ['Total User', stats?.user?.total || 0],
        ['Total Peminjaman', stats?.peminjaman?.total || 0],
        ['Sedang Dipinjam', stats?.aktivitas?.sedangDipinjam || 0],
        [],
        ['Status Peminjaman'],
        ['Status', 'Jumlah'],
        ['Menunggu', stats?.peminjaman?.menunggu || 0],
        ['Disetujui', stats?.peminjaman?.disetujui || 0],
        ['Ditolak', stats?.peminjaman?.ditolak || 0],
        ['Selesai', stats?.peminjaman?.selesai || 0],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

      // Sheet 2: Tren Data
      if (chartData.length > 0) {
        const trendData = [
          [`Tren Peminjaman (${periode})`],
          ['Periode', 'Total', 'Disetujui', 'Ditolak', 'Menunggu'],
          ...chartData.map(d => [d.name, d.total, d.disetujui, d.ditolak, d.menunggu])
        ];
        const wsTrend = XLSX.utils.aoa_to_sheet(trendData);
        XLSX.utils.book_append_sheet(wb, wsTrend, 'Tren Peminjaman');
      }

      // Sheet 3: Top Barang
      if (stats?.barangPopular?.length > 0) {
        const topData = [
          ['Top 10 Barang Paling Sering Dipinjam'],
          ['No', 'Nama Barang', 'Kategori', 'Total Peminjaman'],
          ...stats.barangPopular.slice(0, 10).map((item, index) => [
            index + 1,
            item._id?.namaBarang || '-',
            item._id?.kategori || '-',
            item.totalPeminjaman
          ])
        ];
        const wsTop = XLSX.utils.aoa_to_sheet(topData);
        XLSX.utils.book_append_sheet(wb, wsTop, 'Top Barang');
      }

      // Sheet 4: Detail Peminjaman
      if (peminjaman.length > 0) {
        const detailData = [
          ['Detail Peminjaman'],
          ['No', 'Nama Barang', 'Peminjam', 'Kelas', 'Jumlah', 'Status', 'Tanggal Pinjam', 'Tanggal Kembali'],
          ...peminjaman.map((p, index) => [
            index + 1,
            p.barangId?.namaBarang || '-',
            p.userId?.nama || '-',
            p.userId?.kelas || '-',
            p.jumlahPinjam,
            p.status,
            format(new Date(p.tanggalPinjam), 'dd/MM/yyyy'),
            format(new Date(p.tanggalKembali), 'dd/MM/yyyy')
          ])
        ];
        const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
        XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Peminjaman');
      }

      XLSX.writeFile(wb, `Laporan_Statistik_SiPinjam_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
      toast.success('Laporan Excel berhasil di-export!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Gagal export Excel');
    }
  };

  if (loading) {
    return <Loading fullScreen text="Memuat statistik..." />;
  }

  return (
    <div className="space-y-4">
      {/* Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Statistik & Laporan</h1>
          <p className="text-gray-600 text-sm mt-1">Ringkasan lengkap aktivitas peminjaman</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={exportToPDF}
            className="flex items-center gap-2"
          >
            <IoDocumentText size={16} />
            Export PDF
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={exportToExcel}
            className="flex items-center gap-2"
          >
            <IoDownload size={16} />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="!bg-blue-600 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Total Barang</p>
              <h3 className="text-xl font-bold mt-1">{stats?.barang?.total || 0}</h3>
            </div>
            <IoArchive size={24} className="text-white" />
          </div>
        </Card>

        <Card className="!bg-purple-600 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">Total User</p>
              <h3 className="text-xl font-bold mt-1">{stats?.user?.total || 0}</h3>
            </div>
            <IoPeople size={24} className="text-white" />
          </div>
        </Card>

        <Card className="!bg-green-600 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Total Peminjaman</p>
              <h3 className="text-xl font-bold mt-1">{stats?.peminjaman?.total || 0}</h3>
            </div>
            <IoList size={24} className="text-white" />
          </div>
        </Card>

        <Card className="!bg-orange-600 text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">Sedang Dipinjam</p>
              <h3 className="text-xl font-bold mt-1">{stats?.aktivitas?.sedangDipinjam || 0}</h3>
            </div>
            <IoStatsChart size={24} className="text-white" />
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line/Bar Chart - Trends */}
        <Card className="lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <IoCalendar className="text-blue-600" />
              Tren Peminjaman
            </h3>
            <div className="flex gap-1">
              {['harian', 'mingguan', 'bulanan'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriode(p)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${periode === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="disetujui" name="Disetujui" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ditolak" name="Ditolak" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="menunggu" name="Menunggu" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart - Status Distribution */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Distribusi Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {statusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Line Chart - Trend Detail */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Grafik Aktivitas ({periode})</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="total" name="Total" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="disetujui" name="Disetujui" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Detail Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-3">
          <Card.Header className="p-3">
            <Card.Title className="text-sm">Statistik Barang per Kategori</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-sm">Elektronik</span>
                <Badge variant="primary" size="sm">{stats?.barang?.elektronik || 0} barang</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-sm">Olahraga</span>
                <Badge variant="success" size="sm">{stats?.barang?.olahraga || 0} barang</Badge>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="p-3">
          <Card.Header className="p-3">
            <Card.Title className="text-sm">Status Peminjaman</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700 text-sm">Menunggu Approval</span>
                <Badge variant="warning" size="sm">{stats?.peminjaman?.menunggu || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700 text-sm">Disetujui</span>
                <Badge variant="success" size="sm">{stats?.peminjaman?.disetujui || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700 text-sm">Ditolak</span>
                <Badge variant="danger" size="sm">{stats?.peminjaman?.ditolak || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700 text-sm">Selesai</span>
                <Badge variant="info" size="sm">{stats?.peminjaman?.selesai || 0}</Badge>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Top Items */}
      <Card className="p-3">
        <Card.Header className="p-3">
          <Card.Title className="text-sm">Top 10 Barang Paling Sering Dipinjam</Card.Title>
        </Card.Header>
        <Card.Content>
          {stats?.barangPopular?.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Belum ada data</p>
          ) : (
            <div className="space-y-1">
              {stats?.barangPopular?.slice(0, 10).map((item, index) => (
                <div key={item._id?._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item._id?.namaBarang}</p>
                      <p className="text-xs text-gray-500">{item._id?.kategori}</p>
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">{item.totalPeminjaman} kali</Badge>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default Statistik;
