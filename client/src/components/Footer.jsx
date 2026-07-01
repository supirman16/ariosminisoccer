import React from 'react';
import { theme } from '../theme';

const Footer = () => {
    return (
        <footer className={`py-12 mt-auto bg-slate-950 text-white border-t border-white/10`}>
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-4"><span className="text-yellow-400">ARIOS</span> MINISOCCER</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Pusat lapangan minisoccer standar FIFA kelas dunia premium di Jakarta Selatan. Rasakan sensasi bermain tak tertandingi siang dan malam.
                    </p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4 text-yellow-400">Navigasi</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><a href="#fasilitas" className="hover:text-white transition">Fasilitas Kelas Atas</a></li>
                        <li><a href="#galeri" className="hover:text-white transition">Galeri Pertandingan</a></li>
                        <li><a href="#promo" className="hover:text-white transition">Promo Terbaru</a></li>
                        <li><a href="#lokasi" className="hover:text-white transition">Lokasi Kami</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4 text-yellow-400">Jam Operasional</h4>
                    <p className="text-slate-400 text-sm mb-2">Setiap Hari: 07.00 - 23.00 WIB</p>
                    <p className="text-slate-400 text-sm">Hubungi CS via WhatsApp</p>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 mt-8 pt-8 border-t border-white/5 text-center text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} Arios Minisoccer. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;