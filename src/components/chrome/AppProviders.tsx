"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { ScrollProvider } from "@/world/systems/scroll-camera/ScrollProvider";
import { TransitionController } from "@/world/systems/transitions/TransitionController";
import { EasterEggController } from "@/world/systems/easter-egg/EasterEggController";

/**
 * Root-mounted, once. Wires the always-on global systems (reduced-motion
 * sync, device-tier seed, smooth scroll, transition orchestration) around
 * every route — see docs/02-architecture.md.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  useReducedMotion();
  useDeviceTier();

  return (
    <ScrollProvider>
      <TransitionController />
      <EasterEggController />
      {children}
    </ScrollProvider>
  );
}
