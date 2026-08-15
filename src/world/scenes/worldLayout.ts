import type { ChapterId } from "@/types/world";
import { CHAPTER_ORDER } from "@/types/world";

// One connected world along -Z, not seven isolated stages — the camera
// flies continuously through it as journeyProgress advances. Each chapter
// owns a Z-depth range; scenes place their foreground/midground/background
// content inside their own range so nothing overlaps or requires per-scene
// mount/unmount logic in Phase 3 (see docs/03-scene-graph.md for the
// per-chapter narrative brief this layout serves).
const CHAPTER_DEPTH = 22;

export function chapterRange(chapter: ChapterId): { start: number; end: number; mid: number } {
  const index = CHAPTER_ORDER.indexOf(chapter);
  const start = -index * CHAPTER_DEPTH;
  const end = start - CHAPTER_DEPTH;
  return { start, end, mid: (start + end) / 2 };
}

export const WORLD_LENGTH = CHAPTER_ORDER.length * CHAPTER_DEPTH;
