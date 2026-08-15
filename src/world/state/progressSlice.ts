import type { StateCreator } from "zustand";
import type { ChapterId } from "@/types/world";

// Purely additive — see docs/04-state-machines.md §3. Never gates content,
// only reflects what's been seen/found back to the visitor via chrome.
export interface ProgressSlice {
  viewedChapters: Partial<Record<ChapterId, true>>;
  loreFound: string[];
  easterEggFound: boolean;

  markChapterViewed: (chapter: ChapterId) => void;
  discoverLore: (id: string) => void;
  triggerEasterEgg: () => void;
  resetProgress: () => void;
}

export const createProgressSlice: StateCreator<
  ProgressSlice,
  [],
  [],
  ProgressSlice
> = (set, get) => ({
  viewedChapters: {},
  loreFound: [],
  easterEggFound: false,

  markChapterViewed: (chapter) =>
    set((state) => ({
      viewedChapters: { ...state.viewedChapters, [chapter]: true },
    })),

  discoverLore: (id) => {
    if (get().loreFound.includes(id)) return;
    set((state) => ({ loreFound: [...state.loreFound, id] }));
  },

  triggerEasterEgg: () => set({ easterEggFound: true }),

  resetProgress: () =>
    set({ viewedChapters: {}, loreFound: [], easterEggFound: false }),
});
