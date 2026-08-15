import type { StateCreator } from "zustand";
import type { TimeOfDayAnchor } from "@/types/world";

// Holds only the *discrete target* anchor. The continuously-damped render
// value (what the sky/light/fog actually animate toward) is computed inside
// world/systems/time-of-day's useFrame loop, not in this store — see
// docs/04-state-machines.md §1 and ENGINEER_NOTES.md for why per-frame values
// stay out of Zustand (avoids re-rendering every DOM subscriber at 60fps).
export interface TimeSlice {
  targetAnchor: TimeOfDayAnchor;
  /** Manual override entry point for the Phase 4 day/night control. */
  setTargetAnchor: (anchor: TimeOfDayAnchor) => void;
}

export const createTimeSlice: StateCreator<TimeSlice, [], [], TimeSlice> = (
  set,
) => ({
  targetAnchor: "dawn",
  setTargetAnchor: (anchor) => set({ targetAnchor: anchor }),
});
