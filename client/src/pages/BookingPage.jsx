import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { theme } from '../theme';
import { supabase } from '../supabaseClient';
import AnimatedButton from '../components/AnimatedButton';

const BookingPage = () => {
    const [priceConfig, setPriceConfig] = useState({
        base_price_day: 600000,
        base_price_night: 800000,
        night_hour_start: 18,
        special_rules: [],
        addon_facilities: []
    });
    const [whatsappLink, setWhatsappLink] = useState('https://wa.me/6281234567890');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data, error } = await supabase
                    .from('website_config')
                    .select('price_config_json, whatsapp_link')
                    .eq('id', 1)
                    .single();

                if (error) {
                    console.error("Gagal memuat konfigurasi harga:", error);
                } else if (data) {
                    if (data.price_config_json) {
                        setPriceConfig(data.price_config_json);
                    }
                    if (data.whatsapp_link) {
                        setWhatsappLink(data.whatsapp_link);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleAyoRedirect = () => {
        window.open('https://ayo.co.id/v/arios-minisoccer', '_blank');
    };

    const handleWhatsappRedirect = () => {
        const message = encodeURIComponent("Halo Arios Minisoccer, saya ingin menanyakan info ketersediaan slot kosong dan booking lapangan.");
        window.open(`${whatsappLink}?text=${message}`, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen py-24 px-6 bg-slate-800 text-white flex flex-col items-center"
        >
            <div className="max-w-4xl w-full text-center space-y-6">
                <h1 className={`text-4xl md:text-6xl font-black ${theme.typography.display} tracking-tight`}>
                    PILIH METODE <span className="text-yellow-400">PEMESANAN</span>
                </h1>
                <p className="text-slate-350 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                    Kami menyediakan dua opsi pemesanan lapangan minisoccer premium kami demi kenyamanan bermain Anda.
                </p>

                {isLoading ? (
                    <div className="py-12 flex justify-center items-center">
                        <svg className="animate-spin h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Choice Cards Container */}
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            {/* Option 1: Ayo.co.id */}
                            <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl flex flex-col justify-between hover:border-yellow-400 transition-all duration-300 shadow-xl group text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-lg">
                                    Instan & Otomatis
                                </div>
                                <div className="space-y-4">
                                    <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black tracking-wide">Pesan Instan via AYO</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Pilih jadwal slot bermain secara instan, lakukan pembayaran otomatis dengan berbagai metode, dan terima konfirmasi pemesanan secara langsung di platform Ayo.co.id.
                                    </p>
                                </div>
                                <AnimatedButton
                                    onClick={handleAyoRedirect}
                                    className="w-full mt-8 bg-yellow-400 text-black font-black py-4 px-6 rounded-xl hover:bg-yellow-300 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition"
                                >
                                    <span>Pesan via AYO.co.id</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </AnimatedButton>
                            </div>

                            {/* Option 2: WhatsApp Manual */}
                            <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl flex flex-col justify-between hover:border-green-400 transition-all duration-300 shadow-xl group text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-lg">
                                    Konsultasi Admin
                                </div>
                                <div className="space-y-4">
                                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black tracking-wide text-green-400">Hubungi via WhatsApp</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Butuh jadwal khusus, transfer manual bank, atau ingin berkonsultasi mengenai sewa turnamen/event korporat? Hubungi staf representative admin kami secara langsung.
                                    </p>
                                </div>
                                <AnimatedButton
                                    onClick={handleWhatsappRedirect}
                                    className="w-full mt-8 bg-green-500 text-white font-black py-4 px-6 rounded-xl hover:bg-green-400 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition shadow-lg shadow-green-500/10"
                                >
                                    <span>Chat Admin WhatsApp</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </AnimatedButton>
                            </div>
                        </div>

                        {/* Pricing Details Section */}
                        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl text-left shadow-xl space-y-6">
                            <div className="border-b border-slate-800 pb-4">
                                <h3 className="text-2xl font-bold tracking-wide text-yellow-400">Rincian Tarif & Harga Lapangan</h3>
                                <p className="text-slate-400 text-xs mt-1">Daftar harga sewa resmi saat ini untuk Lapangan Arios Minisoccer.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Base Rates */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black uppercase text-slate-400 tracking-wider">Tarif Dasar per Jam</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between bg-slate-950 p-4 rounded-xl border border-slate-850">
                                            <div>
                                                <span className="font-bold text-slate-100 block text-sm">Tarif Siang</span>
                                                <span className="text-[10px] text-slate-500">Pukul 07.00 - {String(priceConfig.night_hour_start).padStart(2, '0')}.00</span>
                                            </div>
                                            <span className="text-lg font-black text-yellow-400">Rp {priceConfig.base_price_day ? priceConfig.base_price_day.toLocaleString('id-ID') : '600.000'}</span>
                                        </div>

                                        <div className="flex justify-between bg-slate-950 p-4 rounded-xl border border-slate-850">
                                            <div>
                                                <span className="font-bold text-slate-100 block text-sm">Tarif Malam</span>
                                                <span className="text-[10px] text-slate-500">Pukul {String(priceConfig.night_hour_start).padStart(2, '0')}.00 - 23.00</span>
                                            </div>
                                            <span className="text-lg font-black text-yellow-400">Rp {priceConfig.base_price_night ? priceConfig.base_price_night.toLocaleString('id-ID') : '800.000'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Surcharge & Addons */}
                                <div className="space-y-6">
                                    {/* Surcharge rules */}
                                    {priceConfig.special_rules && priceConfig.special_rules.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-black uppercase text-slate-400 tracking-wider">Biaya Tambahan (Surcharge)</h4>
                                            <div className="space-y-2">
                                                {priceConfig.special_rules.map(rule => (
                                                    <div key={rule.id} className="flex justify-between items-center text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-850 text-slate-300">
                                                        <span>{rule.name}</span>
                                                        <span className="font-bold text-red-400">+ Rp {rule.surcharge.toLocaleString('id-ID')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Addons */}
                                    {priceConfig.addon_facilities && priceConfig.addon_facilities.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-black uppercase text-slate-400 tracking-wider">Tambahan Fasilitas Sewa</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {priceConfig.addon_facilities.map(addon => (
                                                    <div key={addon.id} className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 text-xs">
                                                        <span className="text-slate-400 block font-medium mb-1 truncate">{addon.name}</span>
                                                        <span className="font-bold text-slate-200 block">Rp {addon.price.toLocaleString('id-ID')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default BookingPage;
