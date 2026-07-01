import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { theme } from '../theme';
import AnimatedButton from '../components/AnimatedButton';
import { supabase } from '../supabaseClient';
const ProgressBar = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-white/20 rounded-full h-2.5">
            <motion.div
                className="bg-yellow-400 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
            />
        </div>
    );
};

const ProfilePage = ({ currentUser, startPaymentFlow }) => {
    const [history, setHistory] = useState([]);
    const [loyaltyData, setLoyaltyData] = useState({ currentPoints: 0, history: [] });
    const [membershipInfo, setMembershipInfo] = useState(null);
    const [allTiers, setAllTiers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');

    // State untuk form ubah akun / email / password
    const [showEditModal, setShowEditModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setNewName(currentUser.nama_lengkap || '');
            setNewPhone(currentUser.nomor_telepon || '');
            setNewEmail(currentUser.email || '');
        }
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // --- LOGIKA BARU MENGGUNAKAN SUPABASE ---
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('user_id', currentUser.id);

                const { data: loyaltyData, error: loyaltyError } = await supabase
                    .from('point_history')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('transaction_date', { ascending: false });

                const { data: tiersData, error: tiersError } = await supabase
                    .from('membership_tiers')
                    .select('*');

                if (bookingsError || loyaltyError || tiersError) {
                    throw new Error('Gagal mengambil data profil.');
                }
                
                // Ambil info membership dari profil pengguna
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*, membership_tiers(tier_name, benefits_json)')
                    .eq('id', currentUser.id)
                    .single();
                
                if(profileError) throw profileError;

                setHistory(bookingsData);
                setLoyaltyData({ currentPoints: profileData.points, history: loyaltyData });
                setMembershipInfo({
                    isMember: !!profileData.membership_tier_id,
                    tierName: profileData.membership_tiers?.tier_name,
                    expiryDate: profileData.membership_expiry_date,
                    benefits: profileData.membership_tiers?.benefits_json
                });
                setAllTiers(tiersData);

            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    const tierProgress = useMemo(() => {
        if (!currentUser || allTiers.length === 0) return null;
        const currentTier = allTiers.find(t => t.tier_name === membershipInfo?.tierName);
        const nextTier = allTiers
            .filter(t => t.bookings_required > (currentTier?.bookings_required || 0))
            .sort((a, b) => a.bookings_required - b.bookings_required)[0];
        if (!nextTier) return { isMaxLevel: true };
        const bookingsNeeded = nextTier.bookings_required - currentUser.total_bookings_confirmed;
        return {
            nextTierName: nextTier.tier_name,
            bookingsNeeded: bookingsNeeded,
            currentProgress: currentUser.total_bookings_confirmed,
            goal: nextTier.bookings_required,
            isMaxLevel: false
        };
    }, [currentUser, membershipInfo, allTiers]);

    const { pendingBookings, upcomingBookings, pastBookings } = useMemo(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        return {
            pendingBookings: history.filter(b => b.status_pembayaran === 'pending'),
            upcomingBookings: history.filter(b => b.status_pembayaran === 'confirmed' && new Date(b.tanggal_booking) >= today),
            pastBookings: history.filter(b => new Date(b.tanggal_booking) < today && b.status_pembayaran !== 'pending')
        };
    }, [history]);

    const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            // 1. Update Profile in database
            if (newName !== (currentUser.nama_lengkap || '') || newPhone !== (currentUser.nomor_telepon || '')) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ nama_lengkap: newName, nomor_telepon: newPhone })
                    .eq('id', currentUser.id);
                if (profileError) throw profileError;
            }

            // 2. Update Auth (Email / Password)
            const updateParams = {};
            if (newEmail && newEmail !== currentUser.email) {
                updateParams.email = newEmail;
            }
            if (newPassword) {
                updateParams.password = newPassword;
            }

            if (Object.keys(updateParams).length > 0) {
                const { error: authError } = await supabase.auth.updateUser(updateParams);
                if (authError) throw authError;
                
                if (updateParams.email) {
                    alert('Profil diperbarui! Tautan konfirmasi telah dikirim ke alamat email baru & lama Anda untuk menyetujui perubahan email.');
                } else {
                    alert('Kata sandi berhasil diperbarui!');
                }
            } else {
                alert('Profil berhasil diperbarui!');
            }

            setShowEditModal(false);
            setNewPassword('');
            window.location.reload();
        } catch (err) {
            alert('Gagal memperbarui akun: ' + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="min-h-screen bg-cover bg-center -mt-24" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('/Background Website 2.png')" }}>
                <div className="pt-32 pb-12">
                    <div className="max-w-6xl mx-auto px-4">
                        <h1 className={`text-4xl font-bold text-white mb-2`}>Profil Saya</h1>
                        <p className={`text-lg text-gray-300 mb-8`}>Selamat datang, {currentUser?.nama_lengkap}!</p>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 space-y-6">
                                <div className={`${theme.glass.body} p-6 rounded-lg`}>
                                    <h3 className="text-xl font-semibold text-white mb-4">Detail Akun</h3>
                                    <div className="space-y-2 text-sm">
                                        <p className={`${theme.glass.text}`}><strong>Nama:</strong> {currentUser?.nama_lengkap}</p>
                                        <p className={`${theme.glass.text}`}><strong>Telepon:</strong> {currentUser?.nomor_telepon}</p>
                                        <p className={`${theme.glass.text}`}><strong>Email:</strong> {currentUser?.email || '-'}</p>
                                    </div>
                                    <AnimatedButton
                                        onClick={() => setShowEditModal(true)}
                                        className="mt-4 w-full bg-yellow-400 hover:bg-yellow-350 text-black font-bold py-2 rounded text-xs transition"
                                    >
                                        Ubah Akun & Profil
                                    </AnimatedButton>
                                </div>
                                <div className={`${theme.glass.body} p-6 rounded-lg`}>
                                    <h3 className="text-xl font-semibold text-white mb-4">Status Keanggotaan</h3>
                                    {isLoading ? <p className="text-yellow-400">...</p> : (
                                        <>
                                            <p className={`text-2xl font-bold text-yellow-400 mb-4`}>{membershipInfo?.tierName || 'Regular'}</p>
                                            {tierProgress && !tierProgress.isMaxLevel && (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-gray-300">Progres menuju {tierProgress.nextTierName}:</p>
                                                    <ProgressBar value={tierProgress.currentProgress} max={tierProgress.goal} />
                                                    <p className="text-xs text-gray-400 text-right">{tierProgress.currentProgress} / {tierProgress.goal} Booking</p>
                                                    <p className="text-xs text-center text-yellow-300 pt-2">{tierProgress.bookingsNeeded} booking lagi untuk naik level!</p>
                                                </div>
                                            )}
                                            {tierProgress?.isMaxLevel && <p className="text-sm text-green-400">Anda telah mencapai level tertinggi!</p>}
                                        </>
                                    )}
                                </div>
                                <div className={`${theme.glass.body} p-6 rounded-lg text-center`}>
                                    <p className={`${theme.glass.text} text-sm`}>Total Poin Anda</p>
                                    <p className={`text-4xl font-bold text-yellow-400`}>{isLoading ? '...' : loyaltyData.currentPoints}</p>
                                </div>
                            </div>
                            <div className={`lg:col-span-2 ${theme.glass.body} p-6 rounded-lg`}>
                                {pendingBookings.length > 0 && (
                                    <div className="bg-yellow-400/10 border border-yellow-300 text-yellow-200 p-4 rounded-lg mb-4">
                                        <p className="font-bold">Menunggu Pembayaran</p>
                                        <p className="text-sm">Anda memiliki pesanan yang belum dibayar. Selesaikan sebelum kedaluwarsa.</p>
                                        <AnimatedButton onClick={() => startPaymentFlow(pendingBookings[0].order_id)} className="bg-yellow-400 text-black font-bold py-1 px-3 rounded-md text-sm mt-2">Lanjutkan Pembayaran</AnimatedButton>
                                    </div>
                                )}
                                <div className="flex border-b border-white/10 mb-4">
                                    <button onClick={() => setActiveTab('upcoming')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'upcoming' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}>Jadwal Mendatang</button>
                                    <button onClick={() => setActiveTab('history')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'history' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}>Riwayat Terdahulu</button>
                                    <button onClick={() => setActiveTab('points')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'points' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}>Riwayat Poin</button>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {isLoading ? <p className={`${theme.glass.text}`}>Memuat...</p> : (
                                        <>
                                            {activeTab === 'upcoming' && <BookingHistoryTable title="Jadwal Mendatang" bookings={upcomingBookings} formatDate={formatDate} />}
                                            {activeTab === 'history' && <BookingHistoryTable title="Riwayat Terdahulu" bookings={pastBookings} formatDate={formatDate} />}
                                            {activeTab === 'points' && <PointsHistoryTable history={loyaltyData.history} />}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Edit Akun & Profil */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-xl font-bold text-yellow-400">Ubah Akun & Profil</h3>
                            <button 
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleUpdateAccount} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-sans">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    required
                                    className="w-full p-3 bg-slate-950 rounded-md border border-slate-700 text-sm text-white focus:ring-yellow-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-sans">Nomor Telepon</label>
                                <input
                                    type="text"
                                    value={newPhone}
                                    onChange={e => setNewPhone(e.target.value)}
                                    required
                                    className="w-full p-3 bg-slate-950 rounded-md border border-slate-700 text-sm text-white focus:ring-yellow-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-sans">Email Baru (Kosongkan jika tidak diubah)</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    className="w-full p-3 bg-slate-950 rounded-md border border-slate-700 text-sm text-white focus:ring-yellow-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-sans">Password Baru (Kosongkan jika tidak diubah)</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full p-3 bg-slate-950 rounded-md border border-slate-700 text-sm text-white focus:ring-yellow-400 focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-lg font-bold hover:bg-slate-700 transition text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 bg-yellow-400 text-black py-3 rounded-lg font-black hover:bg-yellow-350 transition text-sm disabled:bg-gray-650"
                                >
                                    {isUpdating ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const BookingHistoryTable = ({ title, bookings, formatDate }) => (
    <div>
        <h2 className={`text-2xl font-semibold text-white mb-4`}>{title}</h2>
        {bookings.length > 0 ? (
            <table className="min-w-full">
                <thead>
                    <tr>
                        <th className={`text-left text-gray-300 pb-2 font-semibold`}>Tanggal</th>
                        <th className={`text-left text-gray-300 pb-2 font-semibold`}>Jam</th>
                        <th className={`text-left text-gray-300 pb-2 font-semibold`}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => (
                        <tr key={booking.id} className="border-b border-white/10">
                            <td className="py-3 text-white">{formatDate(booking.tanggal_booking)}</td>
                            <td className="py-3 text-gray-200">{booking.jam_mulai.substring(0,5)}</td>
                            <td className="py-3">
                                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${booking.status_pembayaran === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {booking.status_pembayaran}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : <p className={`${theme.glass.text}`}>Tidak ada data untuk ditampilkan.</p>}
    </div>
);

const PointsHistoryTable = ({ history }) => (
     <div>
        <h2 className={`text-2xl font-semibold text-white mb-4`}>Riwayat Poin</h2>
        {history.length > 0 ? (
            <table className="min-w-full">
                <thead>
                    <tr>
                        <th className={`text-left text-gray-300 pb-2 font-semibold`}>Tanggal</th>
                        <th className={`text-left text-gray-300 pb-2 font-semibold`}>Deskripsi</th>
                        <th className={`text-right text-gray-300 pb-2 font-semibold`}>Poin</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((item, index) => (
                        <tr key={index} className="border-b border-white/10">
                            <td className="py-3 text-gray-200 text-sm">{new Date(item.transaction_date).toLocaleDateString('id-ID')}</td>
                            <td className="py-3 text-white">{item.description}</td>
                            <td className={`py-3 text-right font-bold ${item.points_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {item.points_change > 0 ? '+' : ''}{item.points_change}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : <p className={`${theme.glass.text}`}>Tidak ada riwayat poin.</p>}
    </div>
);

export default ProfilePage;
