import React, { useState, useEffect } from 'react';

const BookingModal = ({ show, onClose, showNotification, onBookingSuccess }) => {
    const [cart, setCart] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({ nama_pemesan: '', nomor_telepon: '' });
    const [currentSelection, setCurrentSelection] = useState({ date: '', time: '', duration: '1' });
    const [bookedSlots, setBookedSlots] = useState([]);
    const [isSlotsLoading, setIsSlotsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentSelection.date) {
            setIsSlotsLoading(true);
            fetch(`http://localhost:5000/api/schedules/booked?date=${currentSelection.date}`)
                .then(res => res.json())
                .then(data => setBookedSlots(data))
                .catch(() => showNotification('Gagal memuat jadwal.', 'error'))
                .finally(() => setIsSlotsLoading(false));
        }
    }, [currentSelection.date]);

    const handleAddToCart = () => {
        if (!currentSelection.date || !currentSelection.time) {
            showNotification('Silakan pilih tanggal dan jam.', 'error');
            return;
        }
        const isDuplicate = cart.some(item => item.date === currentSelection.date && item.time === currentSelection.time);
        if (isDuplicate) {
            showNotification('Jadwal ini sudah ada di keranjang.', 'error');
            return;
        }
        setCart([...cart, { ...currentSelection, id: Date.now() }]);
    };

    const handleRemoveFromCart = (id) => setCart(cart.filter(item => item.id !== id));

    const handleSubmit = async () => {
        if (cart.length === 0 || !customerInfo.nama_pemesan || !customerInfo.nomor_telepon) {
            showNotification('Harap isi semua data dan tambahkan minimal satu jadwal.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer: customerInfo, schedules: cart }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            showNotification(result.message, 'success');
            onBookingSuccess();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const allTimeSlots = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00:00`);
    const formatDate = (dateStr) => new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Input Booking Manual</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Nama Pemesan" value={customerInfo.nama_pemesan} onChange={e => setCustomerInfo({...customerInfo, nama_pemesan: e.target.value})} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white" />
                        <input type="tel" placeholder="Nomor Telepon" value={customerInfo.nomor_telepon} onChange={e => setCustomerInfo({...customerInfo, nomor_telepon: e.target.value})} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Pilih Tanggal</label>
                            <input 
                                type="date" 
                                value={currentSelection.date} 
                                onChange={e => setCurrentSelection({...currentSelection, date: e.target.value, time: ''})} 
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white select-custom" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Pilih Jam</label>
                            <select 
                                value={currentSelection.time} 
                                onChange={e => setCurrentSelection({...currentSelection, time: e.target.value})} 
                                disabled={!currentSelection.date || isSlotsLoading} 
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white select-custom"
                            >
                                <option value="" disabled className="bg-gray-800 text-white">{isSlotsLoading ? 'Memuat...' : 'Pilih Jam'}</option>
                                {allTimeSlots.map(slot => {
                                    const isBooked = bookedSlots.includes(slot);
                                    return (
                                        <option 
                                            key={slot} 
                                            value={slot} 
                                            disabled={isBooked} 
                                            className="bg-gray-800 text-white disabled:text-gray-500"
                                        >
                                            {slot.substring(0, 5)} {isBooked ? '(Dipesan)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <button onClick={handleAddToCart} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-md hover:bg-indigo-700 transition">Tambah Jadwal</button>
                    </div>
                    <style>{`
                        .select-custom::-webkit-calendar-picker-indicator {
                            filter: invert(1);
                            cursor: pointer;
                        }
                        .select-custom {
                            color-scheme: dark !important;
                            color: white !important;
                        }
                        .select-custom option {
                            background-color: #1f2937 !important;
                            color: white !important;
                        }
                    `}</style>
                    <div className="bg-gray-900 p-3 rounded-md max-h-40 overflow-y-auto space-y-2">
                        {cart.length > 0 ? cart.map(item => (
                            <div key={item.id} className="bg-gray-700 p-2 rounded flex justify-between items-center text-sm">
                                <p className="text-white">{formatDate(item.date)} - Jam {item.time.substring(0,5)}</p>
                                <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-400 hover:text-red-500">Hapus</button>
                            </div>
                        )) : <p className="text-gray-500 text-center">Keranjang kosong</p>}
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-700">
                    <button onClick={onClose} className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">Batal</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-500">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Booking'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
