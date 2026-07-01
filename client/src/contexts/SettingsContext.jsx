import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../supabaseClient'; // <-- Impor Supabase client

// 1. Buat Context
const SettingsContext = createContext();

// 2. Buat Hook kustom untuk menggunakan context ini dengan mudah
export const useSettings = () => useContext(SettingsContext);

// 3. Buat Provider
export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Gunakan useCallback agar fungsi ini tidak dibuat ulang di setiap render
    const refetchSettings = useCallback(() => {
        setIsLoading(true);

        // --- LOGIKA BARU MENGGUNAKAN SUPABASE ---
        const fetchActiveSettings = async () => {
            try {
                // Query ini menggabungkan semua tabel pengaturan berdasarkan versi yang aktif
                const { data, error } = await supabase
                    .from('setting_versions')
                    .select(`
                        *,
                        settings_prices(*),
                        settings_loyalty(*),
                        settings_operational(*)
                    `)
                    .eq('is_active', true)
                    .limit(1);

                if (error) throw error;

                if (data && data.length > 0) {
                    const activeVersion = data[0];
                    // Gabungkan semua data menjadi satu objek yang mudah digunakan
                    const combinedSettings = {
                        ...activeVersion,
                        ...activeVersion.settings_prices[0],
                        ...activeVersion.settings_loyalty[0],
                        ...activeVersion.settings_operational[0],
                    };
                
                delete combinedSettings.settings_prices;
                delete combinedSettings.settings_loyalty;
                delete combinedSettings.settings_operational;
                
                combinedSettings.loyalty_system_enabled = combinedSettings.loyalty_system_enabled ? 'true' : 'false';
                setSettings(combinedSettings);
                } else {
                    // Jika tidak ada pengaturan aktif, set ke null atau objek default
                    setSettings(null); 
                    console.warn("Tidak ada versi pengaturan yang aktif ditemukan.");
                }
                
            } catch (error) {
                console.error("Gagal memuat ulang pengaturan sistem:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActiveSettings();
    }, []);

    // Panggil refetchSettings saat komponen pertama kali dimuat
    useEffect(() => {
        refetchSettings();
    }, [refetchSettings]);

    // Sediakan settings, status loading, dan fungsi refetch
    const value = { settings, isLoading, refetchSettings };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
