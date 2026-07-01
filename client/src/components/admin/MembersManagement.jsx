import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import { supabase } from '../../supabaseClient';

const MembersManagement = () => {
    const [users, setUsers] = useState([]);
    const [tiers, setTiers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTierId, setSelectedTierId] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
        // Ambil semua data pengguna dari tabel 'profiles'
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('*, membership_tiers(tier_name)'); // Gabungkan dengan tabel tiers
            if (usersError) throw usersError;
            setUsers(usersData);

            // Ambil semua tier yang tersedia untuk dropdown
            const { data: tiersData, error: tiersError } = await supabase
                .from('membership_tiers')
                .select('*');
            if (tiersError) throw tiersError;
        setTiers(tiersData);

        } catch (error) {
            console.error("Gagal memuat data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignTier = async () => {
        if (!selectedUser || !selectedTierId) {
            alert('Pilih pengguna dan tier terlebih dahulu.');
            return;
        }
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ membership_tier_id: selectedTierId === 'none' ? null : selectedTierId })
                .eq('id', selectedUser.id);
            
            if (error) throw error;

            alert('Status member berhasil diubah.');
            setSelectedUser(null);
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleToggleBlacklist = async (user) => {
        const newStatus = !user.is_blacklisted;
        const confirmMsg = newStatus 
            ? `Yakin ingin mem-blacklist ${user.nama_lengkap}? Pengguna ini tidak akan bisa melakukan pemesanan lapangan.`
            : `Yakin ingin memulihkan akun ${user.nama_lengkap}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_blacklisted: newStatus })
                .eq('id', user.id);

            if (error) throw error;

            alert(`Status blacklist ${user.nama_lengkap} berhasil diperbarui.`);
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <>
            <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Manajemen Pengguna & Member</h3>
                <div className="max-h-[70vh] overflow-y-auto">
                    {isLoading ? <p className={`${theme.colors.textMuted}`}>Memuat...</p> : (
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className={`text-left ${theme.colors.textSecondary} p-2 font-semibold`}>Nama</th>
                                    <th className={`text-left ${theme.colors.textSecondary} p-2 font-semibold`}>Tier</th>
                                    <th className={`text-center ${theme.colors.textSecondary} p-2 font-semibold`}>Status</th>
                                    <th className={`text-right ${theme.colors.textSecondary} p-2 font-semibold`}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className={`border-b ${theme.colors.border} text-black`}>
                                        <td className={`p-2 ${theme.colors.textPrimary} font-semibold`}>{user.nama_lengkap}</td>
                                        <td className="p-2">
                                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${user.membership_tiers ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>
                                                {user.membership_tiers?.tier_name || 'Bukan Member'}
                                            </span>
                                        </td>
                                        <td className="p-2 text-center">
                                            {user.is_blacklisted ? (
                                                <span className="text-red-600 font-bold bg-red-100 px-2.5 py-1 rounded-full text-xs border border-red-200">
                                                    Blacklisted
                                                </span>
                                            ) : (
                                                <span className="text-green-600 font-bold bg-green-100 px-2.5 py-1 rounded-full text-xs border border-green-200">
                                                    Aktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2 text-right space-x-2">
                                            <AnimatedButton onClick={() => setSelectedUser(user)} className="text-xs font-bold py-1.5 px-3 rounded-full bg-gray-800 text-white hover:bg-gray-700">
                                                Ubah Tier
                                            </AnimatedButton>
                                            <button 
                                                onClick={() => handleToggleBlacklist(user)} 
                                                className={`text-xs font-bold py-1.5 px-3 rounded-full border transition ${
                                                    user.is_blacklisted 
                                                        ? 'bg-green-600 text-white hover:bg-green-700 border-green-600' 
                                                        : 'bg-red-600 text-white hover:bg-red-700 border-red-600'
                                                }`}
                                            >
                                                {user.is_blacklisted ? 'Pulihkan' : 'Blacklist'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal untuk mengubah tier */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className={`${theme.colors.surface} rounded-lg shadow-xl p-6 max-w-md w-full`}>
                        <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>
                            Ubah Tier untuk {selectedUser.nama_lengkap}
                        </h3>
                        
                            <select onChange={(e) => setSelectedTierId(e.target.value)} className={`w-full p-3 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border} mb-4`}>
                                <option value="">Pilih Tier</option>
                                <option value="none">Hapus Membership</option>
                                {tiers.map(tier => <option key={tier.id} value={tier.id}>{tier.tier_name}</option>)}
                            </select>

                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setSelectedUser(null)} className="text-gray-600 font-semibold">Batal</button>
                            <AnimatedButton 
                                onClick={handleAssignTier} 
                                className={`${theme.colors.primary} ${theme.colors.textOnPrimary} font-bold py-2 px-5 rounded-full`}
                            >
                                Simpan
                            </AnimatedButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MembersManagement;
