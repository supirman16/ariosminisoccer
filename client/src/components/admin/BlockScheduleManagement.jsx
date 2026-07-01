import React, { useState, useEffect, useMemo } from 'react';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import { useSettings } from '../../contexts/SettingsContext';
import moment from 'moment';
import { supabase } from '../../supabaseClient';

const BlockScheduleManagement = () => {
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newBlock, setNewBlock] = useState({ date: '', times: [] });
    const { settings, isLoading: isSettingsLoading } = useSettings();

    const fetchBlockedSlots = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('blocked_slots')
            .select('*')
            .order('block_date', { ascending: false });
        
        if (error) console.error("Error fetching blocked slots:", error);
        else setBlockedSlots(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchBlockedSlots();
    }, []);

    const handleTimeToggle = (time) => {
        setNewBlock(prev => {
            const newTimes = prev.times.includes(time)
                ? prev.times.filter(t => t !== time)
                : [...prev.times, time];
            return { ...prev, times: newTimes };
        });
    };

    const handleBlockSubmit = async () => {
        if (!newBlock.date || newBlock.times.length === 0) {
            alert('Pilih tanggal dan minimal satu jam.');
            return;
        }
        const slotsToInsert = newBlock.times.map(time => ({
            block_date: newBlock.date,
            start_time: time,
            reason: newBlock.reason || null
        }));

        const { error } = await supabase.from('blocked_slots').insert(slotsToInsert);

        if (error) {
            alert(error.message);
        } else {
            alert(`${newBlock.times.length} jadwal berhasil diblokir.`);
            setNewBlock({ date: '', times: [] });
            fetchBlockedSlots();
        }
    };

    const handleUnblock = async (id) => {
        if (!window.confirm('Yakin ingin membuka blokir jadwal ini?')) return;
        const { error } = await supabase.from('blocked_slots').delete().eq('id', id);
        if (error) {
            alert(error.message);
        } else {
            alert('Jadwal berhasil dibuka.');
            fetchBlockedSlots();
        }
    };

    const allTimeSlots = useMemo(() => {
        if (isSettingsLoading || !settings) return [];
        const open = parseInt(settings.opening_hour);
        const close = parseInt(settings.closing_hour);
        return Array.from({ length: close - open + 1 }, (_, i) => `${String(i + open).padStart(2, '0')}:00:00`);
    }, [settings, isSettingsLoading]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Blokir Jadwal Baru</h3>
                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-semibold ${theme.colors.textSecondary} mb-1`}>Pilih Tanggal</label>
                        <input type="date" value={newBlock.date} onChange={e => setNewBlock({ ...newBlock, date: e.target.value })} className={`w-full p-2 bg-gray-100 rounded-md ${theme.colors.textPrimary} border ${theme.colors.border}`} />
                    </div>
                    <div>
                        <label className={`block text-sm font-semibold ${theme.colors.textSecondary} mb-2`}>Pilih Jam (bisa lebih dari satu)</label>
                        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                            {allTimeSlots.map(time => (
                                <button 
                                    key={time}
                                    onClick={() => handleTimeToggle(time)}
                                    className={`p-2 text-sm rounded-md border ${newBlock.times.includes(time) ? 'bg-yellow-400 text-black font-bold' : 'bg-white'}`}
                                >
                                    {time.substring(0, 5)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <AnimatedButton onClick={handleBlockSubmit} className={`w-full bg-red-600 text-white font-bold py-3 rounded-md`}>
                        Blokir Jadwal Terpilih
                    </AnimatedButton>
                </div>
            </div>
            <div className={`md:col-span-2 ${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium}`}>
                <h3 className={`text-xl font-bold ${theme.colors.textPrimary} mb-4`}>Daftar Jadwal yang Diblokir</h3>
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? <p>Memuat...</p> : (
                        <div className="space-y-3">
                            {blockedSlots.map(slot => (
                                <div key={slot.id} className={`bg-gray-100 p-3 rounded-md flex justify-between items-center border ${theme.colors.border}`}>
                                    <div>
                                        <p className="font-semibold">{moment(slot.block_date).format('dddd, D MMMM YYYY')}</p>
                                        <p className="text-gray-600">Jam: {slot.start_time.substring(0, 5)}</p>
                                    </div>
                                    <button onClick={() => handleUnblock(slot.id)} className="text-sm text-green-600 font-semibold hover:underline">Buka Blokir</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlockScheduleManagement;
