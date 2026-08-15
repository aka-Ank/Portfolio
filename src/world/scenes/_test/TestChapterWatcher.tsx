"use client";

import { useEffect, useRef } from "react";
import { useWorldStore } from "@/world/state/useWorldStore";
import type { ChapterId } from "@/types/world";

// PROOF-SCENE ONLY. Maps journeyProgress thresholds to goToChapter calls so
// the Phase 2 test scene exercises navigation + transitions + time-of-day-
// follows-chapter end to end. Real scroll-crossing detection in Phase 3 will
// use each chapter's actual section bounds (GSAP ScrollTrigger per section)
// rather than fixed fractions of a single spacer.
const THRESHOLDS: { at: number; chapter: ChapterId }[] = [
  { at: 0, chapter: "entrance" },
  { at: 0.34, chapter: "sanctuary" },
  { at: 0.67, chapter: "observatory" },
];

export function TestChapterWatcher() {
  const lastChapter = useRef<ChapterId | null>(null);

  useEffect(() => {
    const unsubscribe = useWorldStore.subscribe((state) => {
      const progress = state.journeyProgress;
      let target = THRESHOLDS[0].chapter;
      for (const entry of THRESHOLDS) {
        if (progress >= entry.at) target = entry.chapter;
      }
      if (target !== lastChapter.current) {
        lastChapter.current = target;
        if (useWorldStore.getState().phase !== "preloading") {
          useWorldStore.getState().goToChapter(target);
        }
      }
    });
    return unsubscribe;
  }, []);

  return null;
}
