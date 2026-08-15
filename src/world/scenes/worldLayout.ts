import type { ChapterId } from "@/types/world";
import { CHAPTER_ORDER } from "@/types/world";

// One connected world along -Z, not seven isolated stages — the camera
// flies continuously through it as journeyProgress advances. Each chapter
// owns a Z-depth range; scenes place their foreground/midground/background
// content inside their own range so nothing overlaps or requires per-scene
// mount/unmount logic in Phase 3 (see docs/03-scene-graph.md for the
// per-chapter narrative brief this layout serves).
const DEFAULT_DEPTH = 22;

// Depth is per-chapter rather than uniform: the Valley hosts two scene
// vocabularies at once (the river's milestones and the creatures carrying the
// skill set), so at a single chapter's depth they crowded each other. Every
// other biome keeps the original spacing.
const CHAPTER_DEPTH: Record<ChapterId, number> = {
  entrance: DEFAULT_DEPTH,
  valley: DEFAULT_DEPTH * 2,
  grove: DEFAULT_DEPTH,
  jungle: DEFAULT_DEPTH,
  observatory: DEFAULT_DEPTH,
  campfire: DEFAULT_DEPTH,
};

export function chapterRange(chapter: ChapterId): { start: number; end: number; mid: number } {
  let start = 0;
  for (const id of CHAPTER_ORDER) {
    if (id === chapter) break;
    start -= CHAPTER_DEPTH[id];
  }
  const end = start - CHAPTER_DEPTH[chapter];
  return { start, end, mid: (start + end) / 2 };
}

export const WORLD_LENGTH = CHAPTER_ORDER.reduce((sum, id) => sum + CHAPTER_DEPTH[id], 0);
