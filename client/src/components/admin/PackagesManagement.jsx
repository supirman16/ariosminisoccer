import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import { supabase } from '../../supabaseClient';

const PackagesManagement = () => {
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPackage, setNewPackage] = useState({ nama_paket: '', deskripsi: '', harga: '', jumlah_jam: '' });

    const fetchPackages = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('packages')
            .select('*')
            .order('harga', { ascending: true });

        if (error) console.error("Error fetching packages:", error);
        else setPackages(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleAddPackage = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('packages').insert(newPackage);
        
        if (error) {
            alert(error.message);
        } else {
            alert(`Paket ${newPackage.nama_paket} berhasil ditambahkan!`);
            setNewPackage({ nama_paket: '', deskripsi: '', harga: '', jumlah_jam: '' });
            fetchPackages();
        }
    };

    const handleDeletePackage = async (id) => {
        if (!window.confirm('Yakin ingin menghapus paket ini?')) return;
        const { error } = await supabase.from('packages').delete().eq('id', id);

        if (error) {
            alert(error.message);
        } else {
            alert('Paket berhasil dihapus.');
            fetchPackages();
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Tambah Paket Baru</h3>
                <form onSubmit={handleAddPackage} className="space-y-4">
                    <input type="text" placeholder="Nama Paket" value={newPackage.nama_paket} onChange={e => setNewPackage({...newPackage, nama_paket: e.target.value})} required className={`w-full p-3 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border}`} />
                    <textarea placeholder="Deskripsi (Opsional)" value={newPackage.deskripsi} onChange={e => setNewPackage({...newPackage, deskripsi: e.target.value})} className={`w-full p-3 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border} h-24`}></textarea>
                    <input type="number" placeholder="Harga (e.g., 300000)" value={newPackage.harga} onChange={e => setNewPackage({...newPackage, harga: e.target.value})} required className={`w-full p-3 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border}`} />
                    <input type="number" placeholder="Jumlah Jam" value={newPackage.jumlah_jam} onChange={e => setNewPackage({...newPackage, jumlah_jam: e.target.value})} required className={`w-full p-3 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border}`} />
                    <AnimatedButton type="submit" className={`w-full bg-black text-white py-3 rounded-md hover:bg-gray-800`}>Tambah Paket</AnimatedButton>
                </form>
            </div>
            <div className={`md:col-span-2 ${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Daftar Paket Tersedia</h3>
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? <p className={`${theme.colors.textMuted}`}>Memuat...</p> : (
                        <div className="space-y-3">
                            {packages.map(pkg => (
                                <div key={pkg.id} className={`bg-gray-50 p-3 rounded-md flex justify-between items-center border ${theme.colors.border}`}>
                                    <div>
                                        <p className={`font-bold ${theme.colors.textPrimary}`}>{pkg.nama_paket} ({pkg.jumlah_jam} Jam)</p>
                                        <p className={`text-sm ${theme.colors.textSecondary}`}>Rp {Number(pkg.harga).toLocaleString('id-ID')}</p>
                                    </div>
                                    <button onClick={() => handleDeletePackage(pkg.id)} className="text-red-500 hover:text-red-700 font-semibold">Hapus</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PackagesManagement;