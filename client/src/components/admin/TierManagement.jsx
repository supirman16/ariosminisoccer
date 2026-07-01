import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import { supabase } from '../../supabaseClient';

const TierManagement = () => {
    const [tiers, setTiers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTier, setNewTier] = useState({
        tier_name: '',
        price: '',
        bookings_required: '',
        benefits_json: { discount_percentage: 0, description: '' }
    });

    const fetchTiers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('membership_tiers')
            .select('*')
            .order('price', { ascending: true });

        if (error) console.error("Error fetching tiers:", error);
        else setTiers(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    const handleAddTier = async (e) => {
        e.preventDefault();
        const payload = {
            ...newTier,
            benefits_json: {
                ...newTier.benefits_json,
                discount_percentage: Number(newTier.benefits_json.discount_percentage)
            }
        };
        const { error } = await supabase.from('membership_tiers').insert(payload);
        
        if (error) {
            alert(error.message);
        } else {
            alert(`Tier ${newTier.tier_name} berhasil dibuat.`);
            setNewTier({ tier_name: '', price: '', bookings_required: '', benefits_json: { discount_percentage: 0, description: '' } });
            fetchTiers();
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Buat Tier Baru</h3>
                <form onSubmit={handleAddTier} className="space-y-4">
                    <input type="text" placeholder="Nama Tier (cth: Gold)" value={newTier.tier_name} onChange={e => setNewTier({...newTier, tier_name: e.target.value})} required className={`w-full p-3 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border}`} />
                    <input type="number" placeholder="Harga Pendaftaran" value={newTier.price} onChange={e => setNewTier({...newTier, price: e.target.value})} required className={`w-full p-3 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border}`} />
                    <input type="number" placeholder="Jml. Booking Dibutuhkan" value={newTier.bookings_required} onChange={e => setNewTier({...newTier, bookings_required: e.target.value})} required className={`w-full p-3 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border}`} />
                    <input type="number" placeholder="Diskon (%)" value={newTier.benefits_json.discount_percentage} onChange={e => setNewTier({...newTier, benefits_json: {...newTier.benefits_json, discount_percentage: e.target.value}})} required className={`w-full p-3 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border}`} />
                    <textarea placeholder="Deskripsi Benefit" value={newTier.benefits_json.description} onChange={e => setNewTier({...newTier, benefits_json: {...newTier.benefits_json, description: e.target.value}})} className={`w-full p-3 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border} h-24`}></textarea>
                    <AnimatedButton type="submit" className={`w-full bg-black text-white py-3 rounded-md hover:bg-gray-800`}>Simpan Tier</AnimatedButton>
                </form>
            </div>
            <div className={`md:col-span-2 ${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Daftar Tier Membership</h3>
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? <p className={`${theme.colors.textMuted}`}>Memuat...</p> : (
                        <div className="space-y-3">
                            {tiers.map(tier => (
                                <div key={tier.id} className={`bg-gray-50 p-3 rounded-md border ${theme.colors.border}`}>
                                    <p className={`font-bold ${theme.colors.textPrimary}`}>{tier.tier_name}</p>
                                    <p className={`text-sm ${theme.colors.textSecondary}`}>Harga: Rp {Number(tier.price).toLocaleString('id-ID')}</p>
                                    <p className={`text-sm ${theme.colors.textSecondary}`}>Syarat: {tier.bookings_required} booking</p>
                                    <p className={`text-sm ${theme.colors.textSecondary}`}>Benefit: {tier.benefits_json.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TierManagement;
