"use client";

import { useWorldStore } from "@/world/state/useWorldStore";

/**
 * Convenience selector over the scroll-driven progress values the
 * scroll-camera system writes into the store. DOM chrome (progress dots,
 * chapter labels) should read through this rather than touching Lenis/GSAP
 * directly — see docs/02-architecture.md `world/systems/scroll-camera`.
 */
export function useScrollProgress() {
  const journeyProgress = useWorldStore((s) => s.journeyProgress);
  const chapterProgress = useWorldStore((s) => s.chapterProgress);
  const currentChapter = useWorldStore((s) => s.currentChapter);
  return { journeyProgress, chapterProgress, currentChapter };
}
