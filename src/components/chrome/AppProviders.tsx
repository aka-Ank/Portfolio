"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { ThemeDriver } from "@/systems/theme/ThemeDriver";

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
      {children}
    </>
  );
}
