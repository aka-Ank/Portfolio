"use client";

import { useWorldStore } from "@/world/state/useWorldStore";

/**
 * The visitor-facing manual reduced-motion control — docs/07-accessibility-
 * and-testing.md: "A manual 'reduce motion' control exists in the chrome
 * regardless of OS setting (some visitors want it off without changing a
 * system-wide preference)." Previously reachable only via the `R` keyboard
 * shortcut or a control buried in the immersive route's dev-tools panel —
 * neither is discoverable without already knowing it's there. Classic mode
 * has no client-side motion at all (no `motion/react` import anywhere in
 * components/classic/), so this only needs to exist in the immersive
 * chrome — nothing to reduce on the other route.
 */
export function ReducedMotionToggle() {
  const reducedMotion = useWorldStore((s) => s.reducedMotion);
  const setManualReducedMotion = useWorldStore((s) => s.setManualReducedMotion);

  return (
    <button
      onClick={() => setManualReducedMotion(!reducedMotion)}
      aria-pressed={reducedMotion}
      aria-label={reducedMotion ? "Motion reduced — click to enable motion" : "Reduce motion"}
      className="pointer-events-auto rounded px-2 py-1 outline-offset-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
    >
      {reducedMotion ? "▶ Motion" : "⏸ Reduce motion"}
    </button>
  );
}
