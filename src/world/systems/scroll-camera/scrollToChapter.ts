import type { ChapterId } from "@/types/world";
import { getWorldState } from "@/world/state/useWorldStore";

/**
 * Jump to a chapter — scene bookmarks, voice navigation ("go to the lab"),
 * the `C` shortcut, and the navigator all route through here.
 *
 * Kept under its original name and signature after the switch to direct
 * chapter switching: every caller wants "take me to this chapter", and none
 * of them cared that it used to be implemented as a Lenis `scrollTo`. The
 * eased travel now comes from ChapterTransitionDriver instead, so jumps
 * still glide rather than cut — docs/03's "jumping never breaks continuity"
 * holds, by a different mechanism.
 */
export function scrollToChapter(chapter: ChapterId) {
  getWorldState().goToChapter(chapter, { viaJump: true });
}
