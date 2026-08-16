"use client";

import { useEffect } from "react";
import { useAppStore } from "@/state/useAppStore";
import type { DeviceTier } from "@/state/deviceSlice";

/**
 * A one-time, conservative guess at how much ambient decoration this device
 * should be asked to draw. It only sets the particle budget — nothing about
 * layout or content depends on it — so being wrong costs a slightly emptier
 * or slightly busier backdrop and nothing else.
 *
 * GPU-string sniffing is deliberately avoided: `WEBGL_debug_renderer_info` is
 * increasingly restricted and spoofed, and there is no WebGL context here to
 * ask anyway.
 */
function guessTier(): DeviceTier {
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  if (cores <= 4 && (memory <= 4 || isCoarsePointer)) return "low";
  if (cores >= 8 && memory >= 8 && !isCoarsePointer) return "high";
  return "mid";
}

/** Mount once, high in the tree. */
export function useDeviceTier(): DeviceTier {
  const tier = useAppStore((s) => s.tier);
  const setTier = useAppStore((s) => s.setTier);

  useEffect(() => {
    setTier(guessTier());
  }, [setTier]);

  return tier;
}
