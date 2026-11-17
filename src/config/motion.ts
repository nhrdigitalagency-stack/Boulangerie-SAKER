import type { MotionProps } from 'motion/react';

/**
 * Système d'animation centralisé — Boulangerie SAKER
 * Transitions fluides, tactiles et gourmandes sans rebond excessif.
 */
export const SAKER_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const SAKER_DURATIONS = {
  fast: 0.16,       // Retour immédiat sur boutons / icônes (120–180 ms)
  standard: 0.22,   // Survol de cartes produits et catégories (180–260 ms)
  drawer: 0.28,     // Ouverture / fermeture du tiroir panier et modales (220–320 ms)
  editorial: 0.52,  // Révélation éditoriale des sections au défilement (400–650 ms)
} as const;

export const SAKER_MOTION = {
  revealDistance: 18,
  cardHoverLift: -4,
  cardHoverScale: 1.015,
  buttonHoverScale: 1.025,
  buttonTapScale: 0.96,
  imageHoverScale: 1.03,
  staggerStep: 0.05,
} as const;

export function getSectionRevealProps(
  shouldReduceMotion: boolean | null,
  delay = 0
): Partial<MotionProps> {
  if (shouldReduceMotion) {
    return {
      initial: false,
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.1 },
    };
  }

  return {
    initial: { opacity: 0, y: SAKER_MOTION.revealDistance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: {
      duration: SAKER_DURATIONS.editorial,
      delay,
      ease: SAKER_EASE,
    },
  };
}
