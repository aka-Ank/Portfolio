"use client";

import { useWorldStore } from "@/world/state/useWorldStore";

/**
 * The visitor-facing dark/light control — docs/08-roadmap.md Phase 4:
 * "Smooth dark/light (day/night) mode as a gradual atmosphere shift (sky,
 * shadow, fog, particles, sound together), not a flat color-token swap."
 * A simple day/night toggle over the full 4-anchor system TimeOfDaySystem
 * already damps through — the gradualness comes for free from that system,
 * this button just picks the target.
 */
export function TimeOfDayToggle() {
  const targetAnchor = useWorldStore((s) => s.targetAnchor);
  const setTargetAnchor = useWorldStore((s) => s.setTargetAnchor);
  const isNight = targetAnchor === "night" || targetAnchor === "sunset";

  return (
    <button
      onClick={() => setTargetAnchor(isNight ? "day" : "night")}
      aria-pressed={isNight}
      aria-label={isNight ? "Switch to day" : "Switch to night"}
      className="pointer-events-auto rounded px-2 py-1 outline-offset-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
    >
      {isNight ? "🌙" : "☀️"}
    </button>
  );
}
