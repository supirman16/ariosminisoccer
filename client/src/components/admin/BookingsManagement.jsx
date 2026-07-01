import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import BlockScheduleManagement from './BlockScheduleManagement';
import { supabase } from '../../supabaseClient';

const localizer = momentLocalizer(moment);
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>;

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-green-100 text-green-800',
        expired: 'bg-gray-200 text-gray-700',
        cancelled: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${styles[status] || 'bg-gray-200'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const BookingsManagement = ({ bookings, onDataChange }) => {
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState('month');

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const searchMatch = searchTerm === '' || 
                                booking.nama_pemesan.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (booking.order_id && booking.order_id.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const statusMatch = statusFilter === 'Semua' || booking.status_pembayaran === statusFilter;

            return searchMatch && statusMatch;
        });
    }, [bookings, searchTerm, statusFilter]);

    const groupedBookings = useMemo(() => {
        if (filteredBookings.length === 0) return {};
        return filteredBookings.reduce((acc, booking) => {
            const orderId = booking.order_id || `SINGLE-${booking.id}`;
            if (!acc[orderId]) {
                acc[orderId] = {
                    customer: { nama_pemesan: booking.nama_pemesan, nomor_telepon: booking.nomor_telepon },
                    schedules: []
                };
            }
            acc[orderId].schedules.push(booking);
            return acc;
        }, {});
    }, [filteredBookings]);

    const calendarEvents = useMemo(() => {
        return filteredBookings.map(booking => {
            const localDateTimeString = `${booking.tanggal_booking}T${booking.jam_mulai}`;
            const startDate = new Date(localDateTimeString);
            const endDate = new Date(startDate.getTime() + booking.durasi * 60 * 60 * 1000);
            return {
                id: booking.id,
                title: `${booking.nama_pemesan} (${booking.jam_mulai.substring(0,5)})`,
                start: startDate,
                end: endDate,
                resource: booking,
            };
        });
    }, [filteredBookings]);
    
    const handleUpdateStatus = async (bookingId, newStatus) => {
        const { error } = await supabase
            .from('bookings')
            .update({ status_pembayaran: newStatus })
            .eq('id', bookingId);
        
        if (error) alert(error.message);
        else {
            alert('Status berhasil diperbarui.');
        onDataChange();
        if (selectedEvent) setSelectedEvent(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus jadwal ini?')) return;
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) alert(error.message);
        else {
            alert('Booking berhasil dihapus.');
        onDataChange();
        setSelectedEvent(null);
        }
    };

    const handleShowMore = (date) => {
        setCalendarView('day');
        setCalendarDate(date);
    };

    const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div>
            <div className={`${theme.colors.surface} p-4 rounded-lg mb-6 border ${theme.colors.border}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Cari nama atau Order ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full p-2 bg-gray-100 border ${theme.colors.border} rounded-md ${theme.colors.textPrimary}`} />
                    <select onChange={(e) => setStatusFilter(e.target.value)} className={`w-full p-2 bg-gray-100 border ${theme.colors.border} rounded-md ${theme.colors.textPrimary}`}>
                        <option value="Semua">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div className={`flex bg-gray-200 rounded-lg p-1`}>
                        <button onClick={() => setViewMode('list')} className={`w-full px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'list' ? `${theme.colors.primary} ${theme.colors.textOnPrimary}` : `${theme.colors.textSecondary} hover:bg-gray-300`}`}>Daftar</button>
                        <button onClick={() => setViewMode('calendar')} className={`w-full px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'calendar' ? `${theme.colors.primary} ${theme.colors.textOnPrimary}` : `${theme.colors.textSecondary} hover:bg-gray-300`}`}>Kalender</button>
                        <button onClick={() => setViewMode('block')} className={`w-full px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'block' ? `${theme.colors.primary} ${theme.colors.textOnPrimary}` : `${theme.colors.textSecondary} hover:bg-gray-300`}`}>Blokir Jadwal</button>
                    </div>
                </div>
            </div>
            {viewMode === 'list' ? (
                <div className="space-y-6">
                    {Object.keys(groupedBookings).length > 0 ? (
                        Object.entries(groupedBookings).sort(([, a], [, b]) => new Date(b.schedules[0].waktu_pemesanan) - new Date(a.schedules[0].waktu_pemesanan)).map(([orderId, data]) => (
                            <div key={orderId} className={`${theme.colors.surface} ${theme.shadows.medium} rounded-lg overflow-hidden border ${theme.colors.border}`}>
                                <div className={`p-4 bg-gray-50 border-b ${theme.colors.border}`}>
                                    <h2 className={`text-lg font-bold ${theme.colors.textPrimary}`}>Order ID: {orderId}</h2>
                                    <div className={`flex space-x-4 text-sm ${theme.colors.textMuted} mt-1`}>
                                        <span><UserIcon />{data.customer.nama_pemesan}</span>
                                        <span><PhoneIcon />{data.customer.nomor_telepon}</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {data.schedules.map(schedule => (
                                        <div key={schedule.id} className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center hover:bg-gray-50">
                                            <div className="md:col-span-1"><p className={`font-semibold ${theme.colors.textPrimary}`}>{formatDate(schedule.tanggal_booking)}</p><p className={`${theme.colors.textMuted}`}>Jam {schedule.jam_mulai.substring(0,5)} - {schedule.durasi} jam</p></div>
                                            <div className="md:col-span-1 flex justify-center"><StatusBadge status={schedule.status_pembayaran} /></div>
                                            <div className="md:col-span-1 flex justify-end space-x-2">
                                                {schedule.status_pembayaran === 'pending' && <AnimatedButton onClick={() => handleUpdateStatus(schedule.id, 'confirmed')} className="text-sm font-bold py-2 px-4 rounded-full bg-green-500 text-white">Konfirmasi</AnimatedButton>}
                                                {schedule.status_pembayaran === 'confirmed' && <AnimatedButton onClick={() => handleUpdateStatus(schedule.id, 'cancelled')} className="text-sm font-bold py-2 px-4 rounded-full bg-yellow-500 text-black">Batalkan</AnimatedButton>}
                                                <AnimatedButton onClick={() => handleDelete(schedule.id)} className="text-sm font-bold py-2 px-4 rounded-full bg-red-500 text-white">Hapus</AnimatedButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (<div className={`${theme.colors.surface} text-center py-10 rounded-lg border ${theme.colors.border}`}><p className={`${theme.colors.textMuted}`}>Tidak ada data booking yang cocok.</p></div>)}
                </div>
            ) : viewMode === 'calendar' ? (
                <div className={`${theme.colors.surface} p-4 rounded-lg text-black calendar-container border ${theme.colors.border}`}><Calendar localizer={localizer} events={calendarEvents} startAccessor="start" endAccessor="end" style={{ height: '80vh' }} views={['month', 'week', 'day']} onSelectEvent={event => setSelectedEvent(event)} onShowMore={(events, date) => handleShowMore(date)} date={calendarDate} view={calendarView} onView={view => setCalendarView(view)} onNavigate={date => setCalendarDate(date)} /></div>
            ) : (
                <BlockScheduleManagement />
            )}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className={`${theme.colors.surface} rounded-lg shadow-xl p-6 max-w-lg w-full`}>
                        <div className="flex justify-between items-center mb-4"><h2 className={`text-2xl font-bold ${theme.colors.textPrimary}`}>Detail Booking</h2><button onClick={() => setSelectedEvent(null)} className={`${theme.colors.textMuted} hover:text-black`}>&times;</button></div>
                        <div className={`space-y-3 ${theme.colors.textSecondary}`}>
                            <p><strong className={`${theme.colors.textPrimary}`}>Nama:</strong> {selectedEvent.resource.nama_pemesan}</p>
                            <p><strong className={`${theme.colors.textPrimary}`}>Telepon:</strong> {selectedEvent.resource.nomor_telepon}</p>
                            <p><strong className={`${theme.colors.textPrimary}`}>Tanggal:</strong> {formatDate(selectedEvent.resource.tanggal_booking)}</p>
                            <p><strong className={`${theme.colors.textPrimary}`}>Jadwal:</strong> Jam {selectedEvent.resource.jam_mulai.substring(0,5)} ({selectedEvent.resource.durasi} jam)</p>
                            <p className="flex items-center"><strong className={`${theme.colors.textPrimary} mr-2`}>Status:</strong> <StatusBadge status={selectedEvent.resource.status_pembayaran} /></p>
                        </div>
                        <div className={`flex justify-end space-x-4 mt-6 pt-4 border-t ${theme.colors.border}`}>
                            {selectedEvent.resource.status_pembayaran === 'pending' && <AnimatedButton onClick={() => handleUpdateStatus(selectedEvent.resource.id, 'confirmed')} className="bg-green-500 text-white py-2 px-4 rounded-md">Konfirmasi</AnimatedButton>}
                            {selectedEvent.resource.status_pembayaran === 'confirmed' && <AnimatedButton onClick={() => handleUpdateStatus(selectedEvent.resource.id, 'cancelled')} className="bg-yellow-500 text-black py-2 px-4 rounded-md">Batalkan</AnimatedButton>}
                            <AnimatedButton onClick={() => handleDelete(selectedEvent.resource.id)} className="bg-red-600 text-white py-2 px-4 rounded-md">Hapus</AnimatedButton>
                        </div>
                    </div>
                </div>
            )}
            <style>{`.calendar-container .rbc-toolbar { margin-bottom: 1rem; color: #374151; } .calendar-container .rbc-toolbar button { color: #4b5563; border: 1px solid #e5e7eb; } .calendar-container .rbc-toolbar button:hover, .calendar-container .rbc-toolbar button:focus { background-color: #f3f4f6; border-color: #d1d5db; } .calendar-container .rbc-toolbar button.rbc-active { background-color: #facc15; border-color: #facc15; color: black; } .calendar-container .rbc-event { background-color: #059669; border-color: #047857; } .calendar-container .rbc-header { border-bottom: 1px solid #e5e7eb; color: #1f2937; } .calendar-container .rbc-day-bg, .calendar-container .rbc-month-row { border-color: #e5e7eb; } .calendar-container .rbc-today { background-color: #fef3c7; }`}</style>
        </div>
    );
};

export default BookingsManagement;
