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
 * The whole scroll model is native and this only *observes* the result.
 * Nothing here can influence scroll position, so there is no way for it to
 * fight the visitor's own input — which is the failure mode that scroll-jacking
 * libraries introduce and the reason this rebuild dropped one.
 *
 * `rootMargin` biases the trigger band to the upper-middle of the viewport so a
 * section becomes "active" as it settles into place rather than the instant its
 * first pixel appears.
 *
 * **Two things here are easy to get wrong, and both were.**
 *
 * 1. `intersectionRatio` is a fraction *of the target*, so it is not comparable
 *    between targets of different heights. The trigger band is half a viewport
 *    (~450px); a 389px section fits inside it and reaches 1.0, while a 651px
 *    section can never exceed 450/651 ≈ 0.69 no matter how completely it fills
 *    the screen. Ranking by ratio therefore hands the highlight to whichever
 *    section is *shortest*, which is why the navigator read "SDE Projects"
 *    while AI/ML Projects filled the viewport. What actually matters is how
 *    much of the *band* a section covers, so this compares
 *    `intersectionRect.height` — absolute pixels — instead.
 *
 * 2. The callback only receives entries whose intersection **changed**, not one
 *    per observed element. Deciding a winner from that partial list means
 *    comparing a section that just moved against nothing at all. So the last
 *    known coverage for every section is kept in a map, updated from whatever
 *    the callback brings, and the winner is chosen across the whole map.
 */
export function useSectionObserver() {
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  useEffect(() => {
    const elements = SECTIONS.map((section) =>
      document.getElementById(sectionElementId(section.id)),
    ).filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const coverage = new Map<SectionId, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = SECTION_BY_ELEMENT_ID.get(entry.target.id);
          if (!id) continue;
          coverage.set(id, entry.isIntersecting ? entry.intersectionRect.height : 0);
        }

        let best: SectionId | null = null;
        let bestHeight = 0;
        for (const [id, height] of coverage) {
          if (height > bestHeight) {
            best = id;
            bestHeight = height;
          }
        }
        if (best) setActiveSection(best);
      },
      {
        // Many thresholds rather than three: a section taller than the band can
        // only ever report a low ratio, so coarse steps leave it firing a
        // couple of times across its whole travel and the coverage map goes
        // stale between them.
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
        rootMargin: "-15% 0px -35% 0px",
      },
    );

    for (const element of elements) observer.observe(element);

    /**
     * The bottom of the page is a genuine exception to "most of the band wins".
     *
     * Contact is the last and shortest section, and once the page has hit its
     * scroll limit it can only ever reach the lower part of the trigger band —
     * Education, sitting above it, still covers more. The geometry is right and
     * the answer is still wrong: a visitor who has scrolled as far as the page
     * goes is looking at the last section, and the navigator saying otherwise
     * makes it look broken.
     *
     * This only ever *reads* scroll position, in line with the project's rule
     * that JavaScript may observe it and never drive it.
     */
    const LAST = SECTIONS[SECTIONS.length - 1].id;
    let frame = 0;
    const checkBottom = () => {
      frame = 0;
      const scroller = document.scrollingElement ?? document.documentElement;
      const remaining = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
      if (remaining <= 2) setActiveSection(LAST);
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(checkBottom);
    };

    checkBottom();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [setActiveSection]);
}
