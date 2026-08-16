import type { StateCreator } from "zustand";
import type { SectionId } from "@/content/sections";

/** Which chrome overlay owns the screen. Lifted into the store so the `/`
 * key, the footer buttons and the navigator all drive one value instead of
 * each keeping a private copy. */
export type ChromePanel = "help" | "controls" | null;

export interface NavSlice {
  activeSection: SectionId;
  /** Slug of the project whose detail panel is open, or null. */
  openProject: string | null;
  chromePanel: ChromePanel;
  /** The navigator reveals on interaction and hides when idle. */
  navigatorVisible: boolean;

  setActiveSection: (section: SectionId) => void;
  setOpenProject: (slug: string | null) => void;
  setChromePanel: (panel: ChromePanel) => void;
  setNavigatorVisible: (visible: boolean) => void;
}

export const createNavSlice: StateCreator<NavSlice, [], [], NavSlice> = (set) => ({
  activeSection: "hero",
  openProject: null,
  chromePanel: null,
  navigatorVisible: false,

  setActiveSection: (activeSection) => set({ activeSection }),
  setOpenProject: (openProject) => set({ openProject }),
  setChromePanel: (chromePanel) => set({ chromePanel }),
  setNavigatorVisible: (navigatorVisible) => set({ navigatorVisible }),
});
