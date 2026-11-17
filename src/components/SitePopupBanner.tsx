import React, { useEffect, useState } from 'react';
import { ArrowRight, Megaphone, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useSiteData } from '../context/SiteDataContext';
import { CmsPopup } from '../data/cmsTypes';
import { ActivePage } from './LeftNavigation';

interface SitePopupBannerProps {
  onNavigate: (page: ActivePage, categorySlug?: string) => void;
  disabled?: boolean;
  previewPopup?: CmsPopup | null;
  onClosePreview?: () => void;
}

const POPUP_STORAGE_PREFIX = 'saker_popup_seen_v1_';

export const SitePopupBanner: React.FC<SitePopupBannerProps> = ({
  onNavigate,
  disabled = false,
  previewPopup = null,
  onClosePreview,
}) => {
  const { activePopups } = useSiteData();
  const shouldReduceMotion = useReducedMotion();
  const [visiblePopup, setVisiblePopup] = useState<CmsPopup | null>(null);

  const targetPopup = previewPopup || activePopups[0] || null;

  useEffect(() => {
    if (previewPopup) {
      setVisiblePopup(previewPopup);
      return;
    }

    if (disabled || !targetPopup) {
      setVisiblePopup(null);
      return;
    }

    // Vérifier la fréquence d'affichage enregistrée
    const storageKey = `${POPUP_STORAGE_PREFIX}${targetPopup._id}`;
    if (targetPopup.frequency === 'once_per_session') {
      try {
        if (sessionStorage.getItem(storageKey)) return;
      } catch {
        // ignore
      }
    } else if (targetPopup.frequency === 'once_per_day') {
      try {
        const lastSeen = localStorage.getItem(storageKey);
        if (lastSeen && Date.now() - Number(lastSeen) < 24 * 60 * 60 * 1000) {
          return;
        }
      } catch {
        // ignore
      }
    }

    const delayMs = Math.max(0, Number(targetPopup.triggerDelaySeconds || 2)) * 1000;
    const timer = window.setTimeout(() => {
      setVisiblePopup(targetPopup);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [disabled, targetPopup, previewPopup]);

  const markAsSeen = (popup: CmsPopup) => {
    if (previewPopup) return;
    const storageKey = `${POPUP_STORAGE_PREFIX}${popup._id}`;
    try {
      if (popup.frequency === 'once_per_session') {
        sessionStorage.setItem(storageKey, '1');
      } else if (popup.frequency === 'once_per_day') {
        localStorage.setItem(storageKey, String(Date.now()));
      }
    } catch {
      // ignore
    }
  };

  const handleClose = () => {
    if (visiblePopup) {
      markAsSeen(visiblePopup);
    }
    setVisiblePopup(null);
    if (onClosePreview) {
      onClosePreview();
    }
  };

  useEffect(() => {
    if (!visiblePopup) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handleCta = () => {
    if (!visiblePopup) return;
    markAsSeen(visiblePopup);
    setVisiblePopup(null);
    if (onClosePreview) {
      onClosePreview();
    }
    onNavigate(
      visiblePopup.ctaTargetPage || 'shop',
      visiblePopup.ctaCategorySlug || 'all'
    );
  };

  return (
    <AnimatePresence>
      {visiblePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="saker-site-popup-title"
        >
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#2A1810]/55"
            aria-hidden="true"
          />

          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg bg-white rounded-[20px] border border-[#E6DEC8] shadow-2xl overflow-hidden"
          >
            {visiblePopup.imageUrl && (
              <div className="aspect-[16/9] w-full bg-[#F5EFE6] border-b border-[#E6DEC8] overflow-hidden relative">
                <img
                  src={visiblePopup.imageUrl}
                  alt={visiblePopup.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Fermer l’annonce"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-[#212529] shadow-md flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}

            <div className="p-6 sm:p-7 space-y-4">
              {!visiblePopup.imageUrl && (
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31E24]">
                    <Megaphone className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{visiblePopup.eyebrow || 'Annonce Boulangerie SAKER'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Fermer l’annonce"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C534C] hover:bg-[#FAF7F2] transition-colors"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              {visiblePopup.imageUrl && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31E24]">
                  <Megaphone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{visiblePopup.eyebrow || 'Annonce Boulangerie SAKER'}</span>
                </div>
              )}

              <h2
                id="saker-site-popup-title"
                className="text-xl sm:text-2xl font-bold text-[#212529] leading-snug"
              >
                {visiblePopup.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#5C534C] leading-relaxed">
                {visiblePopup.message}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#EFE9DC] border border-[#E6DEC8] text-xs font-semibold text-[#5C534C] transition-colors"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleCta}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                >
                  <span>{visiblePopup.ctaLabel || 'Découvrir'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
