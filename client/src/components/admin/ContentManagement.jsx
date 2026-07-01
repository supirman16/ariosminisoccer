import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import { supabase } from '../../supabaseClient';

const ContentManagement = () => {
    const [config, setConfig] = useState({
        whatsapp_link: '',
        instagram_link: '',
        tiktok_link: '',
        maps_link: '',
        location_image: '',
        location_images_json: []
    });
    const [faqs, setFaqs] = useState([]);
    const [newFaq, setNewFaq] = useState({ q: '', a: '' });
    
    // State Baru untuk Promosi Dinamis
    const [promos, setPromos] = useState([]);
    const [newPromo, setNewPromo] = useState({ badge: '', title: '', description: '' });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingLocation, setIsUploadingLocation] = useState(false);

    const fetchConfig = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('website_config')
                .select('*')
                .eq('id', 1)
                .single();

            if (error) {
                console.error("Gagal memuat konfigurasi web:", error);
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
                setConfig({
                    whatsapp_link: data.whatsapp_link || '',
                    instagram_link: data.instagram_link || '',
                    tiktok_link: data.tiktok_link || '',
                    maps_link: data.maps_link || '',
                    location_image: data.location_image || '',
                    location_images_json: imagesArray
                });
                setFaqs(data.faq_json || []);
                setPromos(data.promos_json || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleChange = (e) => {
        setConfig({ ...config, [e.target.id]: e.target.value });
    };

    const handleLocationImagesUpload = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);
        setIsUploadingLocation(true);
        try {
            const uploadedUrls = [];
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `location_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
                const filePath = `location/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('gallery')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) {
                    console.error("Upload error:", uploadError.message);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('gallery')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            setConfig(prev => ({ 
                ...prev, 
                location_images_json: [...(prev.location_images_json || []), ...uploadedUrls] 
            }));
            alert('Gambar lokasi berhasil diunggah! Ingat untuk menekan tombol "Simpan Seluruh Konten" di bawah.');
        } catch (err) {
            alert('Gagal mengunggah gambar lokasi: ' + err.message);
        } finally {
            setIsUploadingLocation(false);
        }
    };

    const handleDeleteLocationImage = (urlToRemove) => {
        setConfig(prev => ({
            ...prev,
            location_images_json: (prev.location_images_json || []).filter(url => url !== urlToRemove)
        }));
    };

    const handleSaveConfig = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('website_config')
                .update({
                    whatsapp_link: config.whatsapp_link,
                    instagram_link: config.instagram_link,
                    tiktok_link: config.tiktok_link,
                    maps_link: config.maps_link,
                    location_image: JSON.stringify(config.location_images_json || []),
                    faq_json: faqs,
                    promos_json: promos
                })
                .eq('id', 1);

            if (error) throw error;
            alert('Konten website berhasil disimpan!');
            fetchConfig();
        } catch (err) {
            alert('Gagal menyimpan: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Handler FAQ
    const handleAddFaq = (e) => {
        e.preventDefault();
        if (!newFaq.q || !newFaq.a) return;
        setFaqs([...faqs, newFaq]);
        setNewFaq({ q: '', a: '' });
    };

    const handleDeleteFaq = (index) => {
        const updatedFaqs = faqs.filter((_, i) => i !== index);
        setFaqs(updatedFaqs);
    };

    // Handler Promo Dinamis
    const handleAddPromo = (e) => {
        e.preventDefault();
        if (!newPromo.badge || !newPromo.title || !newPromo.description) return;
        setPromos([...promos, newPromo]);
        setNewPromo({ badge: '', title: '', description: '' });
    };

    const handleDeletePromo = (index) => {
        const updatedPromos = promos.filter((_, i) => i !== index);
        setPromos(updatedPromos);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-black">
            {isLoading ? (
                <p className="text-gray-500 text-center col-span-2 py-8">Memuat konfigurasi konten...</p>
            ) : (
                <>
                    {/* LEFT COLUMN: Links, Contacts, and Save Button */}
                    <div className="space-y-6">
                        <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                            <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Link Sosial Media & Kontak</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">WhatsApp Link</label>
                                    <input
                                        id="whatsapp_link"
                                        type="url"
                                        value={config.whatsapp_link}
                                        onChange={handleChange}
                                        placeholder="Cth: https://wa.me/62812345678"
                                        className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm focus:ring-yellow-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Instagram Link</label>
                                    <input
                                        id="instagram_link"
                                        type="url"
                                        value={config.instagram_link}
                                        onChange={handleChange}
                                        placeholder="Cth: https://instagram.com/username"
                                        className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm focus:ring-yellow-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">TikTok Link</label>
                                    <input
                                        id="tiktok_link"
                                        type="url"
                                        value={config.tiktok_link}
                                        onChange={handleChange}
                                        placeholder="Cth: https://tiktok.com/@username"
                                        className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm focus:ring-yellow-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Google Maps Iframe URL</label>
                                    <textarea
                                        id="maps_link"
                                        value={config.maps_link}
                                        onChange={handleChange}
                                        placeholder="Masukkan URL peta google maps (src iframe)"
                                        className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm h-24 focus:ring-yellow-400"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Gambar Panduan Lokasi / Peta Lapangan (Bisa Banyak)</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleLocationImagesUpload}
                                        disabled={isUploadingLocation}
                                        className="w-full p-2.5 bg-gray-100 rounded-md border border-gray-300 text-xs focus:ring-yellow-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500 mb-3"
                                    />
                                    {isUploadingLocation && <p className="text-[10px] text-gray-400 mt-1 mb-2">Mengunggah gambar...</p>}
                                    
                                    {config.location_images_json && config.location_images_json.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {config.location_images_json.map((imgUrl, imgIdx) => (
                                                <div key={imgIdx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-300 group">
                                                    <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleDeleteLocationImage(imgUrl)}
                                                        className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow hover:bg-red-700 transition"
                                                        title="Hapus gambar lokasi"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-gray-400 italic">Belum ada gambar lokasi terunggah.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Save Action Card */}
                        <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium} text-center`}>
                            <h4 className="font-bold text-gray-800 mb-2">Simpan Seluruh Perubahan Konten</h4>
                            <p className="text-xs text-gray-400 mb-4">Pastikan Anda mengklik tombol di bawah ini agar semua perubahan FAQ, Promosi, dan Link Sosmed tersimpan secara permanen ke database.</p>
                            <AnimatedButton
                                onClick={handleSaveConfig}
                                disabled={isSaving}
                                className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                            >
                                {isSaving ? 'Menyimpan Konten...' : 'Simpan Seluruh Konten'}
                            </AnimatedButton>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Promos & FAQ Management */}
                    <div className="space-y-6">
                        {/* Section A: Promos Management */}
                        <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                            <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Kelola Promosi Halaman Utama</h3>
                            
                            <form onSubmit={handleAddPromo} className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Tambah Promo Baru</h4>
                                <div>
                                    <label className="block text-xs text-gray-400 font-semibold mb-0.5">Label Lencana (Badge)</label>
                                    <input
                                        type="text"
                                        placeholder="Cth: HAPPY HOUR, HOT PROMO, DISKON"
                                        value={newPromo.badge}
                                        onChange={e => setNewPromo({ ...newPromo, badge: e.target.value.toUpperCase() })}
                                        required
                                        className="w-full p-2 bg-white rounded-md border border-gray-300 text-xs focus:ring-yellow-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 font-semibold mb-0.5">Judul Promosi</label>
                                    <input
                                        type="text"
                                        placeholder="Cth: Sewa Lapangan Diskon 15%"
                                        value={newPromo.title}
                                        onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                                        required
                                        className="w-full p-2 bg-white rounded-md border border-gray-300 text-xs focus:ring-yellow-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 font-semibold mb-0.5">Deskripsi Promosi</label>
                                    <textarea
                                        placeholder="Cth: Dapatkan potongan harga spesial..."
                                        value={newPromo.description}
                                        onChange={e => setNewPromo({ ...newPromo, description: e.target.value })}
                                        required
                                        className="w-full p-2 bg-white rounded-md border border-gray-300 text-xs h-16 focus:ring-yellow-400"
                                    ></textarea>
                                </div>
                                <AnimatedButton type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-1.5 rounded text-xs">
                                    + Tambahkan ke Daftar Promo
                                </AnimatedButton>
                            </form>

                            {/* Promos List */}
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Daftar Promo Aktif</h4>
                            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
                                {promos.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4 text-xs">Belum ada promosi terdaftar.</p>
                                ) : (
                                    promos.map((p, index) => (
                                        <div key={index} className="bg-gray-100 p-3 rounded-lg border border-gray-300 flex justify-between gap-4 text-xs">
                                            <div>
                                                <span className="bg-yellow-400 text-black font-extrabold px-2 py-0.5 rounded text-[10px] inline-block mb-1">{p.badge}</span>
                                                <p className="font-bold text-gray-800">{p.title}</p>
                                                <p className="text-gray-500 mt-0.5">{p.description}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePromo(index)}
                                                className="text-red-500 hover:text-red-700 font-semibold text-[10px] self-start"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Section B: FAQ Management */}
                        <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                            <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Kelola Pertanyaan FAQ</h3>
                            
                            <form onSubmit={handleAddFaq} className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Tambah FAQ Baru</h4>
                                <div>
                                    <label className="block text-xs text-gray-400 font-semibold mb-0.5">Pertanyaan</label>
                                    <input
                                        type="text"
                                        placeholder="Cth: Apakah ada toilet?"
                                        value={newFaq.q}
                                        onChange={e => setNewFaq({ ...newFaq, q: e.target.value })}
                                        required
                                        className="w-full p-2 bg-white rounded-md border border-gray-300 text-xs focus:ring-yellow-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 font-semibold mb-0.5">Jawaban</label>
                                    <textarea
                                        placeholder="Cth: Ya, kami menyediakan toilet bersih di area bilas..."
                                        value={newFaq.a}
                                        onChange={e => setNewFaq({ ...newFaq, a: e.target.value })}
                                        required
                                        className="w-full p-2 bg-white rounded-md border border-gray-300 text-xs h-16 focus:ring-yellow-400"
                                    ></textarea>
                                </div>
                                <AnimatedButton type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-1.5 rounded text-xs">
                                    + Tambahkan ke Daftar FAQ
                                </AnimatedButton>
                            </form>

                            {/* FAQ List */}
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Daftar FAQ Aktif</h4>
                            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
                                {faqs.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4 text-xs">Belum ada FAQ terdaftar.</p>
                                ) : (
                                    faqs.map((faq, index) => (
                                        <div key={index} className="bg-gray-100 p-3 rounded-lg border border-gray-300 flex justify-between gap-4 text-xs">
                                            <div>
                                                <p className="font-bold text-gray-800">Q: {faq.q}</p>
                                                <p className="text-gray-600 mt-0.5">A: {faq.a}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteFaq(index)}
                                                className="text-red-500 hover:text-red-700 font-semibold text-[10px] self-start"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContentManagement;
