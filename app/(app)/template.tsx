"use client";

import { motion } from "motion/react";
import { ease } from "@/lib/motion";

// Re-mounts on every navigation, giving each page a soft entrance.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
    >
      {children}
    </motion.div>
  );
}
