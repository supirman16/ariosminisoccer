import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { theme } from '../theme';
import AnimatedButton from '../components/AnimatedButton';
import { supabase } from '../supabaseClient';

const TournamentPage = ({ showNotification }) => {
    const [registrations, setRegistrations] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(true);

    const fetchConfirmedRegistrations = async () => {
        setIsLoadingSlots(true);
        const { data, error } = await supabase
            .from('tournament_registrations')
            .select('tournament_id, status')
            .eq('status', 'confirmed');

        if (error) {
            console.error("Gagal mengambil sisa slot turnamen:", error);
        } else {
            setRegistrations(data || []);
        }
        setIsLoadingSlots(false);
    };

    useEffect(() => {
        fetchConfirmedRegistrations();
    }, []);

    // Mengambil slot sisa turnamen (Batas max tim per turnamen = 16)
    const getRemainingSlots = (tournamentId) => {
        if (isLoadingSlots) return '...';
        const confirmedCount = registrations.filter(r => String(r.tournament_id) === String(tournamentId)).length;
        const remaining = 16 - confirmedCount;
        return remaining <= 0 ? 'Full' : `Sisa ${remaining} Slot`;
    };

    const tournaments = [
        {
            id: 1,
            title: "Arios Cup 2026",
            date: "15 - 18 Juli 2026",
            prize: "Rp 15.000.000",
            fee: "Rp 500.000 / Tim",
            slots: getRemainingSlots(1),
            description: "Turnamen minisoccer amatir 7v7 terbesar musim panas ini. Daftarkan tim terbaikmu sekarang dan rebut piala bergilir Arios Cup!"
        },
        {
            id: 2,
            title: "Independence Day League",
            date: "15 - 17 Agustus 2026",
            prize: "Rp 25.000.000",
            fee: "Rp 750.000 / Tim",
            slots: getRemainingSlots(2),
            description: "Liga merdeka memperingati hari kemerdekaan Indonesia. Kompetisi ketat 7v7 dengan format setengah kompetisi."
        }
    ];

    const [formData, setFormData] = useState({
        teamName: '',
        managerName: '',
        whatsapp: '',
        email: '',
        tournamentId: '1',
        playersCount: '12'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('tournament_registrations')
                .insert([
                    {
                        team_name: formData.teamName,
                        manager_name: formData.managerName,
                        whatsapp: formData.whatsapp,
                        email: formData.email,
                        tournament_id: parseInt(formData.tournamentId),
                        players_count: parseInt(formData.playersCount),
                        status: 'pending'
                    }
                ]);

            if (error) {
                throw error;
            }

            showNotification('Pendaftaran tim berhasil dikirim! Silakan hubungi admin di WhatsApp untuk konfirmasi pembayaran.', 'success');
            
            // Reset form
            setFormData({
                teamName: '',
                managerName: '',
                whatsapp: '',
                email: '',
                tournamentId: '1',
                playersCount: '12'
            });

            // Refresh slots
            fetchConfirmedRegistrations();
        } catch (error) {
            showNotification('Gagal mengirim pendaftaran: ' + error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            key="tournament"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`-mt-24 pt-24 ${theme.colors.background} min-h-screen pb-20`}
        >
            <div className="container mx-auto max-w-6xl px-6 py-12">
                <h1 className={`text-5xl md:text-6xl ${theme.typography.display} ${theme.colors.textPrimary} text-center mb-4`}>Turnamen Arios</h1>
                <p className={`text-lg ${theme.colors.textSecondary} text-center max-w-3xl mx-auto mb-16`}>
                    Daftarkan tim sepak bola Anda di kompetisi resmi Arios Minisoccer. Tunjukkan kemampuan terbaik tim Anda dan menangkan hadiah jutaan rupiah!
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Event Schedule List */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className={`text-2xl ${theme.typography.headline} ${theme.colors.textPrimary} border-b border-gray-700 pb-3`}>Jadwal Event Mendatang</h2>
                        
                        <div className="space-y-6">
                            {tournaments.map(tournament => (
                                <div key={tournament.id} className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} shadow-lg space-y-4 hover:border-yellow-400 transition duration-300`}>
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                        <div>
                                            <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">{tournament.slots}</span>
                                            <h3 className={`text-2xl font-bold ${theme.colors.textPrimary} mt-2`}>{tournament.title}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-yellow-400 font-semibold text-lg">{tournament.prize}</p>
                                            <p className="text-xs text-gray-500">Total Hadiah</p>
                                        </div>
                                    </div>
                                    <p className={`${theme.colors.textSecondary} text-sm`}>{tournament.description}</p>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100 text-sm">
                                        <div>
                                            <p className="text-gray-400">Tanggal Pelaksanaan</p>
                                            <p className={`font-semibold ${theme.colors.textPrimary}`}>{tournament.date}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Biaya Pendaftaran</p>
                                            <p className={`font-semibold ${theme.colors.textPrimary}`}>{tournament.fee}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Format Game</p>
                                            <p className={`font-semibold ${theme.colors.textPrimary}`}>7 v 7 (Max 15 Pemain)</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div className="lg:col-span-1">
                        <h2 className={`text-2xl ${theme.typography.headline} ${theme.colors.textPrimary} border-b border-gray-700 pb-3 mb-6`}>Pendaftaran Online</h2>
                        
                        <form onSubmit={handleSubmit} className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} shadow-lg space-y-4`}>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Nama Tim</label>
                                <input
                                    id="teamName"
                                    type="text"
                                    placeholder="Cth: Arios FC"
                                    required
                                    value={formData.teamName}
                                    onChange={handleChange}
                                    className={`w-full p-3 bg-gray-50 border ${theme.colors.border} rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Nama Manajer / CP</label>
                                <input
                                    id="managerName"
                                    type="text"
                                    placeholder="Nama Lengkap Penanggung Jawab"
                                    required
                                    value={formData.managerName}
                                    onChange={handleChange}
                                    className={`w-full p-3 bg-gray-50 border ${theme.colors.border} rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Nomor WhatsApp</label>
                                <input
                                    id="whatsapp"
                                    type="tel"
                                    placeholder="Cth: 0812345678"
                                    required
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    className={`w-full p-3 bg-gray-50 border ${theme.colors.border} rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Cth: manager@team.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full p-3 bg-gray-50 border ${theme.colors.border} rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Pilih Turnamen</label>
                                <select
                                    id="tournamentId"
                                    value={formData.tournamentId}
                                    onChange={handleChange}
                                    className={`w-full p-3 bg-white border ${theme.colors.border} rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                                >
                                    <option value="1">Arios Cup 2026</option>
                                    <option value="2">Independence Day League</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Jumlah Anggota Skuad</label>
                                <select
                                    id="playersCount"
                                    value={formData.playersCount}
                                    onChange={handleChange}
                                    className={`w-full p-3 bg-white border ${theme.colors.border} rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                                >
                                    <option value="10">10 Pemain</option>
                                    <option value="12">12 Pemain</option>
                                    <option value="14">14 Pemain</option>
                                    <option value="15">15 Pemain</option>
                                </select>
                            </div>

                            <AnimatedButton
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full ${theme.colors.primary} ${theme.colors.textOnPrimary} font-bold py-3 rounded-md mt-4 ${theme.colors.primaryHover} disabled:bg-gray-300`}
                            >
                                {isSubmitting ? 'Mengirim Pendaftaran...' : 'Daftarkan Tim Sekarang'}
                            </AnimatedButton>
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TournamentPage;
