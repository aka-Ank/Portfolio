"use client";

import { useEffect, type RefObject } from "react";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";

/**
 * The scene's single connection to scroll position.
 *
 * It writes exactly one value — `--parallax`, 0 to 1 — onto the backdrop
 * element. All four depth planes consume it in pure CSS, so one variable drives
 * eight transforms with no per-plane JavaScript.
 *
 * It used to write eighteen: eight biome opacities and eight play-state
 * keywords, for a system of discrete environments that cross-faded. That is
 * gone. The world is one continuous strip per plane now, so travelling through
 * it is entirely a matter of how far the strips have slid — which is this one
 * number.
 *
 * This only ever **observes** scroll. It never moves the page, which is the
 * project's standing rule and the reason the rebuild dropped its scroll library.
 *
 * The write is coalesced into a single `requestAnimationFrame`, so a burst of
 * scroll events produces one write rather than one per event. Writing a custom
 * property does not invalidate layout, and the planes consume it inside a
 * `translate3d`, which stays on the compositor.
 */
export function useSceneScroll(ref: RefObject<HTMLElement | null>) {
  const reducedMotion = useAppStore(selectReducedMotion);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // With motion off the planes sit at rest. Pinned to 0 rather than skipping
    // the effect, so a visitor who turns motion back on does not inherit a
    // stale offset.
    if (reducedMotion) {
      element.style.setProperty("--parallax", "0");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const scroller = document.scrollingElement ?? document.documentElement;
      const max = scroller.scrollHeight - scroller.clientHeight;
      element.style.setProperty("--parallax", max > 0 ? String(scroller.scrollTop / max) : "0");
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [ref, reducedMotion]);
}
