"use client";

import { useEffect, useRef, type ComponentRef, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getWorldState } from "@/world/state/useWorldStore";

gsap.registerPlugin(ScrollTrigger);

/**
 * Owns Lenis (smooth scroll feel) and syncs it to GSAP's ticker so
 * ScrollTrigger stays in lockstep with Lenis's smoothed position rather than
 * raw native scroll events — the pattern confirmed in
 * docs/00-research-and-stack.md §1. journeyProgress is written to the world
 * store from the same scroll callback so every consumer (camera rig, DOM
 * chrome) reads one source of truth.
 *
 * Mount once, at the root — wraps the whole scrollable document.
 */
export function ScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<ComponentRef<typeof ReactLenis>>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  useLenis((lenis) => {
    ScrollTrigger.update();
    getWorldState().setJourneyProgress(lenis.progress);
  });

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
