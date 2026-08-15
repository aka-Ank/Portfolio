"use client";

import { useEffect, useRef } from "react";
import { useWorldStore } from "@/world/state/useWorldStore";
import { playTransition } from "./timeline";
import { CHAPTER_ORDER, type ChapterId } from "@/types/world";

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
      // `from` comes straight off prevState rather than a ref: the ref was
      // null on the very first navigation of a session, so the first jump
      // always mis-classified itself as an adjacent step and skipped the
      // dissolve (caught by an Entrance→Campfire jump flying the long way).
      // The subscription already hands us both halves of the edge — use them.
      const from = prevState.currentChapter;
      const to = state.currentChapter;
      previousChapter.current = to;

      // Adjacent steps travel through the world; anything further dissolves
      // instead, because the flight would otherwise cross every chapter in
      // between in full view (see transitions.ts's "jump").
      const distance = Math.abs(CHAPTER_ORDER.indexOf(to) - CHAPTER_ORDER.indexOf(from));
      const id = distance > 1 ? "jump" : from !== to ? `${from}-to-${to}` : "default";
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
