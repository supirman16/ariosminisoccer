import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../theme';
import AnimatedButton from '../components/AnimatedButton';

const RegisterPage = ({ setView }) => {
    return (
        <motion.div
            key="register"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 min-h-screen flex items-center justify-center bg-cover bg-center" 
            style={{ backgroundImage: "url('/Background Website 3.png')" }}
        >
            <div className={`p-8 rounded-2xl ${theme.glass.body} max-w-md w-full text-center border border-white/10 shadow-2xl`}>
                <div className="mx-auto w-16 h-16 bg-yellow-400/20 text-yellow-400 flex items-center justify-center rounded-full mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className={`text-2xl font-extrabold ${theme.glass.heading} mb-4`}>Registrasi Ditutup Sementara</h2>
                <p className={`${theme.glass.text} text-sm mb-8 leading-relaxed`}>
                    Pembuatan akun baru saat ini sedang dinonaktifkan untuk pemeliharaan sistem. Anda tetap dapat melakukan pemesanan lapangan secara langsung melalui platform Ayo.co.id.
                </p>
                <div className="space-y-3">
                    <AnimatedButton 
                        onClick={() => window.location.href = 'https://ayo.co.id/v/arios-minisoccer'} 
                        className={`w-full ${theme.colors.primary} ${theme.colors.textOnPrimary} font-bold py-3 rounded-full hover:bg-yellow-300 shadow-lg shadow-yellow-400/20`}
                    >
                        Booking via Ayo.co.id
                    </AnimatedButton>
                    <button 
                        onClick={() => setView('home')} 
                        className="w-full text-white hover:text-yellow-400 font-semibold py-2 text-sm transition"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default RegisterPage;