import React from 'react';

// Palet warna baru yang terinspirasi dari referensi:
// Hitam pekat, putih bersih, dan aksen kuning cerah.
export const theme = {
    colors: {
        // Latar Belakang
        background: 'bg-white',
        surface: 'bg-white',
        darkSurface: 'bg-black',

        // Teks
        textPrimary: 'text-black',
        textSecondary: 'text-gray-700',
        textOnDark: 'text-white',

        // Warna Aksi (Primer) - Diperbarui menjadi Kuning
        primary: 'bg-yellow-400',
        primaryHover: 'hover:bg-yellow-300',
        textOnPrimary: 'text-black',

        // Warna Aksen - Disesuaikan menjadi Kuning
        accent: 'text-yellow-600',
        accentMuted: 'text-yellow-500',

        // Border / Garis Pemisah
        border: 'border-gray-200',
    },
    shadows: {
        medium: 'shadow-md',
        large: 'shadow-lg',
        extraLarge: 'shadow-xl',
    },
    typography: {
        display: 'font-extrabold tracking-tighter', // Untuk judul besar
        headline: 'font-bold',
    },
    glass: {
        body: 'bg-black/50 backdrop-blur-xl border border-white/20 shadow-xl',
        input: 'bg-white/10 border-white/20 text-white placeholder-gray-300',
        heading: 'text-white',
        text: 'text-gray-200',
        link: 'text-yellow-300 hover:underline font-semibold'
    }
};