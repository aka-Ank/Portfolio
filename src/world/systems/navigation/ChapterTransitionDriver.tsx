"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { damp } from "maath/easing";
import { getWorldState, useWorldStore } from "@/world/state/useWorldStore";

// Slower than UI motion, in the same family as CameraRig's own damping — the
// transition between biomes should read as travelling, not cutting. See
// docs/06-animation-bible.md "Scene transition".
//
// This only ever spans a single chapter now: longer jumps dissolve and
// teleport under a full veil (transitions.ts "jump"), so this can be tuned
// for the one-step case rather than compromising for a six-chapter flight.
// 0.5 lands an adjacent step in ~1s; 0.9 took over 2s and read as sluggish.
const SMOOTH_TIME = 0.5;
/** Below this, treat the eased value as arrived and stop the loop. */
const SETTLE_EPSILON = 0.0002;

/**
 * Drives `journeyProgress` toward `targetJourneyProgress`.
 *
 * This is the engine of direct chapter switching: input sets a *chapter*,
 * and this eases the continuous progress value the whole world already
 * reads (camera spline, scene placement, overlays) toward that chapter's
 * canonical progress. Nothing downstream had to change to stop being
 * scroll-driven — only what writes this value did.
 *
 * Mount inside the Canvas: it needs the R3F frame loop and `invalidate`.
 */
export function ChapterTransitionDriver() {
  const invalidate = useThree((s) => s.invalidate);

  // Under frameloop="demand" a new target from an idle loop would otherwise
  // never be noticed — same class of bug as CameraRig's wake-up subscription
  // (see ENGINEER_NOTES.md on the invalidate contract).
  useEffect(
    () =>
      useWorldStore.subscribe((state, prev) => {
        if (state.targetJourneyProgress !== prev.targetJourneyProgress) invalidate();
      }),
    [invalidate],
  );

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const { journeyProgress, targetJourneyProgress, reducedMotion } = getWorldState();

    const distance = Math.abs(targetJourneyProgress - journeyProgress);
    if (distance < SETTLE_EPSILON) {
      if (journeyProgress !== targetJourneyProgress) {
        getWorldState().setJourneyProgress(targetJourneyProgress);
      }
      // Deliberately does NOT restore `phase` here. TransitionController's
      // timeline onComplete already owns that edge, and two writers raced:
      // this one fired the moment progress settled, which for a dissolve is
      // while the veil is still covering the screen.
      return;
    }

    if (reducedMotion) {
      getWorldState().setJourneyProgress(targetJourneyProgress);
      state.invalidate();
      return;
    }

    // maath's damp mutates a {current} container rather than returning the
    // new value, so the eased result is read back out of it.
    const container = { current: journeyProgress };
    damp(container, "current", targetJourneyProgress, SMOOTH_TIME, delta);
    getWorldState().setJourneyProgress(container.current);
    state.invalidate();
  });

  return null;
}
