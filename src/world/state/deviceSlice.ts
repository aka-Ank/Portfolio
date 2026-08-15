import type { StateCreator } from "zustand";
import type { DeviceTier } from "@/types/world";

export interface DeviceSlice {
  tier: DeviceTier;
  /** Derived: manualReducedMotion if set, otherwise systemReducedMotion. */
  reducedMotion: boolean;
  systemReducedMotion: boolean;
  manualReducedMotion: boolean | null;
  webglAvailable: boolean;

  setTier: (tier: DeviceTier) => void;
  setSystemReducedMotion: (value: boolean) => void;
  setManualReducedMotion: (value: boolean | null) => void;
  setWebglAvailable: (value: boolean) => void;
}

export const createDeviceSlice: StateCreator<
  DeviceSlice,
  [],
  [],
  DeviceSlice
> = (set, get) => ({
  tier: "mid",
  reducedMotion: false,
  systemReducedMotion: false,
  manualReducedMotion: null,
  webglAvailable: true,

  setTier: (tier) => set({ tier }),

  setSystemReducedMotion: (value) => {
    set({
      systemReducedMotion: value,
      reducedMotion: get().manualReducedMotion ?? value,
    });
  },

  setManualReducedMotion: (value) => {
    set({
      manualReducedMotion: value,
      reducedMotion: value ?? get().systemReducedMotion,
    });
  },

  setWebglAvailable: (value) => set({ webglAvailable: value }),
});
