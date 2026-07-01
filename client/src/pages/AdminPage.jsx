import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { theme } from '../theme';
import { supabase } from '../supabaseClient';
import AnimatedButton from '../components/AnimatedButton';

import BookingModal from '../components/admin/BookingModal';
import GalleryManagement from '../components/admin/GalleryManagement';
import ContentManagement from '../components/admin/ContentManagement';
import FacilitiesManagement from '../components/admin/FacilitiesManagement';
import PricingManagement from '../components/admin/PricingManagement';
import MembersManagement from '../components/admin/MembersManagement';

// Ikon-Ikon SVG Premium untuk Sidebar
const StatsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" /></svg>;
const BookingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MedalIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15a4 4 0 100-8 4 4 0 000 8z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" /></svg>;
const PackageIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const GalleryIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const TrophyIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 17c-2.76 0-5-2.24-5-5V7h10v5c0 2.76-2.24 5-5 5zm0 0v4m-4 0h8m-10-8H3V9h3v3zm12-3h3v3h-3V9z" /></svg>;
const ContentIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const FinancialIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

// Komponen Halaman Coming Soon Premium
const ComingSoonPage = ({ title, icon }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm text-black">
            <div className="bg-yellow-100 p-5 rounded-full mb-6 text-yellow-600 animate-pulse flex items-center justify-center">
                {icon}
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-3">{title}</h2>
            <p className="text-slate-500 max-w-md mb-8 leading-relaxed text-sm">
                Fitur pengelolaan <strong>{title}</strong> saat ini dinonaktifkan sementara karena pemesanan lapangan dialihkan langsung secara eksternal ke platform Ayo.co.id. Fitur ini akan tersedia di masa mendatang.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black text-xs font-black rounded-full uppercase tracking-wider shadow-md">
                <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Tahap Pengembangan (Coming Soon)
            </div>
        </div>
    );
};

const AdminPage = ({ setView }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('content'); // Default ke CMS Konten Web yang aktif
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const menuItems = [
        { id: 'stats', label: 'Statistik & Ringkasan', icon: <StatsIcon /> },
        { id: 'bookings', label: 'Kelola Booking', icon: <BookingsIcon /> },
        { id: 'block_schedule', label: 'Blokir Jadwal', icon: <LockIcon /> },
        { id: 'members', label: 'Data Pengguna', icon: <UsersIcon /> },
        { id: 'tiers', label: 'Tier Member', icon: <MedalIcon /> },
        { id: 'pricing', label: 'Pengaturan Harga', icon: <FinancialIcon /> },
        { id: 'facilities', label: 'Kelola Fasilitas', icon: <PackageIcon /> },
        { id: 'gallery', label: 'Galeri Media', icon: <GalleryIcon /> },
        { id: 'tournaments', label: 'Turnamen Online', icon: <TrophyIcon /> },
        { id: 'content', label: 'CMS Konten Web', icon: <ContentIcon /> },
        { id: 'reports', label: 'Laporan Keuangan', icon: <StatsIcon /> },
        { id: 'settings', label: 'Pengaturan Sistem', icon: <SettingsIcon /> }
    ];

    const disabledTabs = [
        'stats',
        'bookings',
        'block_schedule',
        'tiers',
        'tournaments',
        'reports',
        'settings'
    ];

    const getActiveTabTitle = () => {
        const currentItem = menuItems.find(item => item.id === activeTab);
        return currentItem ? currentItem.label : 'Dashboard';
    };

    const handleBookingSuccess = () => {
        setIsBookingModalOpen(false);
    };

    const renderContent = () => {
        if (isLoading) return <div className="text-center py-10 text-gray-500 font-semibold">Memuat data...</div>;

        if (disabledTabs.includes(activeTab)) {
            const currentItem = menuItems.find(item => item.id === activeTab);
            return (
                <ComingSoonPage 
                    title={currentItem?.label || 'Fitur'} 
                    icon={currentItem?.icon || <LockIcon />} 
                />
            );
        }

        switch (activeTab) {
            case 'members':
                return <MembersManagement />;
            case 'facilities':
                return <FacilitiesManagement />;
            case 'pricing':
                return <PricingManagement />;
            case 'gallery':
                return <GalleryManagement />;
            case 'content':
                return <ContentManagement />;
            default:
                return null;
        }
    };

    return (
        <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen bg-slate-900 text-white"
        >
            <BookingModal 
                show={isBookingModalOpen} 
                onClose={() => setIsBookingModalOpen(false)} 
                showNotification={(msg, type) => alert(`${type}: ${msg}`)} 
                onBookingSuccess={handleBookingSuccess} 
            />

            {/* Sidebar Kiri Premium */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 sticky top-0 h-screen z-20">
                {/* Logo & Judul Dashboard */}
                <div className="p-6 border-b border-slate-800 flex items-center space-x-3 bg-slate-950">
                    <img src="/logo.png" alt="Arios Logo" className="h-10" />
                    <div>
                        <span className="font-bold text-lg text-yellow-400 block tracking-wider">ARIOS</span>
                        <span className="text-xs text-slate-500 block">Dashboard Admin</span>
                    </div>
                </div>

                {/* Profil Ringkas Admin */}
                <div className="p-4 border-b border-slate-900 bg-slate-950/40 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-sm shadow-md">
                        AD
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-200">Arios Admin</p>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                            <span className="text-xs text-slate-400 font-medium">Online</span>
                        </div>
                    </div>
                </div>

                {/* Daftar Menu Vertikal */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const isDisabled = disabledTabs.includes(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-bold transition-all relative overflow-hidden ${
                                    isActive
                                        ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10'
                                        : isDisabled
                                        ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/30'
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                                }`}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-black rounded-r"
                                    />
                                )}
                                <span className={isActive ? 'text-black' : isDisabled ? 'text-slate-650' : 'text-slate-500'}>
                                    {item.icon}
                                </span>
                                <span className="truncate">{item.label}</span>
                                {isDisabled && (
                                    <span className="ml-auto text-[9px] bg-slate-800 text-slate-400 py-0.5 px-1.5 rounded-full uppercase scale-90">
                                        Nanti
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Tombol Kembali ke Website */}
                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <button
                        onClick={() => setView('home')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
                    >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Kembali ke Web</span>
                    </button>
                </div>
            </aside>

            {/* Area Konten Utama di Sebelah Kanan */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-x-hidden">
                {/* Header Bar */}
                <header className="h-20 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-8 sticky top-0 z-10 shadow-md">
                    <h2 className="text-2xl font-bold text-white tracking-wide">
                        {getActiveTabTitle()}
                    </h2>
                </header>

                {/* Wadah Utama Konten dengan Latar Terang agar Komponen Kartu Menonjol */}
                <div className="flex-1 p-8 bg-slate-100">
                    <div className="max-w-6xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </motion.div>
    );
};

export default AdminPage;
