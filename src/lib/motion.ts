import type { Variants, Transition } from "framer-motion";

/**
 * Motion language for Durga OS.
 *
 * All easings reference Apple/Linear's preferred curve [0.22, 1, 0.36, 1] —
 * a soft cubic-bezier that decelerates without snapping. Spring presets
 * are tuned to feel weighty but responsive — physics-based, never bouncy.
 *
 * Rule: NEVER mix easings. Pick one preset per surface and stay consistent.
 */

export const easeOut = [0.22, 1, 0.36, 1] as const;
export const easeInOut = [0.65, 0, 0.35, 1] as const;

export const springSoft: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 24,
  mass: 1,
};

export const springSnap: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.6,
};

/* Fade + rise — the default reveal for any block-level element */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOut },
  },
};

/* Staggered children container — pair with `fadeUp` items */
export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

/* Tighter, faster stagger for HUD readouts */
export const staggerFast: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

/* Cinematic blur-in — for hero text only, use sparingly */
export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(20px)", y: 12 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 1.2, ease: easeOut },
  },
};

/* Floating card — gentle perpetual hover for ambient UI */
export const floatY = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 6, repeat: Infinity, ease: easeInOut },
  },
};

/* Hover lift — for cards and buttons */
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: { y: -3, scale: 1.005, transition: springSnap },
};
