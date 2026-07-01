import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import RevenueChart from './RevenueChart';
import { supabase } from '../../supabaseClient';

const FinancialReport = () => {
    const [startDate, setStartDate] = useState(moment().subtract(29, 'days').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
    const [reportData, setReportData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            alert('Silakan pilih rentang tanggal terlebih dahulu.');
            return;
        }
        setIsLoading(true);
        setReportData(null);
        setChartData([]);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('status_pembayaran', 'confirmed')
                .gte('tanggal_booking', startDate)
                .lte('tanggal_booking', endDate);

            if (error) throw error;

            // Proses data untuk ringkasan dan tabel
            const totalRevenue = data.reduce((sum, item) => sum + (Number(item.total_price) - Number(item.discount_applied)), 0);
            setReportData({
                summary: { totalRevenue, totalBookings: data.length },
                details: data
            });

            // Proses data untuk grafik
            const dailyRevenue = data.reduce((acc, booking) => {
                const date = moment(booking.tanggal_booking).format('YYYY-MM-DD');
                const revenue = Number(booking.total_price) - Number(booking.discount_applied);
                acc[date] = (acc[date] || 0) + revenue;
                return acc;
            }, {});

            const formattedChartData = Object.keys(dailyRevenue).map(date => ({
                date,
                revenue: dailyRevenue[date]
            }));

            setChartData(formattedChartData);

        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Panggil handleGenerateReport saat komponen pertama kali dimuat
    useEffect(() => {
        handleGenerateReport();
    }, []);

    const handleSetDateRange = (days) => {
        setEndDate(moment().format('YYYY-MM-DD'));
        setStartDate(moment().subtract(days - 1, 'days').format('YYYY-MM-DD'));
    };

    const handleExportCSV = () => {
        if (!reportData || reportData.details.length === 0) {
            alert('Tidak ada data untuk diekspor.');
            return;
        }
        const headers = ['Order ID', 'Nama Pemesan', 'Tanggal Booking', 'Total Harga', 'Diskon'];
        const rows = reportData.details.map(item => 
            [item.order_id, item.nama_pemesan, item.tanggal_booking, item.total_price, item.discount_applied].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `laporan_keuangan_${startDate}_sd_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6">
                <div>
                    <label className={`text-sm ${theme.colors.textSecondary}`}>Dari Tanggal</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`w-full mt-1 p-2 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border}`} />
                </div>
                <div>
                    <label className={`text-sm ${theme.colors.textSecondary}`}>Sampai Tanggal</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`w-full mt-1 p-2 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border}`} />
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => handleSetDateRange(7)} className="text-sm bg-gray-200 px-3 py-2 rounded-md">7 Hari</button>
                    <button onClick={() => handleSetDateRange(30)} className="text-sm bg-gray-200 px-3 py-2 rounded-md">30 Hari</button>
                </div>
                <AnimatedButton onClick={handleGenerateReport} disabled={isLoading} className={`bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:bg-gray-300`}>
                    {isLoading ? 'Memuat...' : 'Terapkan Filter'}
                </AnimatedButton>
                <AnimatedButton onClick={handleExportCSV} disabled={!reportData} className={`bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300`}>
                    Ekspor CSV
                </AnimatedButton>
            </div>
            
            <div className="mb-8">
                <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Grafik Pendapatan Harian</h3>
                {isLoading ? <p>Memuat grafik...</p> : <RevenueChart data={chartData} />}
            </div>

            {reportData && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className={`bg-gray-100 p-4 rounded-lg border ${theme.colors.border}`}>
                            <p className={`${theme.colors.textSecondary}`}>Total Pendapatan</p>
                            <p className={`text-2xl font-bold ${theme.colors.accent}`}>Rp {reportData.summary.totalRevenue.toLocaleString('id-ID')}</p>
                        </div>
                        <div className={`bg-gray-100 p-4 rounded-lg border ${theme.colors.border}`}>
                            <p className={`${theme.colors.textSecondary}`}>Total Booking Lunas</p>
                            <p className={`text-2xl font-bold ${theme.colors.textPrimary}`}>{reportData.summary.totalBookings}</p>
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className={`text-left ${theme.colors.textSecondary} pb-2 font-semibold`}>Order ID</th>
                                    <th className={`text-left ${theme.colors.textSecondary} pb-2 font-semibold`}>Nama</th>
                                    <th className={`text-left ${theme.colors.textSecondary} pb-2 font-semibold`}>Tanggal</th>
                                    <th className={`text-left ${theme.colors.textSecondary} pb-2 font-semibold`}>Harga</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.details.map(item => (
                                    <tr key={item.id} className={`border-b ${theme.colors.border}`}>
                                        <td className={`py-2 ${theme.colors.textMuted}`}>{item.order_id}</td>
                                        <td className={`py-2 ${theme.colors.textPrimary}`}>{item.nama_pemesan}</td>
                                        <td className={`py-2 ${theme.colors.textSecondary}`}>{item.tanggal_booking}</td>
                                        <td className={`py-2 ${theme.colors.accent}`}>{Number(item.total_price).toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialReport;