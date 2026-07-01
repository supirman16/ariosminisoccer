import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import AnimatedButton from '../AnimatedButton';
import { supabase } from '../../supabaseClient';

const TournamentManagement = () => {
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchRegistrations = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('tournament_registrations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching tournament registrations:", error);
        } else {
            setRegistrations(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        const { error } = await supabase
            .from('tournament_registrations')
            .update({ status })
            .eq('id', id);

        if (error) {
            alert(error.message);
        } else {
            alert(`Status pendaftaran berhasil diubah menjadi ${status}.`);
            fetchRegistrations();
        }
    };

    const handleDelete = async (id, teamName) => {
        if (!window.confirm(`Yakin ingin menghapus pendaftaran tim "${teamName}"?`)) return;
        const { error } = await supabase
            .from('tournament_registrations')
            .delete()
            .eq('id', id);

        if (error) {
            alert(error.message);
        } else {
            alert('Pendaftaran berhasil dihapus.');
            fetchRegistrations();
        }
    };

    const getTournamentName = (id) => {
        switch (String(id)) {
            case '1': return 'Arios Cup 2026';
            case '2': return 'Independence Day League';
            default: return 'Turnamen Umum';
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        if (filterStatus === 'all') return true;
        return reg.status === filterStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className={`${theme.colors.surface} p-6 rounded-lg border ${theme.colors.border} ${theme.shadows.medium} text-black`}>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h3 className={`text-xl font-bold ${theme.colors.textPrimary}`}>Pendaftaran Turnamen Online</h3>
                
                <div className="flex bg-gray-150 rounded-lg p-1 text-xs">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1.5 rounded-md font-semibold transition ${filterStatus === 'all' ? 'bg-yellow-400 text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Semua ({registrations.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-3 py-1.5 rounded-md font-semibold transition ${filterStatus === 'pending' ? 'bg-yellow-400 text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Pending ({registrations.filter(r => r.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('confirmed')}
                        className={`px-3 py-1.5 rounded-md font-semibold transition ${filterStatus === 'confirmed' ? 'bg-yellow-400 text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Confirmed ({registrations.filter(r => r.status === 'confirmed').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('cancelled')}
                        className={`px-3 py-1.5 rounded-md font-semibold transition ${filterStatus === 'cancelled' ? 'bg-yellow-400 text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Cancelled ({registrations.filter(r => r.status === 'cancelled').length})
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                {isLoading ? (
                    <p className="text-gray-500 text-center py-8">Memuat data pendaftaran...</p>
                ) : filteredRegistrations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Belum ada tim terdaftar dalam kategori ini.</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left font-bold text-gray-700">Nama Tim</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700">Manajer / CP</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700">Turnamen</th>
                                <th className="px-4 py-3 text-center font-bold text-gray-700">Pemain</th>
                                <th className="px-4 py-3 text-center font-bold text-gray-700">Status</th>
                                <th className="px-4 py-3 text-right font-bold text-gray-700">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRegistrations.map((reg) => (
                                <tr key={reg.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-4 py-3 font-semibold text-gray-900">{reg.team_name}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-gray-800 font-medium">{reg.manager_name}</p>
                                        <p className="text-gray-500 text-xs">Email: {reg.email}</p>
                                        <a 
                                            href={`https://wa.me/${reg.whatsapp.replace(/^0/, '62')}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-0.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.405.002 9.805-4.394 9.807-9.8.001-2.615-1.013-5.074-2.855-6.918-1.843-1.844-4.296-2.86-6.91-2.863-5.412 0-9.813 4.399-9.816 9.803-.001 1.638.455 3.238 1.32 4.678L1.936 21.19l4.711-1.236zm11.517-6.962c-.3-.15-1.774-.875-2.048-.975-.274-.1-.474-.15-.674.15-.2.3-.774.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.794-1.49-1.775-1.665-2.075-.175-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.674-1.625-.924-2.225-.244-.589-.493-.51-.674-.519-.174-.009-.374-.01-.574-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.224 5.116 4.525.715.31 1.273.495 1.708.633.718.228 1.37.196 1.885.119.574-.085 1.774-.725 2.024-1.425.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z"/>
                                            </svg>
                                            {reg.whatsapp} (WhatsApp)
                                        </a>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-gray-800">{getTournamentName(reg.tournament_id)}</p>
                                        <p className="text-gray-400 text-xs">Pendaftaran: {new Date(reg.created_at).toLocaleDateString('id-ID')}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-900 font-semibold">{reg.players_count} Pemain</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(reg.status)}`}>
                                            {reg.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {reg.status === 'pending' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-xs transition"
                                                >
                                                    Konfirmasi
                                                </button>
                                            )}
                                            {reg.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(reg.id, 'cancelled')}
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-1 px-3 rounded text-xs transition"
                                                >
                                                    Batalkan
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(reg.id, reg.team_name)}
                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs transition"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TournamentManagement;
