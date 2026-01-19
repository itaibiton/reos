import type { Variants, Transition } from "framer-motion";

// ============================================================================
// Transition Presets
// ============================================================================

export const springBounce: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

export const springSmooth: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 14,
};

export const easeOutQuart: Transition = {
  duration: 0.6,
  ease: [0.25, 1, 0.5, 1],
};

// ============================================================================
// Container Variants (for staggered children)
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

// ============================================================================
// Fade Variants
// ============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ============================================================================
// Scale Variants
// ============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const scaleInSpring: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springBounce,
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
};

// ============================================================================
// Clip Path Reveal Variants
// ============================================================================

export const clipRevealFromBottom: Variants = {
  hidden: {
    clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
    opacity: 0,
  },
  visible: {
    clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
  },
};

export const clipRevealFromTop: Variants = {
  hidden: {
    clipPath: "polygon(0 0%, 100% 0%, 100% 0%, 0 0%)",
    opacity: 0,
  },
  visible: {
    clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
  },
};

export const clipRevealFromLeft: Variants = {
  hidden: {
    clipPath: "polygon(0 0%, 0 0%, 0 100%, 0 100%)",
    opacity: 0,
  },
  visible: {
    clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
  },
};

// ============================================================================
// Rotate Variants
// ============================================================================

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: springSmooth,
  },
};

export const spinIn: Variants = {
  hidden: { opacity: 0, rotate: -180, scale: 0 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

// ============================================================================
// Card Variants (3D tilt effects)
// ============================================================================

export const cardDeal: Variants = {
  hidden: {
    opacity: 0,
    rotateY: 90,
    scale: 0.8,
  },
  visible: (i: number = 0) => ({
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      delay: i * 0.15,
    },
  }),
};

export const cardLift: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    rotateX: -15,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 20,
    },
  },
};

// ============================================================================
// Path Drawing Variants (for SVG)
// ============================================================================

export const pathDraw: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: "easeInOut" },
      opacity: { duration: 0.3 },
    },
  },
};

export const pathDrawFast: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.8, ease: "easeOut" },
      opacity: { duration: 0.2 },
    },
  },
};

// ============================================================================
// Pulse / Glow Variants
// ============================================================================

export const pulseGlow: Variants = {
  hidden: { scale: 1, opacity: 0.5 },
  visible: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const nodeFloat: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// Accordion / Expand Variants
// ============================================================================

export const accordionExpand: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: "easeInOut" },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: "easeInOut" },
      opacity: { duration: 0.3, delay: 0.1 },
    },
  },
};

export const chevronRotate: Variants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 },
};

// ============================================================================
// Reduced Motion Variants
// These should be used when prefers-reduced-motion is enabled
// ============================================================================

export const reducedMotionInstant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
};

export const reducedMotionContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
};

// ============================================================================
// Utility: Get motion-safe variants
// ============================================================================

/**
 * Returns the appropriate variant based on reduced motion preference
 */
export function getMotionSafeVariants(
  variants: Variants,
  shouldReduceMotion: boolean | null
): Variants {
  return shouldReduceMotion ? reducedMotionInstant : variants;
}

/**
 * Returns motion-safe container variants
 */
export function getMotionSafeContainer(
  variants: Variants,
  shouldReduceMotion: boolean | null
): Variants {
  return shouldReduceMotion ? reducedMotionContainer : variants;
}
