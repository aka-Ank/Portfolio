"use client";

import { motion } from "motion/react";
import { clearingContent } from "./content";

export function ClearingOverlay() {
  return (
    <div className="pointer-events-none flex h-full flex-col items-center justify-center px-6">
      <div className="pointer-events-auto max-w-lg rounded-lg bg-[var(--scrim)] p-8 backdrop-blur-sm">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 20 }}
          className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink-inverse)]"
        >
          {clearingContent.heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.1 }}
          className="mt-1 text-sm tracking-wide text-[var(--ink-inverse)] uppercase"
        >
          {clearingContent.role}
        </motion.p>

        {clearingContent.bio.map((paragraph, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ type: "spring", stiffness: 110, damping: 22, delay: 0.2 + i * 0.1 }}
            className="mt-4 text-[var(--ink-inverse)]"
          >
            {paragraph}
          </motion.p>
        ))}

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-6 flex flex-col gap-2 border-t border-white/15 pt-4"
        >
          {clearingContent.themes.map((theme) => (
            <li key={theme} className="text-sm text-[var(--ink-inverse)]/80">
              · {theme}
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
