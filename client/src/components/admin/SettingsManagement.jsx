import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import { supabase } from '../../supabaseClient';

// Komponen Toggle Switch
const ToggleSwitch = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg border border-gray-200">
        <span className={`font-medium ${theme.colors.textSecondary}`}>{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-yellow-400' : 'bg-gray-300'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

// Komponen Input Angka
const NumberInput = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className={`block text-sm font-medium mb-1 ${theme.colors.textSecondary}`}>{label}</label>
        <input
            type="number"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full p-3 bg-gray-100 border ${theme.colors.border} rounded-md ${theme.colors.textPrimary}`}
        />
    </div>
);

// --- KOMPONEN: MODAL UNTUK MELIHAT DETAIL ---
const DetailModal = ({ versionDetails, onClose }) => {
    if (!versionDetails) return null;
    const { settings } = versionDetails;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className={`${theme.colors.surface} rounded-lg shadow-xl p-6 max-w-2xl w-full border ${theme.colors.border}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-2xl font-bold ${theme.colors.textPrimary}`}>Detail: {versionDetails.version_name}</h2>
                    <button onClick={onClose} className={`${theme.colors.textMuted} hover:text-black text-2xl`}>&times;</button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
                    <div className={`p-4 bg-gray-50 rounded-lg border ${theme.colors.border}`}>
                        <h3 className={`font-semibold ${theme.colors.accent} mb-2`}>Harga</h3>
                        <p className={`${theme.colors.textSecondary}`}>Weekday: <span className={`font-bold ${theme.colors.textPrimary}`}>Rp {Number(settings.prices.price_weekday).toLocaleString('id-ID')}</span></p>
                        <p className={`${theme.colors.textSecondary}`}>Weekend/Malam: <span className={`font-bold ${theme.colors.textPrimary}`}>Rp {Number(settings.prices.price_weekend_night).toLocaleString('id-ID')}</span></p>
                    </div>
                    <div className={`p-4 bg-gray-50 rounded-lg border ${theme.colors.border}`}>
                        <h3 className={`font-semibold ${theme.colors.accent} mb-2`}>Loyalty</h3>
                        <p className={`${theme.colors.textSecondary}`}>Sistem Poin: <span className={`font-bold ${settings.loyalty.loyalty_system_enabled ? 'text-green-600' : 'text-red-600'}`}>{settings.loyalty.loyalty_system_enabled ? 'Aktif' : 'Nonaktif'}</span></p>
                        <p className={`${theme.colors.textSecondary}`}>Poin per Rp 10.000: <span className={`font-bold ${theme.colors.textPrimary}`}>{settings.loyalty.points_per_10k_rupiah}</span></p>
                        <p className={`${theme.colors.textSecondary}`}>Poin untuk Redeem: <span className={`font-bold ${theme.colors.textPrimary}`}>{settings.loyalty.redeem_points_needed}</span></p>
                        <p className={`${theme.colors.textSecondary}`}>Diskon Redeem: <span className={`font-bold ${theme.colors.textPrimary}`}>Rp {Number(settings.loyalty.redeem_discount_amount).toLocaleString('id-ID')}</span></p>
                    </div>
                    <div className={`p-4 bg-gray-50 rounded-lg border ${theme.colors.border}`}>
                        <h3 className={`font-semibold ${theme.colors.accent} mb-2`}>Operasional</h3>
                        <p className={`${theme.colors.textSecondary}`}>Jam Buka: <span className={`font-bold ${theme.colors.textPrimary}`}>{settings.operational.opening_hour}:00</span></p>
                        <p className={`${theme.colors.textSecondary}`}>Jam Tutup: <span className={`font-bold ${theme.colors.textPrimary}`}>{settings.operational.closing_hour}:00</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- KOMPONEN: FORM UNTUK MEMBUAT/CLONE VERSI ---
const CreateVersionForm = ({ onSuccess, cloneData }) => {
    const [versionName, setVersionName] = useState('');
    const [settings, setSettings] = useState({
        prices: { price_weekday: '300000', price_weekend_night: '450000' },
        loyalty: { loyalty_system_enabled: true, points_per_10k_rupiah: '1', redeem_points_needed: '1000', redeem_discount_amount: '50000' },
        operational: { opening_hour: '8', closing_hour: '22' }
    });

    useEffect(() => {
        if (cloneData) {
            setVersionName(`Salinan dari ${cloneData.version_name}`);
            setSettings(cloneData.settings);
        }
    }, [cloneData]);

    const handleSettingChange = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: { ...prev[category], [key]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Di Supabase, kita bisa menggunakan Edge Function untuk transaksi yang lebih aman
        // Untuk saat ini, kita akan lakukan di client-side
        try {
            // 1. Buat entri di tabel induk
            const { data: versionData, error: versionError } = await supabase
                .from('setting_versions')
                .insert({ version_name: versionName })
                .select()
                .single();
            if (versionError) throw versionError;

            // 2. Masukkan detail ke tabel masing-masing
            const { error: priceError } = await supabase.from('settings_prices').insert({ version_id: versionData.id, ...settings.prices });
            if (priceError) throw priceError;

            const { error: loyaltyError } = await supabase.from('settings_loyalty').insert({ version_id: versionData.id, ...settings.loyalty });
            if (loyaltyError) throw loyaltyError;

            const { error: opError } = await supabase.from('settings_operational').insert({ version_id: versionData.id, ...settings.operational });
            if (opError) throw opError;

            alert(`Versi pengaturan "${versionName}" berhasil dibuat.`);
            onSuccess();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`bg-gray-100 p-4 rounded-lg mb-6 space-y-6 border ${theme.colors.border}`}>
            <div>
                <label className={`block text-lg font-semibold ${theme.colors.textPrimary} mb-2`}>Nama Versi</label>
                <input type="text" placeholder="Cth: Promo Kemerdekaan 2025" value={versionName} onChange={e => setVersionName(e.target.value)} required className={`w-full p-3 bg-white rounded-md ${theme.colors.textPrimary} border ${theme.colors.border}`} />
            </div>
            <div className={`space-y-4 p-4 border ${theme.colors.border} rounded-lg`}>
                <h3 className={`text-lg font-semibold ${theme.colors.accent}`}>Pengaturan Harga</h3>
                <NumberInput label="Harga Weekday (Rp)" value={settings.prices.price_weekday} onChange={e => handleSettingChange('prices', 'price_weekday', e.target.value)} />
                <NumberInput label="Harga Weekend/Malam (Rp)" value={settings.prices.price_weekend_night} onChange={e => handleSettingChange('prices', 'price_weekend_night', e.target.value)} />
            </div>
            <div className={`space-y-4 p-4 border ${theme.colors.border} rounded-lg`}>
                <h3 className={`text-lg font-semibold ${theme.colors.accent}`}>Pengaturan Loyalty</h3>
                <ToggleSwitch label="Aktifkan Sistem Poin" enabled={settings.loyalty.loyalty_system_enabled} onChange={val => handleSettingChange('loyalty', 'loyalty_system_enabled', val)} />
                <NumberInput label="Poin per Rp 10.000" value={settings.loyalty.points_per_10k_rupiah} onChange={e => handleSettingChange('loyalty', 'points_per_10k_rupiah', e.target.value)} />
                <NumberInput label="Poin untuk Redeem" value={settings.loyalty.redeem_points_needed} onChange={e => handleSettingChange('loyalty', 'redeem_points_needed', e.target.value)} />
                <NumberInput label="Diskon Redeem (Rp)" value={settings.loyalty.redeem_discount_amount} onChange={e => handleSettingChange('loyalty', 'redeem_discount_amount', e.target.value)} />
            </div>
            <div className={`space-y-4 p-4 border ${theme.colors.border} rounded-lg`}>
                <h3 className={`text-lg font-semibold ${theme.colors.accent}`}>Jam Operasional</h3>
                <NumberInput label="Jam Buka (0-23)" value={settings.operational.opening_hour} onChange={e => handleSettingChange('operational', 'opening_hour', e.target.value)} />
                <NumberInput label="Jam Tutup (0-23)" value={settings.operational.closing_hour} onChange={e => handleSettingChange('operational', 'closing_hour', e.target.value)} />
            </div>
            <AnimatedButton type="submit" className={`w-full bg-black text-white py-3 rounded-md hover:bg-gray-800`}>Simpan Versi Baru</AnimatedButton>
        </form>
    );
};

// Komponen utama
const SettingsManagement = () => {
    const [versions, setVersions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [cloneData, setCloneData] = useState(null);
    const [viewingDetails, setViewingDetails] = useState(null);
    const { refetchSettings } = useSettings();

    const fetchVersions = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('setting_versions').select('*').order('created_at', { ascending: false });
        if (error) console.error("Error fetching versions:", error);
        else setVersions(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchVersions();
    }, []);

    const handleActivateVersion = async (id) => {
        // Ini sebaiknya dijadikan Edge Function untuk transaksi yang aman
        try {
            // Nonaktifkan semua
            const { error: deactivateError } = await supabase.from('setting_versions').update({ is_active: false }).eq('is_active', true);
            if (deactivateError) throw deactivateError;
            // Aktifkan yang dipilih
            const { error: activateError } = await supabase.from('setting_versions').update({ is_active: true }).eq('id', id);
            if (activateError) throw activateError;
            alert('Versi berhasil diaktifkan.');
            fetchVersions();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${theme.colors.textPrimary}`}>Manajemen Versi Pengaturan</h2>
                <AnimatedButton onClick={() => { setCloneData(null); setShowCreateForm(!showCreateForm); }} className={`bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800`}>
                    {showCreateForm ? 'Tutup Form' : '+ Buat Versi Baru'}
                </AnimatedButton>
            </div>

            {showCreateForm && <CreateVersionForm onSuccess={() => { setShowCreateForm(false); fetchVersions(); }} cloneData={cloneData} />}

            <div className="space-y-3">
                {isLoading ? <p className={`${theme.colors.textMuted}`}>Memuat...</p> : versions.map(v => (
                    <div key={v.id} className={`bg-gray-50 p-3 rounded-md flex justify-between items-center border ${theme.colors.border}`}>
                        <div>
                            <p className={`font-bold ${theme.colors.textPrimary}`}>{v.version_name}</p>
                            <p className={`text-sm ${theme.colors.textSecondary}`}>Status: {v.is_active ? <span className="text-green-600 font-semibold">Aktif</span> : <span className="text-gray-500">Nonaktif</span>}</p>
                        </div>
                        <div className="space-x-2">
                            <button disabled={v.is_active} onClick={() => handleActivateVersion(v.id)} className={`py-1 px-3 rounded-md text-sm font-bold ${v.is_active ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white'}`}>Aktifkan</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SettingsManagement;
