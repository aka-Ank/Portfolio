import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createTimeSlice, type TimeSlice } from "./timeSlice";
import { createNavigationSlice, type NavigationSlice } from "./navigationSlice";
import { createProgressSlice, type ProgressSlice } from "./progressSlice";
import { createDeviceSlice, type DeviceSlice } from "./deviceSlice";

export type WorldState = TimeSlice & NavigationSlice & ProgressSlice & DeviceSlice;

// Progress is the only slice worth persisting (docs/04 §3: "a memory-of-the
// visit convenience, not an account system"). Everything else resets on
// reload by design — time-of-day, navigation, and device state should always
// reflect the current session, not a stale one.
export const useWorldStore = create<WorldState>()(
  persist(
    (...a) => ({
      ...createTimeSlice(...a),
      ...createNavigationSlice(...a),
      ...createProgressSlice(...a),
      ...createDeviceSlice(...a),
    }),
    {
      name: "portfolio-world-progress",
      partialize: (state) => ({
        viewedChapters: state.viewedChapters,
        loreFound: state.loreFound,
        easterEggFound: state.easterEggFound,
      }),
    },
  ),
);

/** Non-reactive read for use inside R3F's useFrame — never subscribe there. */
export const getWorldState = useWorldStore.getState;
