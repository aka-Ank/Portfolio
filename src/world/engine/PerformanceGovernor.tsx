"use client";

import { PerformanceMonitor, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { useWorldStore } from "@/world/state/useWorldStore";
import type { DeviceTier } from "@/types/world";

const TIER_STEP_UP: Record<DeviceTier, DeviceTier> = { low: "mid", mid: "high", high: "high" };
const TIER_STEP_DOWN: Record<DeviceTier, DeviceTier> = { low: "low", mid: "low", high: "mid" };

/**
 * Corrects the heuristic-guessed device tier (useDeviceTier) once real frame
 * timing exists. Mount inside the Canvas, once. See docs/08-roadmap.md Phase 2
 * acceptance criteria: "PerformanceGovernor visibly changes quality... when
 * forced into a low-tier profile."
 */
export function PerformanceGovernor() {
  const setTier = useWorldStore((s) => s.setTier);

  return (
    <PerformanceMonitor
      // Conservative bounds: step down fast (bad frames hurt immediately),
      // step up cautiously (avoid flip-flopping near the boundary).
      bounds={() => [50, 58]}
      flipflops={2}
      onDecline={() => setTier(TIER_STEP_DOWN[useWorldStore.getState().tier])}
      onIncline={() => setTier(TIER_STEP_UP[useWorldStore.getState().tier])}
    >
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
    </PerformanceMonitor>
  );
}
