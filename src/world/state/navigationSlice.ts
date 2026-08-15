import type { StateCreator } from "zustand";
import { CHAPTER_ORDER, CHAPTER_TIME_OF_DAY, type ChapterId, type NavigationPhase } from "@/types/world";
import type { TimeSlice } from "./timeSlice";

export interface NavigationSlice {
  currentChapter: ChapterId;
  phase: NavigationPhase;
  /** 0-1 progress through the *current* chapter (drives per-chapter camera). */
  chapterProgress: number;
  /** 0-1 progress through the whole seven-chapter journey. */
  journeyProgress: number;
  deepDiveId: string | null;

  goToChapter: (chapter: ChapterId, opts?: { viaJump?: boolean }) => void;
  setPhase: (phase: NavigationPhase) => void;
  setChapterProgress: (progress: number) => void;
  setJourneyProgress: (progress: number) => void;
  openDeepDive: (id: string) => void;
  closeDeepDive: () => void;
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
  journeyProgress: 0,
  deepDiveId: null,

  goToChapter: (chapter, opts) => {
    set({
      currentChapter: chapter,
      phase: "transitioning",
      chapterProgress: 0,
    });
    get().setTargetAnchor(CHAPTER_TIME_OF_DAY[chapter]);
    void opts?.viaJump; // jump vs. scroll-crossed both route through here identically — see docs/04 §2
  },

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
