import type { StateCreator } from "zustand";

/** Picks the palette *family*. `auto` follows the real clock — light between
 * sunrise and sunset, dark otherwise. */
export type ColorMode = "light" | "dark" | "auto";

/** Named positions on the 0–1 time-of-day ring, for the manual control. */
export type TimeAnchor = "dawn" | "day" | "golden" | "night";

/** Where the atmosphere's time value comes from.
 * - `journey`: each section's own `timeOfDay` (the default — the walk from
 *   the meadow at dawn to the campfire at night is the point).
 * - `sync`: the visitor's real local clock.
 * - a `TimeAnchor`: pinned manually. */
export type TimeMode = "journey" | "sync" | TimeAnchor;

export type Weather = "clear" | "mist" | "rain";

export const TIME_ANCHOR_VALUE: Record<TimeAnchor, number> = {
  dawn: 0.05,
  day: 0.35,
  golden: 0.62,
  night: 0.9,
};

export interface UiSlice {
  colorMode: ColorMode;
  timeMode: TimeMode;
  weather: Weather;
  soundEnabled: boolean;
  /** null = follow the OS. true/false = explicit visitor override. */
  manualReducedMotion: boolean | null;
  controlPanelOpen: boolean;

  setColorMode: (mode: ColorMode) => void;
  setTimeMode: (mode: TimeMode) => void;
  setWeather: (weather: Weather) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setManualReducedMotion: (value: boolean | null) => void;
  setControlPanelOpen: (open: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  colorMode: "auto",
  timeMode: "journey",
  weather: "clear",
  // Sound never starts on: browsers block unprompted audio, and a portfolio
  // that makes noise before being asked is the opposite of calm.
  soundEnabled: false,
  manualReducedMotion: null,
  controlPanelOpen: false,

  setColorMode: (colorMode) => set({ colorMode }),
  setTimeMode: (timeMode) => set({ timeMode }),
  setWeather: (weather) => set({ weather }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setManualReducedMotion: (manualReducedMotion) => set({ manualReducedMotion }),
  setControlPanelOpen: (controlPanelOpen) => set({ controlPanelOpen }),
});
