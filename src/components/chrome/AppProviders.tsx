"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { ThemeDriver } from "@/systems/theme/ThemeDriver";
import { ChatWidget } from "./ChatWidget";

/**
 * Root-mounted, once, around every route.
 *
 * ThemeDriver belongs here rather than on the immersive route alone: after
 * the 2D rebuild both modes render against the same CSS variables, so classic
 * mode gets the visitor's palette, time-of-day and weather choices for free —
 * and switching modes no longer changes how the site looks, only how it moves.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  useReducedMotion();
  useDeviceTier();

  return (
    <>
      <ThemeDriver />
      <ChatWidget />
      {children}
    </>
  );
}
