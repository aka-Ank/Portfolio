import type { StateCreator } from "zustand";

/** Picks the palette *family*. `auto` follows the real clock — light between
 * sunrise and sunset, dark otherwise. */
export type ColorMode = "light" | "dark" | "auto";

/** The five named points on the day. These are positions on the 0–1 OKLCH
 * ring, not separate palettes — which is what keeps the transitions between
 * them a continuous drift rather than a scene swap. */
export type TimeAnchor = "dawn" | "morning" | "afternoon" | "dusk" | "night";

/** Where the scene's time value comes from.
 * - `sync`: the visitor's real local clock (the default).
 * - a `TimeAnchor`: pinned manually.
 *
 * Deliberately *not* derived from scroll position. Driving the scene from how
 * far down the page someone is means it changes continuously while they are
 * trying to read it. */
export type TimeMode = "sync" | TimeAnchor;

/**
 * Weather. Each of these changes the forest's *mood* — never its hue, and
 * never its readability. `breeze` is the odd one out in that it adds no
 * overlay at all; it only raises the amplitude of motion that is already
 * there, which is what wind actually looks like.
 */
export type Weather = "clear" | "cloudy" | "misty" | "rain" | "breeze";

export const TIME_ANCHOR_VALUE: Record<TimeAnchor, number> = {
  dawn: 0.04,
  morning: 0.28,
  afternoon: 0.5,
  dusk: 0.74,
  night: 0.95,
};

/** Ambient bed level, 0–1. Separate from `soundEnabled` on purpose: muting
 * and turning the level down are different intents, and collapsing them means
 * a visitor who mutes loses the level they had chosen. */
export const DEFAULT_VOLUME = 0.5;

export interface UiSlice {
  colorMode: ColorMode;
  timeMode: TimeMode;
  weather: Weather;
  soundEnabled: boolean;
  volume: number;
  /** null = follow the OS. true/false = explicit visitor override. */
  manualReducedMotion: boolean | null;
  controlPanelOpen: boolean;

  setColorMode: (mode: ColorMode) => void;
  setTimeMode: (mode: TimeMode) => void;
  setWeather: (weather: Weather) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setManualReducedMotion: (value: boolean | null) => void;
  setControlPanelOpen: (open: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  colorMode: "auto",
  timeMode: "sync",
  weather: "clear",
  // Sound never starts on: browsers block unprompted audio, and a portfolio
  // that makes noise before being asked is the opposite of calm.
  soundEnabled: false,
  volume: DEFAULT_VOLUME,
  manualReducedMotion: null,
  controlPanelOpen: false,

  setColorMode: (colorMode) => set({ colorMode }),
  setTimeMode: (timeMode) => set({ timeMode }),
  setWeather: (weather) => set({ weather }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
  setManualReducedMotion: (manualReducedMotion) => set({ manualReducedMotion }),
  setControlPanelOpen: (controlPanelOpen) => set({ controlPanelOpen }),
});
