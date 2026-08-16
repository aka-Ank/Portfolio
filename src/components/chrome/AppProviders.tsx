"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { ThemeDriver } from "@/systems/theme/ThemeDriver";
import { AmbienceBridge } from "@/systems/audio/AmbienceBridge";

/**
 * Root-mounted, once, around every route.
 *
 * ThemeDriver belongs here rather than on the main route alone: both modes
 * render against the same CSS variables, so classic mode gets the visitor's
 * palette and time-of-day choices for free — and switching modes changes only
 * how the site moves, not how it looks.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  useReducedMotion();
  useDeviceTier();

  return (
    <>
      <ThemeDriver />
      {/* Root-mounted rather than per-route: the sound toggle and the volume
          slider are in the footer, which both modes render, so the bridge has
          to exist in both or the classic-mode controls would do nothing. It
          loads no audio at all until sound is switched on. */}
      <AmbienceBridge />
      {children}
    </>
  );
}
