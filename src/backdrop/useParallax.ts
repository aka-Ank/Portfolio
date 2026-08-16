"use client";

import { useEffect } from "react";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";

/**
 * Publishes scroll progress as `--parallax` (0→1) on the backdrop element.
 *
 * This is the *only* place the scene reads scroll position, and it only ever
 * **observes** — it never moves the page. Each depth plane multiplies the
 * value by its own factor in pure CSS, so one variable drives four planes with
 * no per-plane JavaScript.
 *
 * The write is coalesced into a single `requestAnimationFrame`, so a burst of
 * scroll events produces one style write per frame rather than one per event.
 * Writing a CSS variable does not itself invalidate layout; the planes consume
 * it inside a `translate3d`, which stays on the compositor.
 */
export function useParallax(ref: React.RefObject<HTMLElement | null>) {
  const reducedMotion = useAppStore(selectReducedMotion);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // With motion off the planes simply sit at their rest position. Pinning it
    // to 0 rather than skipping the effect means a visitor who toggles motion
    // back on does not inherit a stale offset.
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

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [ref, reducedMotion]);
}
