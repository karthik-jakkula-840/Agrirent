'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function SplashScreen() {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Check if splash was already shown in this tab session
    const hasShownSplash = sessionStorage.getItem('agrirent_splash_shown');
    if (hasShownSplash) {
      setIsHidden(true);
      return;
    }

    // Display for 1.8 seconds, then fade out smoothly
    const timer1 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    const timer2 = setTimeout(() => {
      setIsHidden(true);
      sessionStorage.setItem('agrirent_splash_shown', 'true');
    }, 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (isHidden) return null;

  return (
    <div
      style={{ display: 'var(--splash-display, flex)' }}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#f8fcf9] transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center relative z-10 px-6 text-center"
      >
        {/* App Icon Container */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 drop-shadow-[0_12px_24px_rgba(0,155,85,0.18)]">
          <Image
            src="/icon.svg"
            alt="AgriRent Logo"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* Brand Name */}
        <motion.h1
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950 mb-2"
        >
          Agri<span className="text-[#009b55]">Rent</span>
        </motion.h1>

        {/* Subtitle / Tagline */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-xs sm:text-sm text-gray-500 font-medium tracking-wide max-w-xs"
        >
          India's Smart Equipment Rental Marketplace
        </motion.p>

        {/* Modern Minimal Progress Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-36 sm:w-44 h-1 bg-emerald-100 rounded-full overflow-hidden mt-8"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.2, 
              ease: 'easeInOut' 
            }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#009b55] to-transparent rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
