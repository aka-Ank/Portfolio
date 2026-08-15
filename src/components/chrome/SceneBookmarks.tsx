"use client";

import { motion } from "motion/react";
import { CHAPTER_ORDER, type ChapterId } from "@/types/world";
import { useWorldStore } from "@/world/state/useWorldStore";
import { scrollToChapter } from "@/world/systems/scroll-camera/scrollToChapter";

const CHAPTER_LABELS: Record<ChapterId, string> = {
  entrance: "Entrance",
  clearing: "Clearing",
  river: "Knowledge River",
  sanctuary: "Animal Sanctuary",
  lab: "Lab",
  observatory: "Observatory",
  campfire: "Campfire",
};

/** Scene bookmarks — jump to a chapter without breaking the story feel
 * (docs/03-scene-graph.md "bookmark jumps"): scrollToChapter always eases
 * via Lenis, never snaps. */
export function SceneBookmarks({ onClose }: { onClose: () => void }) {
  const currentChapter = useWorldStore((s) => s.currentChapter);
  const viewedChapters = useWorldStore((s) => s.viewedChapters);

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmarks-title"
        className="w-full max-w-sm rounded-lg bg-[var(--paper)] p-6 text-[var(--ink)] shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="bookmarks-title" className="font-[family-name:var(--font-display)] text-2xl">
            Go to a chapter
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded px-2 py-1 text-[var(--muted-foreground)] outline-offset-2 hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            ✕
          </button>
        </div>
        <ul className="mt-4 flex flex-col">
          {CHAPTER_ORDER.map((chapter) => (
            <li key={chapter}>
              <button
                onClick={() => {
                  scrollToChapter(chapter);
                  onClose();
                }}
                aria-current={currentChapter === chapter}
                className={`flex w-full items-center justify-between rounded px-3 py-2 text-left outline-offset-2 hover:bg-[var(--secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] ${
                  // --primary, not --accent — see LearningJourney.tsx's
                  // comment (--accent on --paper is 2.2:1, fails AA).
                  currentChapter === chapter ? "text-[var(--primary)]" : "text-[var(--ink)]"
                }`}
              >
                {CHAPTER_LABELS[chapter]}
                {viewedChapters[chapter] && (
                  <span className="text-xs text-[var(--muted-foreground)]">seen</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
