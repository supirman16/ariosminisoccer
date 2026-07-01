import React, { useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
    // Jika tidak ada pesan, jangan tampilkan apa-apa
    if (!message) {
        return null;
    }

    // Atur agar notifikasi hilang otomatis setelah 5 detik
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        // Bersihkan timer jika komponen di-unmount
        return () => clearTimeout(timer);
    }, [message, onClose]);

    // Tentukan warna berdasarkan tipe notifikasi (sukses atau error)
    const baseStyle = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-transform transform-gpu animate-slide-in";
    const typeStyle = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`${baseStyle} ${typeStyle}`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 font-bold">X</button>
        </div>
    );
};

// Tambahkan beberapa style untuk animasi
const animationStyle = `
@keyframes slide-in {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
.animate-slide-in {
    animation: slide-in 0.5s ease-out forwards;
}
`;

// Cara untuk menyisipkan style ke dalam dokumen
const StyleInjector = () => <style>{animationStyle}</style>;

// Ekspor komponen utama dan injector style
export { Notification, StyleInjector };
