import type gsap from "gsap";
import { registerTransition } from "@/world/systems/transitions/timeline";
import { getWorldState } from "@/world/state/useWorldStore";

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

  // Non-adjacent jumps (bookmarks, Home/End, "go to the lab") are a
  // different problem from stepping to a neighbour. The world is one
  // continuous space, so easing across six chapters means literally flying
  // through all of them: slow, and every intermediate chapter's labels
  // strobe past — verified, the river's milestone text was legible on top of
  // the campfire during an Entrance→Campfire jump.
  //
  // So a long jump is a real dissolve rather than a fast flight: cover
  // fully, teleport the progress value while nothing is visible, uncover.
  // This is the "dissolve" option from the brief's transition shortlist, and
  // it's chosen for the case it actually solves — a light sweep or fog wipe
  // at partial opacity would still show the flythrough underneath.
  registerTransition("jump", {
    exit: (tl: gsap.core.Timeline) => {
      tl.to("#scene-transition-veil", { opacity: 1, duration: 0.45, ease: "power2.in" });
    },
    hold: (tl: gsap.core.Timeline) => {
      tl.call(() => {
        // Fully covered here — both the progress value and the camera cut
        // invisibly. Snapping progress alone isn't enough: CameraRig damps
        // independently, so it would still glide across the world in view
        // after the veil lifted (caught by screenshotting an Entrance→
        // Campfire jump, which arrived showing the Observatory).
        const { targetJourneyProgress, setJourneyProgress, requestCameraSnap } = getWorldState();
        setJourneyProgress(targetJourneyProgress);
        requestCameraSnap();
      }).to({}, { duration: 0.15 });
    },
    enter: (tl: gsap.core.Timeline) => {
      tl.to("#scene-transition-veil", { opacity: 0, duration: 0.9, ease: "power2.out" });
    },
  });
}
