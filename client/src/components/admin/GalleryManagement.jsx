import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import { supabase } from '../../supabaseClient';

const GalleryManagement = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newItem, setNewItem] = useState({ type: 'photo', title: '', description: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [filterType, setFilterType] = useState('all');

    const fetchGallery = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching gallery:", error);
        } else {
            setGalleryItems(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.title || !selectedFile) {
            alert('Judul dan berkas media wajib diisi/dipilih.');
            return;
        }

        setIsUploading(true);

        try {
            // 1. Buat nama file unik
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `${newItem.type}/${fileName}`; // folder photo/ atau video/ dalam bucket

            // 2. Unggah file ke Supabase Storage (Bucket: gallery)
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                throw new Error("Gagal mengunggah berkas ke Storage: " + uploadError.message);
            }

            // 3. Dapatkan URL publik dari berkas yang diunggah
            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(filePath);

            // 4. Masukkan baris baru ke tabel gallery database
            const { error: dbError } = await supabase.from('gallery').insert([
                {
                    type: newItem.type,
                    title: newItem.title,
                    description: newItem.description,
                    url: publicUrl
                }
            ]);

            if (dbError) {
                // Rollback: Hapus file dari storage jika simpan DB gagal
                await supabase.storage.from('gallery').remove([filePath]);
                throw new Error("Gagal menyimpan data ke database: " + dbError.message);
            }

            alert(`Media "${newItem.title}" berhasil diunggah!`);
            setNewItem({ type: 'photo', title: '', description: '' });
            setSelectedFile(null);
            
            // Reset input file di DOM
            const fileInput = document.getElementById('mediaFile');
            if (fileInput) fileInput.value = '';

            fetchGallery();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteItem = async (id, title, url) => {
        if (!window.confirm(`Yakin ingin menghapus "${title}" dari galeri?`)) return;

        try {
            // 1. Dapatkan path file storage dari URL publik
            // Format URL: .../storage/v1/object/public/gallery/photo/filename.png
            let storagePath = null;
            if (url && url.includes('/public/gallery/')) {
                storagePath = url.split('/public/gallery/')[1];
            }

            // 2. Hapus dari database terlebih dahulu
            const { error: dbError } = await supabase
                .from('gallery')
                .delete()
                .eq('id', id);

            if (dbError) {
                throw new Error("Gagal menghapus data dari database: " + dbError.message);
            }

            // 3. Hapus berkas fisik dari storage jika ada
            if (storagePath) {
                const { error: storageError } = await supabase.storage
                    .from('gallery')
                    .remove([storagePath]);

                if (storageError) {
                    console.error("Gagal menghapus berkas fisik dari Storage:", storageError.message);
                }
            }

            alert('Media galeri berhasil dihapus.');
            fetchGallery();
        } catch (error) {
            alert(error.message);
        }
    };

    const filteredItems = galleryItems.filter(item => {
        if (filterType === 'all') return true;
        return item.type === filterType;
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
            {/* Form Section */}
            <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium} h-fit`}>
                <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Upload Galeri Baru</h3>
                <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tipe Media</label>
                        <select
                            value={newItem.type}
                            onChange={e => {
                                setNewItem({ ...newItem, type: e.target.value });
                                setSelectedFile(null);
                                const fileInput = document.getElementById('mediaFile');
                                if (fileInput) fileInput.value = '';
                            }}
                            className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm focus:ring-yellow-400"
                        >
                            <option value="photo">Foto Pertandingan / Fasilitas</option>
                            <option value="video">Video Pertandingan / Highlight</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Judul Media</label>
                        <input
                            type="text"
                            placeholder="Cth: Pertandingan Final Arios Cup"
                            value={newItem.title}
                            onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                            required
                            className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm focus:ring-yellow-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Deskripsi Singkat</label>
                        <textarea
                            placeholder="Deskripsi singkat mengenai foto/video ini..."
                            value={newItem.description}
                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm h-24 focus:ring-yellow-400"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pilih File Media</label>
                        <input
                            id="mediaFile"
                            type="file"
                            accept={newItem.type === 'photo' ? 'image/*' : 'video/*'}
                            onChange={handleFileChange}
                            required
                            className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm focus:ring-yellow-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                            {newItem.type === 'photo' ? 'Format gambar yang didukung: JPG, PNG, GIF, WEBP.' : 'Format video yang didukung: MP4, WebM.'}
                        </p>
                    </div>

                    <AnimatedButton 
                        type="submit" 
                        disabled={isUploading}
                        className={`w-full bg-black text-white font-bold py-3 rounded-md transition hover:bg-gray-800 disabled:bg-gray-400`}
                    >
                        {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Mengunggah...
                            </span>
                        ) : 'Upload ke Galeri'}
                    </AnimatedButton>
                </form>
            </div>

            {/* List Section */}
            <div className={`lg:col-span-2 ${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                    <h3 className={`text-xl font-bold ${theme.colors.textPrimary}`}>Daftar Media Galeri</h3>
                    
                    <div className="flex bg-gray-150 rounded-lg p-1 text-xs">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 rounded-md font-semibold transition ${filterType === 'all' ? 'bg-yellow-400 text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setFilterType('photo')}
                            className={`px-3 py-1.5 rounded-md font-semibold transition ${filterType === 'photo' ? 'bg-yellow-400 text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Foto
                        </button>
                        <button
                            onClick={() => setFilterType('video')}
                            className={`px-3 py-1.5 rounded-md font-semibold transition ${filterType === 'video' ? 'bg-yellow-400 text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Video
                        </button>
                    </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3">
                    {isLoading ? (
                        <p className="text-gray-500 text-center py-6">Memuat data galeri...</p>
                    ) : filteredItems.length === 0 ? (
                        <p className="text-gray-500 text-center py-6">Belum ada item galeri dalam kategori ini.</p>
                    ) : (
                        filteredItems.map(item => (
                            <div key={item.id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200 gap-4 hover:bg-gray-100/50 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                        {item.type === 'photo' ? (
                                            <img src={item.url} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/Hero Photo.png'; }} />
                                        ) : (
                                            <div className="relative w-full h-full">
                                                <video src={item.url} className="w-full h-full object-cover" muted />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-bold text-gray-800 flex items-center gap-2">
                                            {item.title}
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${item.type === 'photo' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                {item.type === 'photo' ? 'Foto' : 'Video'}
                                            </span>
                                        </p>
                                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{item.description || 'Tidak ada deskripsi.'}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 truncate max-w-md">{item.url}</p>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => handleDeleteItem(item.id, item.title, item.url)}
                                    className="text-red-500 hover:text-red-700 font-semibold text-sm px-3 py-1 hover:bg-red-50 rounded transition flex-shrink-0"
                                >
                                    Hapus
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default GalleryManagement;
