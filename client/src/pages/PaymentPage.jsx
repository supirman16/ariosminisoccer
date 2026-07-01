import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { theme } from '../theme';
import AnimatedButton from '../components/AnimatedButton';
import moment from 'moment';
import { supabase } from '../supabaseClient';

const CountdownTimer = ({ expiryTime, onExpire }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiryTime) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            onExpire();
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = [];
    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval] && timerComponents.length === 0) {
             timerComponents.push(<span key="zero">00:00</span>);
             return;
        }
        timerComponents.push(
            <span key={interval}>
                {String(timeLeft[interval]).padStart(2, '0')}
                {interval === 'minutes' ? ':' : ''}
            </span>
        );
    });

    return (
        <div className="text-4xl font-bold text-yellow-400">
            {timerComponents.length ? timerComponents : <span>00:00</span>}
        </div>
    );
};


// Komponen Utama Halaman Pembayaran
const PaymentPage = ({ orderId, setView, onPaymentSuccess }) => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!orderId) {
            setIsLoading(false);
            return;
        }
        const fetchOrderDetails = async () => {
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('order_id', orderId);

                if (error) throw error;
                if (data.length === 0) throw new Error('Pesanan tidak ditemukan.');

                const subtotal = data.reduce((sum, item) => sum + Number(item.total_price), 0);
                const totalDiscount = Number(data[0].discount_applied);
                const grandTotal = subtotal - totalDiscount;

                setOrderDetails({
                    orderId: data[0].order_id,
                    customerName: data[0].nama_pemesan,
                    pendingUntil: data[0].pending_until,
                    schedules: data.map(r => ({
                        id: r.id,
                        date: r.tanggal_booking,
                        time: r.jam_mulai,
                        price: r.total_price
                    })),
                    subtotal,
                    totalDiscount,
                    grandTotal
                });
            } catch (error) {
                console.error(error);
                alert(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);
    
    const handleConfirmPayment = async () => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status_pembayaran: 'confirmed', pending_until: null })
                .eq('order_id', orderId)
                .eq('status_pembayaran', 'pending');

            if (error) throw error;
            
            alert('Pembayaran berhasil dikonfirmasi!');
            onPaymentSuccess();
            setView('profile');
        } catch (error) {
            alert(error.message);
        }
    };

    const formatDate = (dateStr) => moment(dateStr).format('dddd, D MMMM YYYY');

    return (
        <motion.div
            key="payment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="min-h-screen bg-cover bg-center -mt-24" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('/Background Website 2.png')" }}>
                <div className="pt-32 pb-12 flex items-center justify-center">
                    <div className={`${theme.glass.body} p-8 rounded-lg max-w-2xl w-full`}>
                        <h1 className={`text-3xl ${theme.typography.headline} text-white mb-4 text-center`}>Detail Pembayaran</h1>
                        
                        {isLoading ? (
                            <p className="text-center text-gray-300">Memuat detail pesanan...</p>
                        ) : !orderDetails ? (
                            <p className="text-center text-red-400">Pesanan tidak ditemukan atau telah kedaluwarsa.</p>
                        ) : (
                            <div>
                                <div className="text-center mb-6">
                                    {isExpired ? (
                                        <p className="text-red-400 font-bold text-lg">Waktu pembayaran telah habis.</p>
                                    ) : (
                                        <>
                                            <p className="text-gray-300 mb-2">Selesaikan pembayaran dalam:</p>
                                            <CountdownTimer expiryTime={orderDetails.pendingUntil} onExpire={() => setIsExpired(true)} />
                                        </>
                                    )}
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    <h3 className="font-semibold text-white">Rincian Jadwal:</h3>
                                    {orderDetails.schedules.map(schedule => (
                                        <div key={schedule.id} className="bg-white/10 p-3 rounded-md flex justify-between items-center text-sm">
                                            <p className="text-white">{formatDate(schedule.date)} - Jam {schedule.time.substring(0,5)}</p>
                                            <p className="text-gray-200 font-semibold">Rp {Number(schedule.price).toLocaleString('id-ID')}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="space-y-2 text-white border-t border-white/20 pt-4 mt-4">
                                    <div className="flex justify-between text-md"><p className="text-gray-300">Subtotal:</p><p>Rp {orderDetails.subtotal.toLocaleString('id-ID')}</p></div>
                                    {orderDetails.totalDiscount > 0 && (
                                        <div className="flex justify-between text-md text-green-400">
                                            <p>Total Diskon:</p>
                                            <p>- Rp {orderDetails.totalDiscount.toLocaleString('id-ID')}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-2xl">
                                        <p>Total Pembayaran:</p>
                                        <p className="text-yellow-400">Rp {orderDetails.grandTotal.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>

                                <AnimatedButton 
                                    onClick={handleConfirmPayment}
                                    disabled={isExpired}
                                    className={`w-full mt-8 ${theme.colors.primary} ${theme.colors.textOnPrimary} font-bold py-3 rounded-md ${theme.colors.primaryHover} disabled:bg-gray-500 disabled:cursor-not-allowed`}
                                >
                                    {isExpired ? 'Pesanan Kedaluwarsa' : 'Konfirmasi Pembayaran (Manual)'}
                                </AnimatedButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PaymentPage;
