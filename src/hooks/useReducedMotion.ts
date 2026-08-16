"use client";

import { useEffect } from "react";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";

/**
 * Syncs the OS `prefers-reduced-motion` setting into the store, and mirrors
 * the *effective* value onto `<html data-motion>` so pure-CSS animations can
 * be switched off by an explicit visitor choice too — the media query alone
 * cannot see the in-app toggle.
 *
 * Mount once, high in the tree.
 */
export function useReducedMotion(): boolean {
  const reducedMotion = useAppStore(selectReducedMotion);
  const setSystemReducedMotion = useAppStore((s) => s.setSystemReducedMotion);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReducedMotion(query.matches);
    const listener = (event: MediaQueryListEvent) => setSystemReducedMotion(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, [setSystemReducedMotion]);

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? "off" : "on";
  }, [reducedMotion]);

  return reducedMotion;
}
