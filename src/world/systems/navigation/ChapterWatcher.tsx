"use client";

import { useEffect, useRef } from "react";
import { useWorldStore } from "@/world/state/useWorldStore";
import { CHAPTER_ORDER, type ChapterId } from "@/types/world";

// Equal 1/7 fractions of journeyProgress map to chapters — consistent with
// worldLayout.ts giving every chapter the same world-space depth, so the
// spline camera path (arc-length parametrized) spends roughly equal
// progress-time in each chapter too. Mount once, anywhere (doesn't need R3F
// context — this only touches the store).
const SEGMENT = 1 / CHAPTER_ORDER.length;

function chapterForProgress(progress: number): ChapterId {
  const index = Math.min(CHAPTER_ORDER.length - 1, Math.floor(progress / SEGMENT));
  return CHAPTER_ORDER[Math.max(0, index)];
}

export function ChapterWatcher() {
  const lastChapter = useRef<ChapterId | null>(null);

  useEffect(() => {
    const unsubscribe = useWorldStore.subscribe((state) => {
      const target = chapterForProgress(state.journeyProgress);
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
