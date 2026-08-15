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
  // Start conservative (no shadows, dpr 1 — see QUALITY_BY_TIER), not "mid".
  // useDeviceTier's heuristic corrects this within one effect tick on every
  // device, and PerformanceGovernor fine-tunes it further from real frame
  // timing — but both of those run *after* first mount, while this literal
  // default is what the very first Canvas commit (and therefore LCP/TBT/TTI)
  // pays for. Defaulting to "mid" meant every visitor — including ones on
  // hardware that gets corrected down to "low" moments later — paid for
  // shadow-map setup on the single most performance-critical frame. See
  // ENGINEER_NOTES.md "Lighthouse performance audit."
  tier: "low",
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
