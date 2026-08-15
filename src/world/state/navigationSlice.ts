import type { StateCreator } from "zustand";
import { CHAPTER_ORDER, CHAPTER_TIME_OF_DAY, type ChapterId, type NavigationPhase } from "@/types/world";
import type { TimeSlice } from "./timeSlice";

export interface NavigationSlice {
  currentChapter: ChapterId;
  phase: NavigationPhase;
  /** 0-1 progress through the *current* chapter (drives per-chapter camera). */
  chapterProgress: number;
  /** 0-1 progress through the whole seven-chapter journey. Eased toward
   * `targetJourneyProgress` by ChapterTransitionDriver — no longer written
   * directly by scroll position. */
  journeyProgress: number;
  /** Where journeyProgress is heading: the canonical progress value of
   * `currentChapter`. Direct chapter switching means the chapter is
   * authoritative and progress follows it, which is the exact inverse of the
   * old scroll-driven model (see docs/03 and SESSION.md's retrofit entry). */
  targetJourneyProgress: number;
  deepDiveId: string | null;
  /** Bumped to tell CameraRig to hard-cut to the target instead of damping
   * toward it. Only used while a dissolve fully covers the screen — damping
   * a six-chapter jump means the camera glides across the whole world in
   * view *after* the veil lifts, even though progress already teleported. */
  cameraSnapNonce: number;

  goToChapter: (chapter: ChapterId, opts?: { viaJump?: boolean }) => void;
  requestCameraSnap: () => void;
  goToNextChapter: () => void;
  goToPreviousChapter: () => void;
  setPhase: (phase: NavigationPhase) => void;
  setChapterProgress: (progress: number) => void;
  setJourneyProgress: (progress: number) => void;
  openDeepDive: (id: string) => void;
  closeDeepDive: () => void;
}

const SEGMENT = 1 / CHAPTER_ORDER.length;

/** The progress value that centres the camera on a chapter — its segment
 * midpoint. Chapters own equal 1/7 slices of progress (worldLayout gives
 * each the same world-space depth), so the midpoint lands on the chapter's
 * key beat rather than its entry edge. */
export function progressForChapter(chapter: ChapterId): number {
  return (CHAPTER_ORDER.indexOf(chapter) + 0.5) * SEGMENT;
}

// Slices calling into each other needs the combined state type — see the
// Zustand slices-pattern docs. NavigationSlice is authored against the
// intersection so `set`/`get` can also reach TimeSlice's setTargetAnchor,
// which is how "each chapter has a target time-of-day" (docs/03) gets wired
// without the two systems reaching into each other from the outside.
export const createNavigationSlice: StateCreator<
  NavigationSlice & TimeSlice,
  [],
  [],
  NavigationSlice
> = (set, get) => ({
  currentChapter: "entrance",
  phase: "preloading",
  chapterProgress: 0,
  journeyProgress: progressForChapter("entrance"),
  targetJourneyProgress: progressForChapter("entrance"),
  deepDiveId: null,
  cameraSnapNonce: 0,

  goToChapter: (chapter, opts) => {
    if (get().currentChapter === chapter) return;
    set({
      currentChapter: chapter,
      phase: "transitioning",
      chapterProgress: 0,
      targetJourneyProgress: progressForChapter(chapter),
    });
    get().setTargetAnchor(CHAPTER_TIME_OF_DAY[chapter]);
    void opts?.viaJump; // jump vs. stepped both route through here identically — see docs/04 §2
  },

  // One gesture = one chapter, never a partial slide between two. Clamped at
  // both ends rather than wrapping: reaching the Campfire and being thrown
  // back to the Entrance would break the "journey" reading entirely.
  goToNextChapter: () => {
    const index = CHAPTER_ORDER.indexOf(get().currentChapter);
    if (index < CHAPTER_ORDER.length - 1) get().goToChapter(CHAPTER_ORDER[index + 1]);
  },
  goToPreviousChapter: () => {
    const index = CHAPTER_ORDER.indexOf(get().currentChapter);
    if (index > 0) get().goToChapter(CHAPTER_ORDER[index - 1]);
  },

  requestCameraSnap: () => set((s) => ({ cameraSnapNonce: s.cameraSnapNonce + 1 })),

  setPhase: (phase) => set({ phase }),
  setChapterProgress: (progress) => set({ chapterProgress: progress }),
  setJourneyProgress: (progress) => set({ journeyProgress: progress }),

  openDeepDive: (id) => set({ deepDiveId: id, phase: "deep-dive" }),
  closeDeepDive: () =>
    set({ deepDiveId: null, phase: "active" }),
});

export function chapterIndex(chapter: ChapterId): number {
  return CHAPTER_ORDER.indexOf(chapter);
}
