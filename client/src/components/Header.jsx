import React, { useState } from 'react';
import { theme } from '../theme';
import AnimatedButton from './AnimatedButton';
import { supabase } from '../supabaseClient';

const Header = ({ setView, currentUser, onLogout, currentView, pendingBooking, startPaymentFlow }) => {
    const isHomePage = currentView === 'home';
    const hasFullScreenBg = ['login', 'register', 'booking', 'profile', 'payment'].includes(currentView);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setView('home');
    };

    const handleContinuePayment = () => {
        if (pendingBooking && pendingBooking.order_id) {
            startPaymentFlow(pendingBooking.order_id);
        }
    };

    const headerClasses = isHomePage || hasFullScreenBg
        ? `sticky top-0 z-20 bg-black/30 backdrop-blur-lg border-b border-white/10 text-white`
        : `sticky top-0 z-20 ${theme.colors.surface} ${theme.shadows.medium} text-black`;

    return (
        <>
            {pendingBooking && (
                <div className="bg-yellow-400 text-black text-center p-2 text-sm font-semibold sticky top-0 z-30">
                    Anda memiliki pesanan yang menunggu pembayaran. 
                    <button onClick={handleContinuePayment} className="underline ml-2 hover:text-gray-700">
                        Lanjutkan Pembayaran
                    </button>
                </div>
            )}
            <header className={headerClasses}>
                <div className="container mx-auto max-w-6xl px-6 flex justify-between items-center py-3">
                    <div onClick={() => setView('home')} className="cursor-pointer flex items-center space-x-3">
                        <img src="/logo.png" alt="Logo Minisoccer" className="h-16" />
                        <span className={`text-2xl font-bold ${isHomePage || hasFullScreenBg ? 'text-white' : 'text-black'}`}>
                            <span className="text-yellow-400">Arios</span> Minisoccer
                        </span>
                    </div>
                    
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                        {isHomePage ? (
                            <>
                                <a href="#fasilitas" className="transition hover:text-yellow-400">Fasilitas</a>
                                <a href="#galeri" className="transition hover:text-yellow-400">Galeri</a>
                                <a href="#lokasi" className="transition hover:text-yellow-400">Lokasi</a>
                            </>
                        ) : (
                        <button onClick={() => setView('home')} className={`transition ${isHomePage || hasFullScreenBg ? 'hover:text-yellow-400' : 'hover:text-yellow-600'}`}>Beranda</button>
                        )}
                        <button onClick={() => setView('booking')} className={`transition ${isHomePage || hasFullScreenBg ? 'hover:text-yellow-400' : 'hover:text-yellow-600'}`}>Booking</button>
                        <button onClick={() => setView('tournament')} className={`transition ${isHomePage || hasFullScreenBg ? 'hover:text-yellow-400' : 'hover:text-yellow-600'}`}>Turnamen</button>
                        
                        {currentUser ? (
                            <>
                                {currentUser.role === 'admin' && (
                                    <button onClick={() => setView('admin')} className={`transition ${isHomePage || hasFullScreenBg ? 'hover:text-yellow-400' : 'hover:text-yellow-600'}`}>Admin</button>
                                )}
                                <button onClick={() => setView('profile')} className={`transition ${isHomePage || hasFullScreenBg ? 'hover:text-yellow-400' : 'hover:text-yellow-600'}`}>Profil Saya</button>
                                <span className={isHomePage || hasFullScreenBg ? 'text-gray-500' : 'text-gray-300'}>|</span>
                                <span className={`font-semibold`}>{currentUser.nama_lengkap}</span>
                                <AnimatedButton onClick={handleLogout} className="bg-red-600 text-white text-sm font-bold py-2 px-5 rounded-full hover:bg-red-700">Logout</AnimatedButton>
                            </>
                        ) : (
                            <>
                                <AnimatedButton onClick={() => setView('login')} className={`${isHomePage || hasFullScreenBg ? 'bg-white/10 backdrop-blur-sm hover:bg-white/20' : 'bg-gray-800 hover:bg-gray-700'} text-white text-sm font-bold py-2 px-5 rounded-full`}>Login</AnimatedButton>
                                <AnimatedButton onClick={() => setView('register')} className={`${theme.colors.primary} ${theme.colors.textOnPrimary} text-sm font-bold py-2 px-5 rounded-full ${theme.colors.primaryHover}`}>Daftar</AnimatedButton>
                            </>
                        )}
                    </nav>

                    {/* Hamburger Button for Mobile Screen */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-current focus:outline-none transition-colors duration-200"
                        aria-label="Toggle Menu"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Menu Drawer Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-950/95 border-b border-white/10 text-white px-6 py-5 flex flex-col gap-4 text-sm font-semibold sticky top-[80px] z-30 shadow-2xl backdrop-blur-md">
                    {isHomePage ? (
                        <>
                            <a href="#fasilitas" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-white/5 transition hover:text-yellow-400">Fasilitas</a>
                            <a href="#galeri" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-white/5 transition hover:text-yellow-400">Galeri</a>
                            <a href="#lokasi" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 border-b border-white/5 transition hover:text-yellow-400">Lokasi</a>
                        </>
                    ) : (
                        <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="text-left py-2.5 border-b border-white/5 transition hover:text-yellow-400">Beranda</button>
                    )}
                    <button onClick={() => { setView('booking'); setIsMobileMenuOpen(false); }} className="text-left py-2.5 border-b border-white/5 transition hover:text-yellow-400">Booking</button>
                    <button onClick={() => { setView('tournament'); setIsMobileMenuOpen(false); }} className="text-left py-2.5 border-b border-white/5 transition hover:text-yellow-400">Turnamen</button>
                    
                    {currentUser ? (
                        <>
                            {currentUser.role === 'admin' && (
                                <button onClick={() => { setView('admin'); setIsMobileMenuOpen(false); }} className="text-left py-2.5 border-b border-white/5 text-yellow-400 transition hover:text-yellow-300">Panel Admin</button>
                            )}
                            <button onClick={() => { setView('profile'); setIsMobileMenuOpen(false); }} className="text-left py-2.5 border-b border-white/5 transition hover:text-yellow-400">Profil Saya ({currentUser.nama_lengkap})</button>
                            <AnimatedButton onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="bg-red-650 text-white text-sm font-bold py-2.5 w-full rounded-full hover:bg-red-700 mt-2">Logout</AnimatedButton>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 pt-2">
                            <AnimatedButton onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="bg-white/10 text-white text-sm font-bold py-2.5 rounded-full w-full border border-white/10">Login</AnimatedButton>
                            <AnimatedButton onClick={() => { setView('register'); setIsMobileMenuOpen(false); }} className={`${theme.colors.primary} ${theme.colors.textOnPrimary} text-sm font-bold py-2.5 rounded-full w-full`}>Daftar</AnimatedButton>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default Header;
