"use client";

import { AnimatePresence, motion } from "motion/react";
import { useWorldStore } from "@/world/state/useWorldStore";
import type { ChapterId } from "@/types/world";
import { EntranceOverlay } from "@/world/scenes/entrance/EntranceOverlay";
import { ClearingOverlay } from "@/world/scenes/clearing/ClearingOverlay";

// Registry of DOM overlays per chapter — chapters without a built overlay
// yet simply render nothing (see docs/08-roadmap.md, scenes land one at a
// time). Crossfade only; no position/scale motion on the swap itself, since
// that's the transition system's job (docs/06-animation-bible.md "Scene
// transition"), not the overlay's.
const OVERLAYS: Partial<Record<ChapterId, React.ComponentType>> = {
  entrance: EntranceOverlay,
  clearing: ClearingOverlay,
};

export function ChapterOverlay() {
  const currentChapter = useWorldStore((s) => s.currentChapter);
  const phase = useWorldStore((s) => s.phase);
  const Overlay = OVERLAYS[currentChapter];

  if (phase === "preloading" || !Overlay) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentChapter}
          className="h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Overlay />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
