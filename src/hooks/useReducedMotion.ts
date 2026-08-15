"use client";

import { useEffect } from "react";
import { useWorldStore } from "@/world/state/useWorldStore";

/**
 * Syncs the OS/browser `prefers-reduced-motion` media query into the world
 * store on mount and on change, then returns the *effective* value (manual
 * chrome override wins over system preference — see deviceSlice).
 * Mount this once, high in the tree (root layout), not per-component.
 */
export function useReducedMotion(): boolean {
  const reducedMotion = useWorldStore((s) => s.reducedMotion);
  const setSystemReducedMotion = useWorldStore((s) => s.setSystemReducedMotion);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReducedMotion(query.matches);

    const listener = (event: MediaQueryListEvent) =>
      setSystemReducedMotion(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, [setSystemReducedMotion]);

  return reducedMotion;
}
