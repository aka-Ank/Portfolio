"use client";

import { motion } from "motion/react";
import { labContent } from "./content";
import { useWorldStore } from "@/world/state/useWorldStore";

// The 3D project consoles are a bare R3F <group onClick> — not a real DOM
// button, so a keyboard-only visitor has no way to open a deep-dive at all
// (not just "no hover equivalent" — no way in, period). This panel gives
// every project a real, focusable, Enter/Space-activatable button wired to
// the exact same openDeepDive() the console's onClick calls, so the two
// paths are equivalent, not approximations of each other. See
// ENGINEER_NOTES.md "Creature/milestone hover has no keyboard equivalent."
export function LabOverlay() {
  const openDeepDive = useWorldStore((s) => s.openDeepDive);

  return (
    <div className="pointer-events-none flex h-full flex-col items-start justify-between px-8 py-28">
      <div>
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="pointer-events-auto max-h-[60vh] max-w-sm overflow-y-auto rounded-lg bg-[var(--scrim)] p-5 backdrop-blur-sm"
      >
        <div className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--ink-inverse)] uppercase opacity-70">
          Projects
        </div>
        <ul className="mt-2 flex flex-col gap-1">
          {labContent.projects.map((project) => (
            <li key={project.slug}>
              <button
                onClick={() => openDeepDive(project.slug)}
                className="w-full rounded-md px-2 py-1.5 text-left outline-offset-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
              >
                <span className="text-sm text-[var(--ink-inverse)]">{project.title}</span>
                <span className="mt-0.5 block text-xs text-[var(--ink-inverse)]/70">
                  {project.summary}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
