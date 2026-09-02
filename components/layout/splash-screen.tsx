'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function SplashScreen() {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // If it was already shown in a previous session or page load, it's hidden by the inline script via CSS variable.
    // We update our React state so we don't render the DOM nodes unnecessarily after hydration.
    const hasShownSplash = sessionStorage.getItem('agrirent_splash_shown');
    if (hasShownSplash) {
      setIsHidden(true);
      return;
    }

    // It's the first load, so we animate out after 2 seconds
    const timer1 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    const timer2 = setTimeout(() => {
      setIsHidden(true);
      sessionStorage.setItem('agrirent_splash_shown', 'true');
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (isHidden) return null;

  return (
    <div
      style={{ display: 'var(--splash-display, flex)' }}
      className={`fixed inset-0 z-[9999] flex-col items-center justify-center bg-green-50 transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6 drop-shadow-xl">
          <Image
            src="/icon.svg"
            alt="Agriform Logo"
            fill
            priority
            className="object-contain"
          />
        </div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl font-bold text-green-700 tracking-tight"
        >
          Agriform
        </motion.h1>
      </motion.div>
    </div>
  );
}
