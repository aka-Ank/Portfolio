"use client";

import { motion } from "motion/react";
import { campfireContent } from "./content";

// The journey's close — deliberately the calmest, plainest overlay in the
// whole site. No environmental storytelling tricks left; per
// docs/03-scene-graph.md §7, "the journey has earned a direct ask."
export function CampfireOverlay() {
  return (
    <div className="pointer-events-none flex h-full flex-col items-center justify-center px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 22 }}
        className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink-inverse)]"
      >
        {campfireContent.heading}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 22, delay: 0.15 }}
        className="mt-3 max-w-sm text-[var(--ink-inverse)]"
      >
        {campfireContent.body}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 22, delay: 0.3 }}
        className="pointer-events-auto mt-8 flex flex-col items-center gap-4"
      >
        <a
          href={`mailto:${campfireContent.email}`}
          className="rounded-md bg-[var(--primary)] px-6 py-3 text-[var(--primary-foreground)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          {campfireContent.email}
        </a>
        <div className="flex gap-6 text-sm text-[var(--ink-inverse)]">
          {campfireContent.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
