import gsap from "gsap";
import { getWorldState } from "@/world/state/useWorldStore";

// The reusable scene-transition orchestration layer that replaces Theatre.js
// (see docs/00-research-and-stack.md §6). Each chapter-pair registers named
// phases once; nothing is copy-pasted per scene — see docs/06-animation-bible.md
// "Scene transition."

export interface TransitionPhases {
  exit?: (tl: gsap.core.Timeline) => void;
  hold?: (tl: gsap.core.Timeline) => void;
  enter?: (tl: gsap.core.Timeline) => void;
}

const registry = new Map<string, TransitionPhases>();

export function registerTransition(id: string, phases: TransitionPhases) {
  registry.set(id, phases);
}

/**
 * Plays a registered transition. Unregistered ids resolve to an empty
 * (instant, harmless) timeline rather than throwing — a missing chapter
 * transition should never hard-fail navigation.
 *
 * Reduced motion doesn't get a separately-authored timeline; it plays the
 * same one at a much higher timescale, which reads as a quick crossfade
 * rather than a jarring hard cut — see docs/06 "Reduced motion".
 */
export function playTransition(
  id: string,
  opts?: { onComplete?: () => void },
): gsap.core.Timeline {
  const phases = registry.get(id);
  const tl = gsap.timeline({ onComplete: opts?.onComplete });

  phases?.exit?.(tl);
  phases?.hold?.(tl);
  phases?.enter?.(tl);

  if (getWorldState().reducedMotion) tl.timeScale(8);
  return tl;
}

export function isTransitionRegistered(id: string): boolean {
  return registry.has(id);
}
