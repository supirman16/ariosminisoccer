import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { theme } from '../theme';
import AnimatedButton from '../components/AnimatedButton';
import { supabase } from '../supabaseClient'; // <-- Impor Supabase client

const LoginPage = ({ onLoginSuccess, setView }) => {
    const [formData, setFormData] = useState({ email: '', password: '' }); // <-- Diubah ke email
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // --- LOGIKA BARU MENGGUNAKAN SUPABASE ---
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            // Ambil detail profil dari tabel 'profiles'
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, nama_lengkap, nomor_telepon, role')
                .eq('id', data.user.id)
                .single();

            if (profileError) throw profileError;

            // Gabungkan data auth dan profil untuk dikirim ke App.jsx
            const user = {
                id: data.user.id,
                email: data.user.email,
                ...profileData
            };
            
            onLoginSuccess(user);

        } catch (error) {
            alert(error.error_description || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            key="login"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 min-h-screen flex items-center justify-center bg-cover bg-center" 
            style={{ backgroundImage: "url('/Background Website 3.png')" }}
        >
            <div className={`p-8 rounded-lg ${theme.glass.body} max-w-sm w-full`}>
                <h2 className={`text-center text-3xl ${theme.typography.headline} ${theme.glass.heading} mb-8`}>Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input id="email" type="email" placeholder="Email" required className={`w-full p-3 rounded-md border ${theme.glass.input}`} value={formData.email} onChange={handleChange} />
                    <input id="password" type="password" placeholder="Password" required className={`w-full p-3 rounded-md border ${theme.glass.input}`} value={formData.password} onChange={handleChange} />
                    <AnimatedButton type="submit" disabled={isLoading} className={`w-full ${theme.colors.primary} ${theme.colors.textOnPrimary} font-bold py-3 rounded-full ${theme.colors.primaryHover} disabled:bg-gray-300`}>
                        {isLoading ? 'Memproses...' : 'Login'}
                    </AnimatedButton>
                </form>
                <p className={`text-center ${theme.glass.text} mt-6`}>
                    Belum punya akun?{' '}
                    <button onClick={() => setView('register')} className={theme.glass.link}>
                        Daftar di sini
                    </button>
                </p>
            </div>
        </motion.div>
    );
};

export default LoginPage;