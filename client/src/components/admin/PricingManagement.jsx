import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import { supabase } from '../../supabaseClient';

const PricingManagement = () => {
    const [pricing, setPricing] = useState({
        base_price_day: 600000,
        base_price_night: 800000,
        night_hour_start: 18,
        special_rules: [],
        addon_facilities: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form rule kustom baru
    const [newRule, setNewRule] = useState({ name: '', surcharge: '' });
    
    // Form addon kustom baru
    const [newAddon, setNewAddon] = useState({ name: '', price: '' });

    const fetchPricing = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('website_config')
                .select('price_config_json')
                .eq('id', 1)
                .single();

            if (error) {
                console.error("Gagal memuat konfigurasi harga:", error);
            } else if (data && data.price_config_json) {
                setPricing({
                    base_price_day: data.price_config_json.base_price_day || 600000,
                    base_price_night: data.price_config_json.base_price_night || 800000,
                    night_hour_start: data.price_config_json.night_hour_start || 18,
                    special_rules: data.price_config_json.special_rules || [],
                    addon_facilities: data.price_config_json.addon_facilities || []
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPricing();
    }, []);

    const handleSavePricing = async (updatedConfig = pricing) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('website_config')
                .update({ price_config_json: updatedConfig })
                .eq('id', 1);

            if (error) throw error;
            alert('Pengaturan harga berhasil disimpan!');
            fetchPricing();
        } catch (err) {
            alert('Gagal menyimpan: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBaseChange = (field, val) => {
        setPricing({ ...pricing, [field]: Number(val) });
    };

    // Handler Tambah Aturan Tambahan Biaya (Surcharge)
    const handleAddRule = (e) => {
        e.preventDefault();
        if (!newRule.name || !newRule.surcharge) return;

        const ruleObj = {
            id: 'rule_' + Date.now(),
            name: newRule.name,
            surcharge: Number(newRule.surcharge)
        };

        const updatedConfig = {
            ...pricing,
            special_rules: [...pricing.special_rules, ruleObj]
        };

        setPricing(updatedConfig);
        setNewRule({ name: '', surcharge: '' });
        handleSavePricing(updatedConfig);
    };

    const handleDeleteRule = (id) => {
        if (!window.confirm('Hapus aturan biaya tambahan ini?')) return;
        const updatedConfig = {
            ...pricing,
            special_rules: pricing.special_rules.filter(r => r.id !== id)
        };
        setPricing(updatedConfig);
        handleSavePricing(updatedConfig);
    };

    // Handler Tambah Biaya Addon Fasilitas
    const handleAddAddon = (e) => {
        e.preventDefault();
        if (!newAddon.name || !newAddon.price) return;

        const addonObj = {
            id: 'addon_' + Date.now(),
            name: newAddon.name,
            price: Number(newAddon.price)
        };

        const updatedConfig = {
            ...pricing,
            addon_facilities: [...pricing.addon_facilities, addonObj]
        };

        setPricing(updatedConfig);
        setNewAddon({ name: '', price: '' });
        handleSavePricing(updatedConfig);
    };

    const handleDeleteAddon = (id) => {
        if (!window.confirm('Hapus tambahan biaya fasilitas ini?')) return;
        const updatedConfig = {
            ...pricing,
            addon_facilities: pricing.addon_facilities.filter(a => a.id !== id)
        };
        setPricing(updatedConfig);
        handleSavePricing(updatedConfig);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-black">
            {isLoading ? (
                <p className="text-gray-500 text-center col-span-2 py-8">Memuat pengaturan harga...</p>
            ) : (
                <>
                    {/* Left Column: Base Prices & Save Button */}
                    <div className="space-y-6">
                        <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                            <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Tarif Dasar Lapangan</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tarif Siang (Rp / Jam)</label>
                                    <input
                                        type="number"
                                        value={pricing.base_price_day}
                                        onChange={e => handleBaseChange('base_price_day', e.target.value)}
                                        className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm focus:ring-yellow-400 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tarif Malam (Rp / Jam)</label>
                                    <input
                                        type="number"
                                        value={pricing.base_price_night}
                                        onChange={e => handleBaseChange('base_price_night', e.target.value)}
                                        className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm focus:ring-yellow-400 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Jam Mulai Tarif Malam (Cth: 18 untuk Pukul 18:00)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={pricing.night_hour_start}
                                        onChange={e => handleBaseChange('night_hour_start', e.target.value)}
                                        className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 text-sm focus:ring-yellow-400 font-semibold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Action Card */}
                        <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium} text-center`}>
                            <h4 className="font-bold text-gray-800 mb-2">Simpan Tarif Dasar</h4>
                            <p className="text-xs text-gray-400 mb-4">Simpan perubahan harga sewa per jam agar langsung terpengaruh di halaman booking pengunjung.</p>
                            <AnimatedButton
                                onClick={() => handleSavePricing(pricing)}
                                disabled={isSaving}
                                className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Tarif Dasar'}
                            </AnimatedButton>
                        </div>
                    </div>

                    {/* Right Column: Special Rules & Addon Prices */}
                    <div className="space-y-6">
                        {/* Section A: Special Rules (Surcharges) */}
                        <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                            <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Surcharge (Tambahan Biaya Hari/Jam)</h3>
                            
                            <form onSubmit={handleAddRule} className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Tambah Aturan Tambahan Biaya</h4>
                                <div>
                                    <label className="block text-xs text-gray-400 font-semibold mb-0.5">Nama Aturan / Kondisi</label>
                                    <input
                                        type="text"
                                        placeholder="Cth: Tambahan Akhir Pekan (Sabtu - Minggu)"
                                        value={newRule.name}
                                        onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                        required
                                        className="w-full p-2 bg-white rounded-md border border-gray-300 text-xs focus:ring-yellow-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 font-semibold mb-0.5">Besar Biaya Tambahan (Rp)</label>
                                    <input
                                        type="number"
                                        placeholder="Cth: 100000"
                                        value={newRule.surcharge}
                                        onChange={e => setNewRule({ ...newRule, surcharge: e.target.value })}
                                        required
                                        className="w-full p-2 bg-white rounded-md border border-gray-300 text-xs focus:ring-yellow-400 font-bold"
                                    />
                                </div>
                                <AnimatedButton type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-1.5 rounded text-xs">
                                    + Tambahkan Aturan Surcharge
                                </AnimatedButton>
                            </form>

                            {/* Rules List */}
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Daftar Surcharge Aktif</h4>
                            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                                {pricing.special_rules.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4 text-xs">Belum ada surcharge kustom.</p>
                                ) : (
                                    pricing.special_rules.map(r => (
                                        <div key={r.id} className="bg-gray-100 p-3 rounded-lg border border-gray-300 flex justify-between gap-4 text-xs items-center">
                                            <div>
                                                <p className="font-bold text-gray-850">{r.name}</p>
                                                <p className="text-red-650 mt-0.5 font-bold">+ Rp {r.surcharge.toLocaleString('id-ID')}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRule(r.id)}
                                                className="text-red-500 hover:text-red-700 font-semibold text-[10px]"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Section B: Addon Facilities Pricing */}
                        <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                            <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Biaya Tambahan Fasilitas (Addon)</h3>
                            
                            <form onSubmit={handleAddAddon} className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Tambah Biaya Fasilitas Kustom</h4>
                                <div>
                                    <label className="block text-xs text-gray-400 font-semibold mb-0.5">Nama Fasilitas Tambahan</label>
                                    <input
                                        type="text"
                                        placeholder="Cth: Jasa Fotografer Profesional"
                                        value={newAddon.name}
                                        onChange={e => setNewAddon({ ...newAddon, name: e.target.value })}
                                        required
                                        className="w-full p-2 bg-white rounded-md border border-gray-300 text-xs focus:ring-yellow-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 font-semibold mb-0.5">Tarif Tambahan (Rp)</label>
                                    <input
                                        type="number"
                                        placeholder="Cth: 250000"
                                        value={newAddon.price}
                                        onChange={e => setNewAddon({ ...newAddon, price: e.target.value })}
                                        required
                                        className="w-full p-2 bg-white rounded-md border border-gray-300 text-xs focus:ring-yellow-400 font-bold"
                                    />
                                </div>
                                <AnimatedButton type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-1.5 rounded text-xs">
                                    + Tambahkan Biaya Addon
                                </AnimatedButton>
                            </form>

                            {/* Addons List */}
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Daftar Addon Aktif</h4>
                            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                                {pricing.addon_facilities.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4 text-xs">Belum ada tambahan biaya fasilitas.</p>
                                ) : (
                                    pricing.addon_facilities.map(a => (
                                        <div key={a.id} className="bg-gray-100 p-3 rounded-lg border border-gray-300 flex justify-between gap-4 text-xs items-center">
                                            <div>
                                                <p className="font-bold text-gray-850">{a.name}</p>
                                                <p className="text-yellow-600 mt-0.5 font-bold">Rp {a.price.toLocaleString('id-ID')}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAddon(a.id)}
                                                className="text-red-500 hover:text-red-700 font-semibold text-[10px]"
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

export default PricingManagement;
