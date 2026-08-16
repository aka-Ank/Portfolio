"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// useLayoutEffect warns during SSR; the fallback never runs there anyway.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Reveals an element the first time it enters the viewport, once.
 *
 * **Content is visible by default and only hidden by JS.** The obvious
 * implementation — `opacity: 0` in the stylesheet, revealed by an observer —
 * means every word on the page is invisible until the bundle has downloaded,
 * parsed and run. That is a broken page for anyone on a slow connection or
 * with scripting off, and it also hides the real Largest Contentful Paint
 * behind script evaluation.
 *
 * So the hidden state is applied here instead, in a layout effect (before
 * paint, so there is no flash), and **only to elements that are off-screen at
 * mount**. Anything already in the viewport — the hero, above all — is simply
 * left alone: it is already where it belongs, and animating it would delay the
 * first thing the visitor came to read.
 *
 * Deliberately one-shot: re-animating on every scroll-past is what makes a
 * page feel restless.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) return;

    element.dataset.revealed = "false";
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || element.dataset.revealed !== "false") return;

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
