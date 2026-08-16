"use client";

import { useEffect, useRef } from "react";

/**
 * Marks an element revealed the first time it enters the viewport, and never
 * again. Attach the returned ref to an element carrying the `reveal` class.
 *
 * Deliberately one-shot: re-animating on every scroll-past is the "everything
 * pops in again" pattern that makes a page feel restless. The element also
 * starts hidden only when JS is available to reveal it — the `reveal` class is
 * inert under reduced motion (see globals.css), so content is never trapped
 * behind an animation that will not run.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}
