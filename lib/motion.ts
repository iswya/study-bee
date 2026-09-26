import type { Transition, Variants } from "motion/react";

// Shared motion presets so every animation in the app feels the same.

export const spring: Transition = { type: "spring", stiffness: 380, damping: 30 };
export const softSpring: Transition = { type: "spring", stiffness: 200, damping: 26 };
export const ease = [0.22, 1, 0.36, 1] as const; // quick out, gentle settle

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
};

// Hover / press feel for anything clickable that's card-shaped.
export const liftHover = { y: -3, transition: spring };
export const pressTap = { scale: 0.97 };
