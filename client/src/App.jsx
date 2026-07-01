import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import TournamentPage from './pages/TournamentPage';
import { SettingsProvider } from './contexts/SettingsContext';
import { Notification, StyleInjector } from './components/Notification';
import { supabase } from './supabaseClient';

function App() {
    const [view, _setView] = useState('home');
    const setView = (newView) => {
        _setView(newView);
    };
    const [currentUser, setCurrentUser] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [pendingBooking, setPendingBooking] = useState(null);

    // --- LOGIKA BARU UNTUK MENGELOLA SESI SUPABASE ---
    useEffect(() => {
        // 1. Cek sesi yang aktif saat aplikasi dimuat
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchUserProfile(session.user);
            }
        });

        // 2. Dengarkan perubahan status login/logout
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                fetchUserProfile(session.user);
            } else {
                setCurrentUser(null);
            }
        });

        // Hentikan listener saat komponen di-unmount
        return () => subscription.unsubscribe();
    }, []);

    // Fungsi untuk mengambil detail profil dari tabel 'profiles'
    const fetchUserProfile = async (authUser) => {
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id, nama_lengkap, nomor_telepon, role')
            .eq('id', authUser.id)
            .single();

        if (error) {
            console.error("Gagal mengambil profil:", error);
        } else {
            setCurrentUser({
                id: authUser.id,
                email: authUser.email,
                ...profileData
            });
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
    };

    // Fungsi login success sekarang hanya perlu mengarahkan halaman
    const handleLoginSuccess = (user) => {
        if (user.role === 'admin') {
            setView('admin');
        } else {
            setView('booking');
        }
    };

    // Fungsi logout sekarang memanggil Supabase
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setView('home');
    };

    const checkPendingBooking = () => {};
    const startPaymentFlow = (orderId) => {
        setCurrentOrderId(orderId);
        setView('payment');
    };

    const renderView = () => {
        switch (view) {
            case 'booking':
                return <BookingPage key="booking" showNotification={showNotification} currentUser={currentUser} startPaymentFlow={startPaymentFlow} />;
            case 'payment':
                return <PaymentPage key="payment" orderId={currentOrderId} setView={setView} onPaymentSuccess={checkPendingBooking} />;
            case 'profile':
                return currentUser ? <ProfilePage key="profile" currentUser={currentUser} startPaymentFlow={startPaymentFlow} /> : <LoginPage key="login-fallback" onLoginSuccess={handleLoginSuccess} setView={setView} />;
            case 'admin':
                return currentUser?.role === 'admin' ? <AdminPage key="admin" setView={setView} /> : <HomePage key="home-fallback" setView={setView} />;
            case 'login':
                return <LoginPage key="login" onLoginSuccess={handleLoginSuccess} setView={setView} />;
            case 'register':
                return <RegisterPage key="register" setView={setView} showNotification={showNotification} />;
            case 'tournament':
                return <TournamentPage key="tournament" showNotification={showNotification} />;
            case 'home':
            default:
                return <HomePage key="home" setView={setView} />;
        }
    };

    return (
        <SettingsProvider>
            <>
                <StyleInjector />
                {/* --- PERUBAHAN DI SINI --- */}
                {/* Menambahkan style untuk smooth scroll */}
                <style>{`
                    html {
                        scroll-behavior: smooth;
                    }
                `}</style>
                <div className={view === 'admin' ? "min-h-screen bg-slate-900" : "min-h-screen bg-slate-800"}>
                    {view !== 'admin' && (
                        <Header 
                            setView={setView} 
                            currentUser={currentUser}
                            onLogout={handleLogout}
                            currentView={view}
                            pendingBooking={pendingBooking}
                            startPaymentFlow={startPaymentFlow}
                        />
                    )}
                    <Notification 
                        message={notification.message} 
                        type={notification.type}
                        onClose={() => setNotification({ message: '', type: '' })}
                    />
                    <main>
                        <AnimatePresence mode="wait">
                            {renderView()}
                        </AnimatePresence>
                    </main>
                    {!['login', 'register', 'payment', 'admin'].includes(view) && <Footer />}
                </div>
            </>
        </SettingsProvider>
    );
}

export default App;
