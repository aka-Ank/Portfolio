import type { SectionId } from "@/content/sections";
import { getAppState, selectReducedMotion } from "@/state/useAppStore";

/** Every section element carries this, so the observer and the jump target
 * agree on one selector. */
export function sectionElementId(id: SectionId): string {
  return `section-${id}`;
}

/**
 * Jump to a section — the navigator, the hero's CTAs and the keyboard
 * shortcuts all route through here.
 *
 * Deliberately native `scrollIntoView` rather than a tweened scroll library.
 * The page uses CSS scroll-snap, so the browser already owns the easing and
 * the final resting position; animating scrollTop ourselves would fight the
 * snap engine and reintroduce exactly the drift this rebuild removed. The
 * only thing worth overriding is honouring reduced motion, which
 * `scrollIntoView` does not do on its own in every engine.
 */
export function scrollToSection(id: SectionId) {
  const element = document.getElementById(sectionElementId(id));
  if (!element) return;

  const reducedMotion = selectReducedMotion(getAppState());
  element.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });

  // The observer will confirm this once the scroll lands, but setting it now
  // keeps the navigator's active dot from lagging behind the visitor's own
  // click for the length of a smooth scroll.
  getAppState().setActiveSection(id);
}
