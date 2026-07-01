import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import { supabase } from '../../supabaseClient';

const FacilitiesManagement = () => {
    const [facilities, setFacilities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form State untuk Fasilitas Baru
    const [newFacility, setNewFacility] = useState({ title: '', description: '' });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ title: '', description: '' });

    const fetchFacilities = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('website_config')
                .select('facilities_json')
                .eq('id', 1)
                .single();

            if (error) {
                console.error("Gagal memuat data fasilitas:", error);
            } else if (data) {
                setFacilities(data.facilities_json || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFacilities();
    }, []);

    const saveToDatabase = async (updatedList) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('website_config')
                .update({ facilities_json: updatedList })
                .eq('id', 1);

            if (error) throw error;
            setFacilities(updatedList);
        } catch (err) {
            alert('Gagal menyimpan ke database: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    // Fungsi upload file ke Supabase Storage
    const uploadFiles = async (files) => {
        const uploadedUrls = [];
        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `facilities/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
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
        return uploadedUrls;
    };

    const handleAddFacility = async (e) => {
        e.preventDefault();
        if (!newFacility.title) return;

        setIsUploading(true);
        try {
            // Upload foto jika ada
            let photoUrls = [];
            if (selectedFiles.length > 0) {
                photoUrls = await uploadFiles(selectedFiles);
            }

            const newObj = {
                id: Date.now(),
                title: newFacility.title,
                description: newFacility.description,
                photos: photoUrls
            };

            const updated = [...facilities, newObj];
            await saveToDatabase(updated);
            
            // Reset
            setNewFacility({ title: '', description: '' });
            setSelectedFiles([]);
            const fileInput = document.getElementById('facilityFiles');
            if (fileInput) fileInput.value = '';

            alert('Fasilitas berhasil ditambahkan!');
        } catch (err) {
            alert(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteFacility = async (id) => {
        const target = facilities.find(f => f.id === id);
        if (!window.confirm(`Yakin ingin menghapus fasilitas "${target?.title}"?`)) return;

        // Coba hapus file fisik dari storage jika ada
        if (target?.photos && target.photos.length > 0) {
            const pathsToRemove = target.photos
                .map(url => {
                    if (url.includes('/public/gallery/')) {
                        return url.split('/public/gallery/')[1];
                    }
                    return null;
                })
                .filter(Boolean);

            if (pathsToRemove.length > 0) {
                await supabase.storage.from('gallery').remove(pathsToRemove);
            }
        }

        const updated = facilities.filter(f => f.id !== id);
        await saveToDatabase(updated);
        alert('Fasilitas berhasil dihapus.');
    };

    // Mulai mode edit
    const startEdit = (fac) => {
        setEditingId(fac.id);
        setEditData({ title: fac.title, description: fac.description });
    };

    const handleSaveEdit = async (id) => {
        const updated = facilities.map(f => {
            if (f.id === id) {
                return { ...f, title: editData.title, description: editData.description };
            }
            return f;
        });
        await saveToDatabase(updated);
        setEditingId(null);
    };

    // Tambah foto ke fasilitas yang sudah ada
    const handleAddPhotosToFacility = async (facId, files) => {
        if (files.length === 0) return;
        setIsUploading(true);
        try {
            const uploadedUrls = await uploadFiles(files);
            const updated = facilities.map(f => {
                if (f.id === facId) {
                    return { ...f, photos: [...(f.photos || []), ...uploadedUrls] };
                }
                return f;
            });
            await saveToDatabase(updated);
            alert('Foto berhasil ditambahkan ke galeri fasilitas!');
        } catch (err) {
            alert(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    // Hapus foto spesifik dari galeri fasilitas
    const handleDeletePhotoFromFacility = async (facId, photoUrl) => {
        if (!window.confirm('Yakin ingin menghapus foto ini dari galeri fasilitas?')) return;

        // Hapus file fisik
        if (photoUrl.includes('/public/gallery/')) {
            const filePath = photoUrl.split('/public/gallery/')[1];
            await supabase.storage.from('gallery').remove([filePath]);
        }

        const updated = facilities.map(f => {
            if (f.id === facId) {
                return { ...f, photos: (f.photos || []).filter(url => url !== photoUrl) };
            }
            return f;
        });
        await saveToDatabase(updated);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
            {/* Form Section */}
            <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium} h-fit`}>
                <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Tambah Fasilitas Baru</h3>
                <form onSubmit={handleAddFacility} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Fasilitas</label>
                        <input
                            type="text"
                            placeholder="Cth: Ruang Ganti & Air Panas"
                            value={newFacility.title}
                            onChange={e => setNewFacility({ ...newFacility, title: e.target.value })}
                            required
                            className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm focus:ring-yellow-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Deskripsi Fasilitas</label>
                        <textarea
                            placeholder="Keterangan mengenai kenyamanan fasilitas..."
                            value={newFacility.description}
                            onChange={e => setNewFacility({ ...newFacility, description: e.target.value })}
                            className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm h-24 focus:ring-yellow-400"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Galeri Foto Fasilitas</label>
                        <input
                            id="facilityFiles"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm focus:ring-yellow-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Anda dapat memilih lebih dari satu foto sekaligus.</p>
                    </div>

                    <AnimatedButton
                        type="submit"
                        disabled={isUploading || isSaving}
                        className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                    >
                        {isUploading ? 'Mengunggah Foto...' : isSaving ? 'Menyimpan...' : 'Tambah Fasilitas'}
                    </AnimatedButton>
                </form>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 space-y-6">
                <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                    <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Daftar Fasilitas</h3>
                    {isLoading ? (
                        <p className="text-gray-500 text-center py-6">Memuat fasilitas...</p>
                    ) : facilities.length === 0 ? (
                        <p className="text-gray-500 text-center py-6">Belum ada fasilitas terdaftar.</p>
                    ) : (
                        <div className="space-y-6">
                            {facilities.map(fac => (
                                <div key={fac.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                                    {editingId === fac.id ? (
                                        // Edit Mode Form
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editData.title}
                                                onChange={e => setEditData({ ...editData, title: e.target.value })}
                                                className="w-full p-2 bg-white rounded border border-gray-300 text-sm font-bold"
                                            />
                                            <textarea
                                                value={editData.description}
                                                onChange={e => setEditData({ ...editData, description: e.target.value })}
                                                className="w-full p-2 bg-white rounded border border-gray-300 text-xs h-20"
                                            ></textarea>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSaveEdit(fac.id)} className="bg-green-600 text-white font-semibold px-4 py-1.5 rounded text-xs hover:bg-green-700">Simpan</button>
                                                <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white font-semibold px-4 py-1.5 rounded text-xs hover:bg-gray-600">Batal</button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-800">{fac.title}</h4>
                                                <p className="text-gray-600 text-xs mt-1 leading-relaxed">{fac.description || 'Tidak ada deskripsi.'}</p>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button onClick={() => startEdit(fac)} className="text-blue-600 hover:text-blue-800 font-semibold text-xs py-1 px-2.5 bg-blue-50 rounded hover:bg-blue-100">Ubah</button>
                                                <button onClick={() => handleDeleteFacility(fac.id)} className="text-red-600 hover:text-red-800 font-semibold text-xs py-1 px-2.5 bg-red-50 rounded hover:bg-red-100">Hapus</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sub-gallery for the facility */}
                                    <div className="border-t border-gray-250 pt-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Galeri Foto Fasilitas</h5>
                                            <label className="cursor-pointer text-[10px] font-bold text-yellow-600 bg-yellow-100 hover:bg-yellow-200 px-3 py-1.5 rounded-full transition">
                                                + Upload Foto
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => handleAddPhotosToFacility(fac.id, Array.from(e.target.files))}
                                                />
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-4 gap-3">
                                            {fac.photos && fac.photos.length > 0 ? (
                                                fac.photos.map((photo, pIdx) => (
                                                    <div key={pIdx} className="relative aspect-square bg-gray-200 rounded overflow-hidden group border border-gray-300">
                                                        <img src={photo} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePhotoFromFacility(fac.id, photo)}
                                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                                                            title="Hapus foto"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 text-center py-4 text-xs col-span-4 italic">Belum ada foto galeri.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacilitiesManagement;
