"use client";

import { motion } from "motion/react";
import { entranceContent } from "./content";

// DOM overlay, not 3D text — real semantic HTML so screen readers and
// crawlers see the same headline a sighted visitor does. See
// docs/07-accessibility-and-testing.md "parallel semantic document
// structure" and docs/06-animation-bible.md "UI motion" for the spring
// timing rationale.
export function EntranceOverlay() {
  return (
    <div className="pointer-events-none relative flex h-full flex-col items-center justify-center px-6 text-center">
      {/* Adaptive scrim — see docs/01-design-specification.md §3.2. The
          archway's crossbar sits right behind this text at some scroll
          positions; a hard-edged card would fight the "text belongs to the
          world" feel, so this is a soft radial falloff instead. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 480px 320px at center, var(--scrim) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.75, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
        className="text-sm tracking-wide text-[var(--ink-inverse)] uppercase"
      >
        {entranceContent.eyebrow}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.25 }}
        className="mt-2 font-[family-name:var(--font-display)] text-6xl text-[var(--ink-inverse)] sm:text-7xl"
      >
        {entranceContent.heading}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.4 }}
        className="mt-4 max-w-md text-lg text-[var(--ink-inverse)]"
      >
        {entranceContent.subheading}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="mt-10 text-xs tracking-widest text-[var(--ink-inverse)] uppercase"
      >
        {entranceContent.cta}
      </motion.p>
    </div>
  );
}
