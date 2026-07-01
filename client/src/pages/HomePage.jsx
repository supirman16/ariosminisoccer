import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { theme } from '../theme';
import AnimatedButton from '../components/AnimatedButton';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import './HomePage.css';
import { supabase } from '../supabaseClient'; // <-- Impor Supabase client

// Impor file CSS Swiper
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Komponen untuk membungkus setiap bagian dengan animasi saat scroll
const AnimatedSection = ({ children, className = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 60 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Komponen untuk kartu keunggulan
const FeatureCard = ({ icon, title, description }) => (
    <div className="text-center p-6">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-400 text-black mx-auto mb-4">
            {icon}
        </div>
        <h3 className={`text-xl ${theme.typography.headline} mb-2`}>{title}</h3>
        <p className={`${theme.colors.textSecondary}`}>{description}</p>
    </div>
);

// Ikon untuk fasilitas
const GrassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const TribunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const LightingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const ParkingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7h5a3 3 0 010 6H9m0 0h5" /></svg>;
const CafeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 14a6 6 0 0110 0v2a2 2 0 01-2 2H8a2 2 0 01-2-2v-2z M16 8h1a2 2 0 012 2v2a2 2 0 01-2 2h-1" /></svg>;
const BilliardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>;

// Komponen FacilityCard dengan Slider Foto Internal Mini
const FacilityCard = ({ title, description, photos, onImageClick }) => {
    const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
    const mainPhoto = photos && photos.length > 0 ? photos[currentPhotoIdx] : '/Hero Photo.png';
    return (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl flex flex-col justify-between hover:border-yellow-400 transition-all duration-300">
            <div>
                {/* Main Photo with Gallery Nav if multiple photos exist */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900 group">
                    <img 
                        src={mainPhoto} 
                        alt={title} 
                        onClick={() => onImageClick && onImageClick(mainPhoto)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in" 
                    />
                    
                    {photos && photos.length > 1 && (
                        <>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentPhotoIdx(prev => (prev === 0 ? photos.length - 1 : prev - 1));
                                }} 
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition font-bold"
                            >
                                &larr;
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentPhotoIdx(prev => (prev === photos.length - 1 ? 0 : prev + 1));
                                }} 
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition font-bold"
                            >
                                &rarr;
                            </button>
                            
                            {/* Dot indicator */}
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                {photos.map((_, idx) => (
                                    <span key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentPhotoIdx ? 'bg-yellow-400' : 'bg-white/40'}`}></span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-slate-300 text-xs leading-relaxed">{description || 'Tidak ada deskripsi.'}</p>
                </div>
            </div>
        </div>
    );
};

// --- KOMPONEN BARU UNTUK ITEM FAQ ---
const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`border-b ${theme.colors.border}`}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4"
            >
                <span className={`text-lg font-semibold ${theme.colors.textPrimary}`}>{question}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </motion.span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className={`${theme.colors.textSecondary} pb-4`}>{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Komponen untuk ikon bintang (untuk testimoni)
const StarIcon = ({ filled }) => (
    <svg className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
</svg>
);

// Komponen utama HomePage
const HomePage = ({ setView }) => {
    const [facilities, setFacilities] = useState([
        { id: 1, title: 'Rumput Sintetis FIFA', description: 'Bermain lebih aman dan presisi di atas rumput sintetis standar kelas dunia FIFA.', photos: ['/Galeri 1.png'] },
        { id: 2, title: 'Tribun Penonton', description: 'Tribun yang luas dan bersih untuk kenyamanan penonton dan suporter tim Anda.', photos: ['/Galeri 4.png'] },
        { id: 3, title: 'Lampu LED Terang', description: 'Penerangan malam hari merata berkekuatan tinggi, bermain malam serasa siang hari.', photos: ['/Galeri 2.png'] }
    ]);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [galleryTab, setGalleryTab] = useState('foto');
    const [galleryItems, setGalleryItems] = useState([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(true);

    const DEFAULT_PHOTOS = React.useMemo(() => [
        { src: '/Galeri 1.png', alt: 'Sudut Lapangan Utama', title: 'Sudut Lapangan Utama', description: 'Tampilan dekat rumput sintetis standar FIFA kami di area tengah.' },
        { src: '/Galeri 2.png', alt: 'Aksi Pertandingan Malam', title: 'Aksi Pertandingan Malam', description: 'Keseruan kompetisi di bawah lampu penerangan malam hari LED Arios.' },
        { src: '/Galeri 3.png', alt: 'Loker & Ruang Ganti', title: 'Loker & Ruang Ganti', description: 'Fasilitas loker penyimpanan yang aman dan ruang mandi air panas.' },
        { src: '/Galeri 4.png', alt: 'Lobi Penyambutan', title: 'Lobi Penyambutan', description: 'Pintu masuk utama dan lobi resepsionis yang ramah.' }
    ], []);

    const DEFAULT_VIDEOS = React.useMemo(() => [
        { src: 'https://player.vimeo.com/external/435674703.sd.mp4?s=7f5a1cf3673c68b6b19a16f2c3d5e27a9b0c9502&profile_id=165&oauth2_token_id=57447761', title: 'Cuplikan Lapangan Malam', description: 'Tampilan visual malam hari dengan penerangan optimal.' },
        { src: 'https://player.vimeo.com/external/459389137.sd.mp4?s=91ae05cb19e248b1ff25418b76a6cf4ec2cb961a&profile_id=139&oauth2_token_id=57447761', title: 'Gol Indah Turnamen', description: 'Kumpulan gol-gol terbaik yang tercatat di turnamen bulan ini.' }
    ], []);

    useEffect(() => {
        const fetchGallery = async () => {
            const { data, error } = await supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error("Gagal mengambil data galeri:", error);
            } else {
                setGalleryItems(data || []);
            }
            setIsLoadingGallery(false);
        };
        fetchGallery();
    }, []);

    const galleryImages = React.useMemo(() => {
        const photos = galleryItems.filter(item => item.type === 'photo');
        if (photos.length === 0 && !isLoadingGallery) {
            return DEFAULT_PHOTOS;
        }
        return photos.map(item => ({
            src: item.url,
            alt: item.title,
            title: item.title,
            description: item.description
        }));
    }, [galleryItems, isLoadingGallery, DEFAULT_PHOTOS]);

    const galleryVideos = React.useMemo(() => {
        const videos = galleryItems.filter(item => item.type === 'video');
        if (videos.length === 0 && !isLoadingGallery) {
            return DEFAULT_VIDEOS;
        }
        return videos.map(item => ({
            src: item.url,
            title: item.title,
            description: item.description
        }));
    }, [galleryItems, isLoadingGallery, DEFAULT_VIDEOS]);
    
    const [modalImage, setModalImage] = useState(null);
    const testimonials = [
        { id: 1, name: 'Budi Santoso', quote: 'Lapangan terbaik di Jakarta Selatan! Rumputnya sangat terawat dan fasilitasnya lengkap. Pasti akan kembali lagi.', rating: 5 },
        { id: 2, name: 'Ani Wijaya', quote: 'Proses bookingnya sangat mudah dan cepat. Respon admin juga ramah. Sangat direkomendasikan untuk main bareng teman-teman.', rating: 5 },
        { id: 3, name: 'Eko Prasetyo', quote: 'Lokasinya strategis dan mudah dijangkau. Walaupun main malam, penerangan lapangannya sangat bagus dan terang.', rating: 4 },
        { id: 4, name: 'Citra Lestari', quote: 'Tempat yang nyaman untuk bermain dan berkumpul. Selain lapangan, area tunggunya juga bersih dan rapi. Mantap!', rating: 5 },
    ];

    const [webConfig, setWebConfig] = useState({
        whatsapp_link: 'https://wa.me/6281234567890',
        instagram_link: 'https://instagram.com/ariosminisoccer',
        tiktok_link: 'https://tiktok.com/@ariosminisoccer',
        maps_link: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.833552884825!2d106.7961858153439!3d-6.2864351954508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1e6378a6321%3A0x8f5f6d3a365a431!2sF7%20Mini%20Soccer!5e0!3m2!1sen!2sid!4v1662815131541!5m2!1sen!2sid',
        location_image: '',
        location_images_json: []
    });
    const [locationImgIdx, setLocationImgIdx] = useState(0);

    const [promos, setPromos] = useState([
        { badge: 'HAPPY HOUR', title: 'Happy Hour Siang', description: 'Diskon 15% untuk bermain pada hari Senin - Jumat pukul 07.00 - 15.00. Main hemat dengan performa maksimal.' },
        { badge: 'GRATIS FOTO', title: 'Promo Weekend Photographer', description: 'Sewa lapangan minimal 2 jam di akhir pekan (Sabtu & Minggu), gratis jasa fotografer profesional selama 1 jam pertama.' },
        { badge: 'BONUS POIN', title: 'Membership Gold Booster', description: 'Daftar atau upgrade ke akun Member Gold bulan ini dan dapatkan bonus 50 poin langsung tanpa minimum transaksi.' }
    ]);

    const [faqData, setFaqData] = useState([
        { q: 'Bagaimana cara melakukan reschedule?', a: 'Untuk melakukan reschedule, silakan hubungi admin kami melalui WhatsApp minimal 6 jam sebelum jadwal bermain Anda.' },
        { q: 'Apakah tersedia fasilitas parkir?', a: 'Ya, kami memiliki area parkir yang luas dan aman untuk mobil dan motor, gratis untuk semua pelanggan kami.' },
        { q: 'Apakah boleh membawa makanan dan minuman dari luar?', a: 'Anda diperbolehkan membawa minuman, namun untuk makanan berat kami mohon untuk tidak dibawa ke area lapangan. Kami menyediakan kantin dengan berbagai pilihan makanan dan minuman.' },
        { q: 'Berapa jumlah pemain maksimal di lapangan?', a: 'Lapangan kami berstandar 7v7, sehingga idealnya dimainkan oleh total 14 orang. Namun, kami mengizinkan hingga 20 orang berada di area lapangan secara bersamaan.' },
    ]);

    useEffect(() => {
        const fetchWebConfig = async () => {
            const { data, error } = await supabase
                .from('website_config')
                .select('*')
                .eq('id', 1)
                .single();

            if (error) {
                console.error("Gagal mengambil konfigurasi website:", error);
            } else if (data) {
                let imagesArray = [];
                if (data.location_image) {
                    const trimmed = data.location_image.trim();
                    if (trimmed.startsWith('[')) {
                        try {
                            imagesArray = JSON.parse(trimmed);
                        } catch (e) {
                            imagesArray = [data.location_image];
                        }
                    } else {
                        imagesArray = [data.location_image];
                    }
                }
                setWebConfig({
                    whatsapp_link: data.whatsapp_link || 'https://wa.me/6281234567890',
                    instagram_link: data.instagram_link || 'https://instagram.com/ariosminisoccer',
                    tiktok_link: data.tiktok_link || 'https://tiktok.com/@ariosminisoccer',
                    maps_link: data.maps_link || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.833552884825!2d106.7961858153439!3d-6.2864351954508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1e6378a6321%3A0x8f5f6d3a365a431!2sF7%20Mini%20Soccer!5e0!3m2!1sen!2sid!4v1662815131541!5m2!1sen!2sid',
                    location_image: data.location_image || '',
                    location_images_json: imagesArray
                });
                if (data.faq_json && Array.isArray(data.faq_json)) {
                    setFaqData(data.faq_json);
                }
                if (data.promos_json && Array.isArray(data.promos_json)) {
                    setPromos(data.promos_json);
                }
                if (data.facilities_json && Array.isArray(data.facilities_json)) {
                    setFacilities(data.facilities_json);
                }
            }
        };
        fetchWebConfig();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`${theme.colors.background} ${theme.colors.textPrimary}`}
        >
            <style>{` section[id] { scroll-margin-top: 100px; } `}</style>

            <section
                id="beranda"
                className="h-screen -mt-24 pt-24 flex flex-col justify-center items-center text-center text-white bg-cover bg-center bg-fixed"
                style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('/Hero Photo.png')" }}
            >
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <img src="/logo.png" alt="Logo Utama" className="h-32 md:h-40 mx-auto mb-6" />
                    <h1 className={`text-6xl md:text-8xl ${theme.typography.display}`}>
                        <span className="text-yellow-400">PLAY</span> YOUR GAME
                    </h1>
                    <p className="text-lg md:text-xl my-6 max-w-2xl mx-auto text-slate-200">
                        Booking lapangan minisoccer premium kami dengan standar internasional, kapan pun Anda siap.
                    </p>
                    <AnimatedButton
                        onClick={() => setView('booking')}
                        className={`bg-yellow-400 text-black font-bold py-4 px-10 rounded-full text-lg hover:bg-yellow-300`}
                    >
                        Booking Sekarang
                    </AnimatedButton>
                </div>
            </section>

            <section id="fasilitas" className="py-20 bg-slate-900 text-white border-t border-b border-slate-800">
                <AnimatedSection className="container mx-auto max-w-6xl px-6 text-center">
                    <h2 className={`text-4xl md:text-5xl ${theme.typography.display} mb-4 text-white`}>FASILITAS KELAS ATAS</h2>
                    <p className="text-lg text-slate-400 max-w-3xl mx-auto mb-12">
                        Kami menyediakan lebih dari sekadar lapangan. Kami memastikan pengalaman bermain Anda tak terlupakan dengan menghadirkan fasilitas penunjang lengkap berkualitas premium.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        {facilities.map((fac, idx) => (
                            <FacilityCard key={fac.id || idx} title={fac.title} description={fac.description} photos={fac.photos} onImageClick={setModalImage} />
                        ))}
                    </div>
                </AnimatedSection>
            </section>

            <section id="promo" className="py-20 bg-slate-900 text-white">
                <AnimatedSection className="container mx-auto max-w-6xl px-6">
                    <h2 className={`text-4xl md:text-5xl ${theme.typography.display} text-center mb-4`}>PROMO TERBARU</h2>
                    <p className={`text-lg text-slate-300 text-center max-w-3xl mx-auto mb-12`}>
                        Nikmati berbagai penawaran spesial dan potongan harga menarik dari Arios Minisoccer khusus bulan ini.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        {promos.map((promo, idx) => (
                            <div key={idx} className="bg-slate-800 p-8 rounded-lg border border-slate-700 flex flex-col justify-between shadow-lg hover:border-yellow-400 transition-all duration-300 transform hover:-translate-y-2">
                                <div>
                                    <span className="bg-yellow-400 text-black font-extrabold px-3 py-1 rounded-full text-xs inline-block mb-4">{promo.badge}</span>
                                    <h3 className="text-2xl font-bold mb-3 text-white">{promo.title}</h3>
                                    <p className="text-slate-450 mb-6 text-sm">{promo.description}</p>
                                </div>
                                <AnimatedButton onClick={() => setView('booking')} className="bg-yellow-400 text-black font-bold py-2 px-5 rounded-full hover:bg-yellow-300 text-center w-full">Booking Sekarang</AnimatedButton>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>
            </section>

            <section id="galeri" className={`${theme.colors.darkSurface} py-20`}>
                <AnimatedSection className="container mx-auto max-w-6xl px-6">
                    <h2 className={`text-4xl md:text-5xl ${theme.typography.display} text-white text-center mb-6`}>GALERI KAMI</h2>
                    
                    {/* Tab Navigation */}
                    <div className="flex justify-center space-x-4 mb-10">
                        <button
                            onClick={() => setGalleryTab('foto')}
                            className={`py-2 px-6 rounded-full text-sm font-bold transition-all duration-300 ${
                                galleryTab === 'foto'
                                    ? 'bg-yellow-400 text-black'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            Foto Pertandingan
                        </button>
                        <button
                            onClick={() => setGalleryTab('video')}
                            className={`py-2 px-6 rounded-full text-sm font-bold transition-all duration-300 ${
                                galleryTab === 'video'
                                    ? 'bg-yellow-400 text-black'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            Video Pertandingan
                        </button>
                    </div>

                    {galleryTab === 'foto' ? (
                        <div className="masonry-gallery">
                            {galleryImages.map((image, index) => (
                                <div 
                                    key={index} 
                                    className="masonry-item cursor-pointer"
                                    onClick={() => {
                                        setLightboxIndex(index);
                                        setLightboxOpen(true);
                                    }}
                                >
                                    <div className="relative group overflow-hidden rounded-lg border border-white/10 hover:border-yellow-400 transition-all duration-300">
                                        <img src={image.src} alt={image.alt} className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-500" />
                                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 text-left">
                                            <h4 className="text-yellow-400 font-bold text-base translate-y-3 group-hover:translate-y-0 transition duration-300">{image.title}</h4>
                                            <p className="text-white text-xs mt-1 line-clamp-3 translate-y-3 group-hover:translate-y-0 transition duration-300 delay-75">{image.description || 'Tidak ada deskripsi.'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {galleryVideos.map((video, index) => (
                                <div key={index} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-xl flex flex-col justify-between">
                                    <div className="aspect-w-16 aspect-h-9 relative bg-black">
                                        <video
                                            controls
                                            className="w-full h-64 object-cover"
                                            poster="/Hero Photo.png"
                                        >
                                            <source src={video.src} type="video/mp4" />
                                            Browser Anda tidak mendukung tag video.
                                        </video>
                                    </div>
                                    <div className="p-4 bg-slate-850 text-left border-t border-slate-700">
                                        <h4 className="text-yellow-400 font-bold text-lg">{video.title}</h4>
                                        <p className="text-slate-300 text-sm mt-1">{video.description || 'Tidak ada deskripsi.'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </AnimatedSection>
            </section>
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={galleryImages}
                index={lightboxIndex}
            />
            <section id="testimoni" className="py-20 bg-gray-150">
                <AnimatedSection className="container mx-auto max-w-4xl px-6">
                    <h2 className={`text-4xl md:text-5xl ${theme.typography.display} text-center mb-12`}>Kata Mereka Tentang Kami</h2>
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        loop={true}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        pagination={{ el: '.swiper-pagination-testimonial', clickable: true }}
                        className="testimonial_swiper"
                    >
                        {testimonials.map((testimonial) => (
                            <SwiperSlide key={testimonial.id}>
                                <div className={`${theme.colors.surface} p-8 rounded-lg ${theme.shadows.medium}`}>
                                    <div className="flex justify-center mb-4">{[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < testimonial.rating} />)}</div>
                                    <p className={`text-lg italic ${theme.colors.textSecondary} mb-4`}>"{testimonial.quote}"</p>
                                    <p className={`font-bold ${theme.colors.textPrimary} text-xl`}>- {testimonial.name} -</p>
                                </div>
                            </SwiperSlide>
                        ))}
                        <div className="swiper-pagination swiper-pagination-testimonial mt-8 relative"></div>
                    </Swiper>
                </AnimatedSection>
            </section>

            <section id="lokasi" className="py-20 bg-white text-black border-t border-slate-100">
                <AnimatedSection className="container mx-auto max-w-6xl px-6 text-center">
                    <h2 className={`text-4xl md:text-5xl ${theme.typography.display} mb-12`}>LOKASI KAMI</h2>
                    <div className="grid md:grid-cols-2 gap-8 items-stretch text-left">
                        {/* Maps Iframe */}
                        <div className={`aspect-w-16 aspect-h-9 md:aspect-auto md:h-[400px] bg-gray-200 rounded-xl overflow-hidden ${theme.shadows.large} border border-gray-250`}>
                            <iframe 
                                src={webConfig.maps_link} 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0, minHeight: '350px' }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>

                        {/* Location Guide Image */}
                        <div className={`flex flex-col justify-center bg-gray-50 p-6 rounded-xl border border-gray-200 ${theme.shadows.large}`}>
                            {webConfig.location_images_json && webConfig.location_images_json.length > 0 ? (
                                <div className="relative h-[250px] w-full rounded-lg overflow-hidden mb-4 border border-gray-200 bg-gray-250 group">
                                    <img 
                                        src={webConfig.location_images_json[locationImgIdx]} 
                                        alt="Panduan Lokasi Arios" 
                                        onClick={() => setModalImage(webConfig.location_images_json[locationImgIdx])}
                                        className="w-full h-full object-cover hover:scale-105 transition duration-300 cursor-zoom-in" 
                                    />
                                    
                                    {webConfig.location_images_json.length > 1 && (
                                        <>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLocationImgIdx(prev => (prev === 0 ? webConfig.location_images_json.length - 1 : prev - 1));
                                                }}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition font-bold"
                                            >
                                                &larr;
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLocationImgIdx(prev => (prev === webConfig.location_images_json.length - 1 ? 0 : prev + 1));
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition font-bold"
                                            >
                                                &rarr;
                                            </button>
                                            
                                            {/* Dot indicators */}
                                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                                {webConfig.location_images_json.map((_, idx) => (
                                                    <span key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === locationImgIdx ? 'bg-yellow-400' : 'bg-white/40'}`}></span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : webConfig.location_image ? (
                                <div className="h-[250px] w-full rounded-lg overflow-hidden mb-4 border border-gray-200 bg-gray-250">
                                    <img 
                                        src={webConfig.location_image} 
                                        alt="Panduan Lokasi Arios" 
                                        onClick={() => setModalImage(webConfig.location_image)}
                                        className="w-full h-full object-cover hover:scale-105 transition duration-300 cursor-zoom-in" 
                                    />
                                </div>
                            ) : (
                                <div className="h-[250px] w-full rounded-lg bg-gray-100 flex flex-col items-center justify-center mb-4 border border-gray-250 text-gray-400">
                                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                                    </svg>
                                    <p className="text-xs font-semibold">Foto panduan lokasi belum diunggah admin</p>
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-gray-800 mb-1">Arios Minisoccer</h3>
                            <p className="text-gray-550 text-sm leading-relaxed">
                                Temukan kami dengan mudah menggunakan peta navigasi langsung di samping, atau ikuti foto panduan gerbang masuk lapangan kami untuk akses yang lebih cepat.
                            </p>
                        </div>
                    </div>
                </AnimatedSection>
            </section>

            <section id="kontak" className="py-20 bg-slate-800 text-white">
                <AnimatedSection className="container mx-auto max-w-4xl px-6 text-center">
                    <h2 className={`text-4xl md:text-5xl ${theme.typography.display} mb-4 text-white`}>KONTAK KAMI</h2>
                    <p className="text-lg text-slate-350 max-w-2xl mx-auto mb-10">
                        Punya pertanyaan atau ingin menyewa lapangan secara khusus? Hubungi media sosial atau layanan pelanggan kami di bawah ini.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <a 
                            href={webConfig.whatsapp_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-slate-700 p-6 rounded-lg border border-slate-600 hover:border-yellow-400 hover:bg-slate-650 transition duration-300 flex flex-col items-center"
                        >
                            <svg className="w-10 h-10 text-green-400 mb-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.982L2 22l5.202-1.362a9.92 9.92 0 004.81 1.238h.005c5.507 0 9.99-4.478 9.99-9.984A9.97 9.97 0 0012.012 2zm6.347 14.15c-.277.777-1.396 1.427-2.185 1.517-.58.066-1.332.083-2.112-.17a10.15 10.15 0 01-4.789-3.1 9.3 9.3 0 01-1.954-2.883c-.886-1.516-.948-2.61-.263-3.295.27-.27.534-.337.747-.337.156 0 .285.006.39.012.23.012.387.03.523.355.195.462.666 1.62.726 1.743.06.12.09.263.007.426-.083.163-.163.26-.285.405-.12.144-.263.3-.375.403-.12.12-.248.248-.106.493a7.3 7.3 0 001.353 1.685c.677.6 1.25.992 1.9 1.3.2.093.387.086.533-.075.18-.2.788-.915.998-1.23.21-.315.42-.263.705-.157.285.105 1.808.85 2.115.997.308.15.51.225.585.353.075.127.075.734-.202 1.51z"/>
                            </svg>
                            <span className="font-bold">WhatsApp</span>
                            <span className="text-xs text-slate-400 mt-1">Chat Sekarang</span>
                        </a>

                        <a 
                            href={webConfig.instagram_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-slate-700 p-6 rounded-lg border border-slate-600 hover:border-yellow-400 hover:bg-slate-650 transition duration-300 flex flex-col items-center"
                        >
                            <svg className="w-10 h-10 text-pink-400 mb-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01"/>
                            </svg>
                            <span className="font-bold">Instagram</span>
                            <span className="text-xs text-slate-400 mt-1">@ariosminisoccer</span>
                        </a>

                        <a 
                            href={webConfig.tiktok_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-slate-700 p-6 rounded-lg border border-slate-600 hover:border-yellow-400 hover:bg-slate-650 transition duration-300 flex flex-col items-center"
                        >
                            <svg className="w-10 h-10 text-purple-400 mb-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.95-1.72-.1.08-.21.17-.31.25v6.52c-.06 2.3-1.07 4.62-2.92 6.01-1.85 1.4-4.39 1.78-6.62 1.07-2.23-.71-4.04-2.52-4.75-4.75-.71-2.23-.33-4.77 1.07-6.62 1.39-1.85 3.71-2.86 6.01-2.92.23-.01.46 0 .69.01v4.03c-1.12-.06-2.29.35-3.09 1.16-.8.81-1.14 2.05-.88 3.16.26 1.11 1.2 1.99 2.31 2.16 1.11.17 2.33-.29 2.92-1.27.4-.66.57-1.47.55-2.24V0h-.02z"/>
                            </svg>
                            <span className="font-bold">TikTok</span>
                            <span className="text-xs text-slate-400 mt-1">Kunjungi TikTok</span>
                        </a>

                        <a 
                            href={webConfig.maps_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-slate-700 p-6 rounded-lg border border-slate-600 hover:border-yellow-400 hover:bg-slate-650 transition duration-300 flex flex-col items-center"
                        >
                            <svg className="w-10 h-10 text-red-400 mb-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span className="font-bold">Google Maps</span>
                            <span className="text-xs text-slate-400 mt-1">Petunjuk Arah</span>
                        </a>
                    </div>
                </AnimatedSection>
            </section>

            <section id="faq" className="py-20">
                <AnimatedSection className="container mx-auto max-w-3xl px-6">
                    <h2 className={`text-4xl md:text-5xl ${theme.typography.display} text-center mb-12`}>Pertanyaan Umum (FAQ)</h2>
                    <div className="space-y-2">
                        {faqData.map((item, index) => (
                            <FaqItem key={index} question={item.q} answer={item.a} />
                        ))}
                    </div>
                </AnimatedSection>
            </section>

            {modalImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                    onClick={() => setModalImage(null)}
                >
                    <img 
                        src={modalImage} 
                        alt="Zoomed view" 
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                    />
                </div>
            )}

            <section className="py-20">
                <AnimatedSection className="container mx-auto max-w-5xl px-6 text-center">
                    <h2 className={`text-4xl md:text-5xl ${theme.typography.display} mb-4`}>SIAP BERMAIN?</h2>
                    <p className={`text-lg ${theme.colors.textSecondary} max-w-3xl mx-auto mb-8`}>
                        Jangan tunda lagi. Ajak tim Anda dan rasakan pengalaman bermain minisoccer terbaik di kota ini. Slot terbatas setiap harinya!
                    </p>
                    <AnimatedButton
                        onClick={() => setView('booking')}
                        className={`bg-yellow-400 text-black font-bold py-4 px-10 rounded-full text-lg hover:bg-yellow-300`}
                    >
                        Lihat Jadwal & Pesan
                    </AnimatedButton>
                </AnimatedSection>
            </section>
        </motion.div>
    );
};

export default HomePage;
