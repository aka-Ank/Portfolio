"use client";

import { useEffect, useRef } from "react";
import { useWorldStore } from "@/world/state/useWorldStore";
import { playTransition } from "./timeline";
import type { ChapterId } from "@/types/world";

/**
 * Mount once, high in the tree. Watches for the navigation state machine
 * entering "transitioning" (docs/04-state-machines.md §2) and fires the
 * matching registered GSAP timeline, returning the machine to "active" on
 * completion. Scroll-crossed and bookmark-jump transitions both flow through
 * here identically — see docs/03-scene-graph.md "bookmark jumps."
 */
export function TransitionController() {
  const previousChapter = useRef<ChapterId | null>(null);

  useEffect(() => {
    const unsubscribe = useWorldStore.subscribe((state, prevState) => {
      if (state.phase !== "transitioning" || prevState.phase === "transitioning") {
        return;
      }
      const from = previousChapter.current;
      const to = state.currentChapter;
      previousChapter.current = to;

      const id = from ? `${from}-to-${to}` : "default";
      playTransition(id, {
        onComplete: () => {
          if (useWorldStore.getState().phase === "transitioning") {
            useWorldStore.getState().setPhase("active");
          }
        },
      });
    });

    return unsubscribe;
  }, []);

  return null;
}
