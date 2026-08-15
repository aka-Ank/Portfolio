import type gsap from "gsap";
import { registerTransition } from "@/world/systems/transitions/timeline";

// Real chapter-pair transitions — see docs/06-animation-bible.md "Scene
// transition". Registered once, at app start; each chapter-pair gets its
// own named phases so a future pair can have a distinct feel (a light
// sweep, a fog roll) without touching this shared mechanism.
export function registerWorldTransitions() {
  const crossfadeVeil = {
    exit: (tl: gsap.core.Timeline) => {
      tl.to("#scene-transition-veil", { opacity: 0.5, duration: 0.7, ease: "power2.out" });
    },
    hold: (tl: gsap.core.Timeline) => {
      tl.to({}, { duration: 0.2 });
    },
    enter: (tl: gsap.core.Timeline) => {
      tl.to("#scene-transition-veil", { opacity: 0, duration: 1, ease: "power2.inOut" });
    },
  };

  // Entrance -> Clearing is the one literal "passing through" beat in the
  // whole journey (docs/03-scene-graph.md §1) — a brief bright veil reads as
  // stepping from the archway's shade into the clearing's open light.
  registerTransition("entrance-to-clearing", crossfadeVeil);
  registerTransition("clearing-to-river", crossfadeVeil);
  registerTransition("river-to-sanctuary", crossfadeVeil);
  registerTransition("sanctuary-to-lab", crossfadeVeil);
  registerTransition("lab-to-observatory", crossfadeVeil);
  registerTransition("observatory-to-campfire", crossfadeVeil);
  registerTransition("default", crossfadeVeil);
}
