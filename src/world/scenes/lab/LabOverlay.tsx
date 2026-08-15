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
/**
 * One overlay, two biomes. Ancient Grove shows the SDE track and Mechanical
 * Jungle the AI/ML track — same interaction, same keyboard affordances, and
 * the split is carried by *where you are* rather than by a heading inside a
 * shared panel.
 */
function TrackOverlay({ trackId }: { trackId: "sde" | "aiml" }) {
  const openDeepDive = useWorldStore((s) => s.openDeepDive);
  const track = labContent.tracks.find((t) => t.id === trackId)!;

  return (
    <div className="pointer-events-none flex h-full flex-col items-start justify-between px-8 py-28">
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 20 }}
          className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink-inverse)]"
        >
          {track.label}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.15 }}
          className="mt-2 max-w-sm text-[var(--ink-inverse)]"
        >
          {track.blurb}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="pointer-events-auto max-h-[60vh] max-w-sm overflow-y-auto rounded-lg bg-[var(--scrim)] p-5 backdrop-blur-sm"
      >
        <ul className="flex flex-col gap-1">
          {track.projects.map((project) => (
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

export function GroveOverlay() {
  return <TrackOverlay trackId="sde" />;
}

export function JungleOverlay() {
  return <TrackOverlay trackId="aiml" />;
}
