import { CHAPTER_ORDER, type ChapterId } from "@/types/world";
import { getLenisInstance } from "./lenisInstance";

const SEGMENT = 1 / CHAPTER_ORDER.length;

/**
 * Scene bookmarks / "go to chapter" — smoothly scrolls to a chapter's start
 * via Lenis (never a native instant jump), matching
 * docs/03-scene-graph.md's "bookmark jumps always land at the start of a
 * chapter and play a short settle transition... jumping never breaks
 * continuity." The actual transition/lighting settle is handled downstream
 * by ChapterWatcher + TransitionController once journeyProgress lands.
 */
export function scrollToChapter(chapter: ChapterId) {
  const lenis = getLenisInstance();
  if (!lenis) return;
  // +1% of a segment past the exact boundary: landing precisely on a
  // chapter's start fraction is fragile against floating-point rounding in
  // Lenis's own scrollTo easing, and landing even slightly short reads as
  // the *previous* chapter (caught by testing an actual bookmark jump, not
  // just reading the math) — nudge past the line instead of running along it.
  const fraction = CHAPTER_ORDER.indexOf(chapter) * SEGMENT + SEGMENT * 0.01;
  const target = fraction * lenis.limit;
  lenis.scrollTo(target, { duration: 1.4 });
}
