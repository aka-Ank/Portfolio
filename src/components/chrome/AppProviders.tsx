"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { ChatWidget } from "./ChatWidget";
import { VoiceNavControl } from "./VoiceNavControl";

/**
 * Root-mounted, once. Wires the always-on global systems (reduced-motion
 * sync, device-tier seed, chat/voice chrome) around every route — see
 * docs/02-architecture.md.
 *
 * Smooth scroll (Lenis) + GSAP scene-transition orchestration + the easter
 * egg deliberately do NOT live here even though they're conceptually
 * "global" — they're immersive-route-only (mounted in app/page.tsx instead).
 * They used to be mounted here, which put GSAP + Lenis in the bundle every
 * route loads, including /classic's "no smooth scroll, no JS-driven
 * transitions" plain-anchor-link page — a real, measured Lighthouse LCP
 * regression on /classic (see SESSION.md/ENGINEER_NOTES.md, Phase 5).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  useReducedMotion();
  useDeviceTier();

  return (
    <>
      <ChatWidget />
      <VoiceNavControl />
      {children}
    </>
  );
}
