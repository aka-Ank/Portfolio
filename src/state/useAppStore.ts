import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createUiSlice, type UiSlice } from "./uiSlice";
import { createNavSlice, type NavSlice } from "./navSlice";
import { createDeviceSlice, type DeviceSlice } from "./deviceSlice";

export type AppState = UiSlice & NavSlice & DeviceSlice;

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createUiSlice(...a),
      ...createNavSlice(...a),
      ...createDeviceSlice(...a),
    }),
    {
      name: "portfolio-preferences",
      // Only the visitor's deliberate choices survive a reload. Navigation
      // and device state must always reflect the current visit, never a
      // stale one.
      partialize: (state) => ({
        colorMode: state.colorMode,
        timeMode: state.timeMode,
        ambience: state.ambience,
        soundEnabled: state.soundEnabled,
        volume: state.volume,
        manualReducedMotion: state.manualReducedMotion,
      }),
    },
  ),
);

/** The effective reduced-motion value: an explicit visitor override wins
 * over the OS preference, and the OS preference wins over nothing. */
export function selectReducedMotion(state: AppState): boolean {
  return state.manualReducedMotion ?? state.systemReducedMotion;
}

/** Non-reactive read, for use inside rAF loops — never subscribe there. */
export const getAppState = useAppStore.getState;
