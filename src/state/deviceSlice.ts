import type { StateCreator } from "zustand";
import type { UiSlice } from "./uiSlice";

/** Drives ambient particle counts only — nothing about content or layout
 * depends on it, so a wrong guess degrades decoration and nothing else. */
export type DeviceTier = "low" | "mid" | "high";

export const PARTICLE_BUDGET: Record<DeviceTier, number> = {
  low: 0,
  mid: 26,
  high: 60,
};

export interface DeviceSlice {
  tier: DeviceTier;
  systemReducedMotion: boolean;

  setTier: (tier: DeviceTier) => void;
  setSystemReducedMotion: (value: boolean) => void;
}

export const createDeviceSlice: StateCreator<
  DeviceSlice & UiSlice,
  [],
  [],
  DeviceSlice
> = (set) => ({
  tier: "low",
  systemReducedMotion: false,

  setTier: (tier) => set({ tier }),
  setSystemReducedMotion: (systemReducedMotion) => set({ systemReducedMotion }),
});
