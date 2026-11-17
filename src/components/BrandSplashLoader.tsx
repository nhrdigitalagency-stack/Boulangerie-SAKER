import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BRAND_CONFIG } from '../config/brand';

export const BrandSplashLoader: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    // Fermeture naturelle sous 2,2 s (toujours <= 3 secondes)
    const hideDelay = shouldReduceMotion ? 650 : 2150;
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, hideDelay);

    return () => window.clearTimeout(timer);
  }, [shouldReduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="saker-brand-splash"
          aria-label="Chargement de la Boulangerie SAKER"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: shouldReduceMotion ? 0.2 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          className="fixed inset-0 z-[100] bg-[#FAF7F2] flex flex-col items-center justify-center px-6 select-none"
        >
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center gap-5"
          >
            <img
              src={BRAND_CONFIG.logos.primary}
              alt="Boulangerie SAKER"
              className="h-20 sm:h-24 w-auto object-contain"
            />

            <div className="space-y-2.5 flex flex-col items-center">
              <div className="w-44 sm:w-52 h-[3px] rounded-full bg-[#E6DEC8] overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.4 : 1.75,
                    ease: [0.25, 0.8, 0.25, 1],
                  }}
                  style={{ transformOrigin: 'left center' }}
                  className="h-full w-full bg-[#E31E24] rounded-full"
                />
              </div>

              <p className="text-[11px] sm:text-xs font-medium tracking-[0.16em] uppercase text-[#5C534C]">
                Douala · Depuis 1990
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
