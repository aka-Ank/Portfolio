import type gsap from "gsap";
import { registerTransition } from "@/world/systems/transitions/timeline";

// PROOF-SCENE ONLY. Real chapter-pair transitions get authored in Phase 3
// (docs/06-animation-bible.md "Scene transition") — this exists purely to
// exercise the GSAP Timeline orchestration mechanism end to end: a simple
// "veil" flash on a DOM overlay, which is unmistakably visible and distinct
// from the continuous lighting damp, so it's obvious a transition fired.
export function registerTestTransitions() {
  const veilFlash = {
    exit: (tl: gsap.core.Timeline) => {
      tl.to("#test-transition-veil", { opacity: 0.45, duration: 0.6, ease: "power2.out" });
    },
    hold: (tl: gsap.core.Timeline) => {
      tl.to({}, { duration: 0.3 });
    },
    enter: (tl: gsap.core.Timeline) => {
      tl.to("#test-transition-veil", { opacity: 0, duration: 0.9, ease: "power2.inOut" });
    },
  };

  registerTransition("entrance-to-sanctuary", veilFlash);
  registerTransition("sanctuary-to-observatory", veilFlash);
  registerTransition("default", veilFlash);
}
