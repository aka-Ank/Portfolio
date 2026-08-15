"use client";

import { useCallback, useState } from "react";
import { useWorldStore } from "@/world/state/useWorldStore";
import { CHAPTER_TIME_OF_DAY } from "@/types/world";
import { useKonamiCode } from "./useKonamiCode";
import { playSfx } from "@/world/systems/audio/audioManager";

const ALTERNATE_ATMOSPHERE_MS = 4000;

/**
 * Mount once, globally. The "alternate atmosphere" easter egg suggested in
 * docs/03-scene-graph.md §7: the whole world briefly slips to night
 * regardless of where the visitor is, then eases back to the current
 * chapter's real time-of-day — using the same damped TimeOfDaySystem
 * everything else does, so the flicker still feels physical, not like a
 * cheap toggle.
 */
export function EasterEggController() {
  const [toastVisible, setToastVisible] = useState(false);
  const triggerEasterEgg = useWorldStore((s) => s.triggerEasterEgg);
  const setTargetAnchor = useWorldStore((s) => s.setTargetAnchor);

  const handleTrigger = useCallback(() => {
    triggerEasterEgg();
    playSfx("confirm");
    setToastVisible(true);

    const naturalAnchor = CHAPTER_TIME_OF_DAY[useWorldStore.getState().currentChapter];
    setTargetAnchor("night");
    window.setTimeout(() => setTargetAnchor(naturalAnchor), ALTERNATE_ATMOSPHERE_MS);
    window.setTimeout(() => setToastVisible(false), ALTERNATE_ATMOSPHERE_MS + 500);
  }, [triggerEasterEgg, setTargetAnchor]);

  useKonamiCode(handleTrigger);

  if (!toastVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-10 z-50 flex justify-center">
      <div className="rounded-full bg-[var(--scrim)] px-5 py-2 text-sm text-[var(--ink-inverse)] backdrop-blur-sm">
        The forest remembers old code. ✧
      </div>
    </div>
  );
}
