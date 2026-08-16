"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { ThemeDriver } from "@/systems/theme/ThemeDriver";

// The chat widget is a secondary affordance that nobody sees until they open
// it, and it is the only thing in the tree that pulls in motion/react. Loading
// it eagerly put an animation library on the critical path of a page whose
// own motion is entirely CSS.
const ChatWidget = dynamic(() => import("./ChatWidget").then((m) => m.ChatWidget), {
  ssr: false,
});

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
