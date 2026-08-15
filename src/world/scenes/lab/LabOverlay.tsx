"use client";

import { motion } from "motion/react";
import { labContent } from "./content";

export function LabOverlay() {
  return (
    <div className="pointer-events-none flex h-full flex-col items-start justify-start px-8 pt-28">
      <motion.h2
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 110, damping: 20 }}
        className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink-inverse)]"
      >
        {labContent.heading}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0.85, x: 0 }}
        transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.15 }}
        className="mt-2 max-w-sm text-[var(--ink-inverse)]"
      >
        {labContent.intro}
      </motion.p>
    </div>
  );
}
