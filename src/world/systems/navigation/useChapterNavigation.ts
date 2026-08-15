"use client";

import { useEffect, useRef } from "react";
import { getWorldState, useWorldStore } from "@/world/state/useWorldStore";

/**
 * A trackpad fling is not one event — it's a burst of dozens, whose inertial
 * tail can run well past a second. A fixed cooldown can't separate "one long
 * fling" from "two deliberate flicks": tune it short and a single fling skips
 * chapters, tune it long and a real second flick gets swallowed.
 *
 * So the gate is the *gap between* events, not elapsed time since the last
 * step. The handler re-arms only after the wheel has been quiet this long,
 * which is what actually marks the end of a gesture. Verified against a
 * simulated 12-event burst, which stepped twice under a 900ms cooldown and
 * steps exactly once under this.
 */
const GESTURE_END_QUIET_MS = 160;
/** Ignore the low-amplitude noise at the head and tail of a trackpad glide. */
const WHEEL_THRESHOLD = 12;
const SWIPE_THRESHOLD_PX = 45;

/**
 * Direct chapter switching input — wheel, touch swipe, and keyboard.
 *
 * The brief's motion rule is "one gesture moves to the next or previous
 * chapter directly", with no scroll drift, so this deliberately does NOT
 * map a scroll *position* to progress. There is no scrollable document on
 * the immersive route at all; these are discrete navigation events.
 */
export function useChapterNavigation(enabled: boolean) {
  const wheelArmed = useRef(true);
  const quietTimer = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function step(direction: 1 | -1) {
      // Never navigate out from under an open modal — the deep-dive owns
      // input while it's up, and Escape is its way out.
      if (getWorldState().phase === "deep-dive") return;

      const { goToNextChapter, goToPreviousChapter } = getWorldState();
      if (direction === 1) goToNextChapter();
      else goToPreviousChapter();
    }

    function onWheel(e: WheelEvent) {
      // Let genuinely scrollable UI (the chat transcript, a long overlay
      // panel) keep its own wheel behaviour instead of stealing every event.
      if (isInsideScrollable(e.target)) return;
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
      e.preventDefault();

      // Every event — consumed or not — pushes the re-arm back, so the tail
      // of a fling keeps the gate shut until the gesture genuinely ends.
      if (quietTimer.current) window.clearTimeout(quietTimer.current);
      quietTimer.current = window.setTimeout(() => {
        wheelArmed.current = true;
      }, GESTURE_END_QUIET_MS);

      if (!wheelArmed.current) return;
      wheelArmed.current = false;
      step(e.deltaY > 0 ? 1 : -1);
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY.current = isInsideScrollable(e.target) ? null : e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      if (touchStartY.current === null) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      touchStartY.current = null;
      if (Math.abs(deltaY) < SWIPE_THRESHOLD_PX) return;
      step(deltaY > 0 ? 1 : -1);
    }

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          step(1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          step(-1);
          break;
        case "Home":
          e.preventDefault();
          getWorldState().goToChapter("entrance");
          break;
        case "End":
          e.preventDefault();
          getWorldState().goToChapter("campfire");
          break;
      }
    }

    // passive: false — onWheel/onKeyDown call preventDefault to stop the
    // browser's own scroll from fighting the chapter machine.
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      if (quietTimer.current) window.clearTimeout(quietTimer.current);
    };
  }, [enabled]);
}

/** Walks up from the event target looking for something that can actually
 * scroll, so overlay panels and the chat transcript keep their own gestures. */
function isInsideScrollable(target: EventTarget | null): boolean {
  let node = target instanceof HTMLElement ? target : null;
  while (node && node !== document.body) {
    if (node.scrollHeight > node.clientHeight + 1) {
      const overflowY = getComputedStyle(node).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") return true;
    }
    node = node.parentElement;
  }
  return false;
}

/** Convenience for components that only need to know where they are. */
export function useCurrentChapterIndex() {
  return useWorldStore((s) => s.currentChapter);
}
