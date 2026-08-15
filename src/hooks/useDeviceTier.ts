"use client";

import { useEffect } from "react";
import { useWorldStore } from "@/world/state/useWorldStore";
import type { DeviceTier } from "@/types/world";

/**
 * One-time heuristic guess at device tier before the real signal
 * (drei's PerformanceMonitor, running inside the Canvas) has collected any
 * frames. GPU string sniffing is deliberately avoided — WEBGL_debug_renderer_info
 * is increasingly restricted/spoofed by browsers, so it's not a reliable
 * signal (see ENGINEER_NOTES.md "device-tier detection heuristic"). This
 * only sets a conservative starting point; PerformanceGovernor corrects it
 * upward or downward once real frame timing exists.
 */
function guessInitialTier(): DeviceTier {
  if (typeof navigator === "undefined") return "mid";

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  if (cores <= 4 && (memory <= 4 || isCoarsePointer)) return "low";
  if (cores >= 8 && memory >= 8 && !isCoarsePointer) return "high";
  return "mid";
}

/** Mount once, high in the tree — seeds the store's device tier on load. */
export function useDeviceTier(): DeviceTier {
  const tier = useWorldStore((s) => s.tier);
  const setTier = useWorldStore((s) => s.setTier);

  useEffect(() => {
    setTier(guessInitialTier());
    // Intentionally runs once — PerformanceGovernor takes over from here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return tier;
}
