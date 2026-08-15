"use client";

import { useProgress } from "@react-three/drei";
import { motion } from "motion/react";
import { about } from "@/content/about";

/**
 * A tasteful, fast preloader — docs/08-roadmap.md Phase 4: "prepares the
 * world without wasting the visitor's time." Tracks real asset load
 * progress via drei's useProgress (backed by three.js's LoadingManager, not
 * a fake timer) — for this build's lightweight procedural scenes that's
 * usually near-instant, so the bar is honest rather than padded.
 */
export function Preloader({ onEnter }: { onEnter: () => void }) {
  const { progress, active } = useProgress();
  // `active` is the right signal, not `progress >= 100`: this build's scenes
  // are entirely procedural (no glTF/texture loads through three.js's
  // LoadingManager), so progress can sit at 0 forever with nothing wrong —
  // `active` still correctly goes false immediately since there's nothing
  // to wait for. Once Phase 5 adds real compressed assets, `active` will
  // naturally stay true until they finish loading.
  const ready = !active;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[var(--paper)] text-center">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-[var(--ink)]">
        An enchanted forest
      </h1>
      <p className="max-w-md text-[var(--ink)]/70">
        A journey through the work of {about.name} — best experienced with sound on.
      </p>

      {ready ? (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          onClick={onEnter}
          className="rounded-md bg-[var(--primary)] px-6 py-3 text-[var(--primary-foreground)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Enter (enables sound)
        </motion.button>
      ) : (
        <div className="flex w-48 flex-col items-center gap-2" role="status" aria-live="polite">
          <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--secondary)]">
            <div
              className="h-full bg-[var(--accent)] transition-[width] duration-200"
              style={{ width: `${Math.round(progress)}%` }}
            />
          </div>
          <span className="text-xs text-[var(--muted-foreground)]">Preparing the forest…</span>
        </div>
      )}
    </div>
  );
}
