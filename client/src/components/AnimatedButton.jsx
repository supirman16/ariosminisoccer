import React from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({ children, onClick, className = '', disabled = false }) => {
    // Definisikan varian animasi
    const buttonVariants = {
        hover: {
            scale: 1.05,
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.95
        }
    };

    return (
        <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={onClick}
            disabled={disabled}
            className={className}
        >
            {children}
        </motion.button>
    );
};

export default AnimatedButton;
