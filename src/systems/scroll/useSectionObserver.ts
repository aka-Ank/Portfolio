"use client";

import { useEffect } from "react";
import { SECTIONS, type SectionId } from "@/content/sections";
import { useAppStore } from "@/state/useAppStore";
import { sectionElementId } from "./scrollToSection";

const SECTION_BY_ELEMENT_ID = new Map<string, SectionId>(
  SECTIONS.map((section) => [sectionElementId(section.id), section.id]),
);

/**
 * Reports which section currently owns the viewport.
 *
 * The whole scroll model is native: CSS scroll-snap does the moving, and this
 * only *observes* the result. Nothing here can influence scroll position, so
 * there is no way for it to fight the visitor's own input — which is the
 * failure mode that scroll-jacking libraries introduce and the reason this
 * rebuild dropped one.
 *
 * `rootMargin` biases the trigger line to the upper-middle of the viewport so
 * a section becomes "active" as it settles into place rather than the instant
 * its first pixel appears.
 */
export function useSectionObserver() {
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  useEffect(() => {
    const elements = SECTIONS.map((section) =>
      document.getElementById(sectionElementId(section.id)),
    ).filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The most-visible intersecting section wins. Comparing ratios rather
        // than taking the last entry matters at the boundary, where two
        // sections are briefly on screen together.
        let best: { id: SectionId; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = SECTION_BY_ELEMENT_ID.get(entry.target.id);
          if (!id) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { id, ratio: entry.intersectionRatio };
          }
        }
        if (best) setActiveSection(best.id);
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-15% 0px -35% 0px" },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [setActiveSection]);
}
