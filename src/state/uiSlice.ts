import type { StateCreator } from "zustand";

/** Picks the palette *family*. `auto` follows the real clock — light between
 * sunrise and sunset, dark otherwise. */
export type ColorMode = "light" | "dark" | "auto";

/** Named positions on the 0–1 time-of-day ring, for the manual control. */
export type TimeAnchor = "dawn" | "day" | "golden" | "night";

/** Where the atmosphere's time value comes from.
 * - `sync`: the visitor's real local clock (the default).
 * - a `TimeAnchor`: pinned manually.
 *
 * Deliberately *not* derived from scroll position. Driving the palette from
 * how far down the page someone is means the site changes colour continuously
 * while they are trying to read it. Time of day is a setting. */
export type TimeMode = "sync" | TimeAnchor;

/** How strongly the backdrop's veil mutes the glows behind it. Named for what
 * the visitor sees rather than for weather, because nothing here simulates
 * weather — there is no rain, and pretending otherwise would be decoration
 * without meaning. */
export type Ambience = "clear" | "soft" | "muted";

export const TIME_ANCHOR_VALUE: Record<TimeAnchor, number> = {
  dawn: 0.05,
  day: 0.35,
  golden: 0.62,
  night: 0.9,
};

/** Ambient bed level, 0–1. Separate from `soundEnabled` on purpose: muting
 * and turning the level down are different intents, and collapsing them means
 * a visitor who mutes loses the level they had chosen. */
export const DEFAULT_VOLUME = 0.5;

export interface UiSlice {
  colorMode: ColorMode;
  timeMode: TimeMode;
  ambience: Ambience;
  soundEnabled: boolean;
  volume: number;
  /** null = follow the OS. true/false = explicit visitor override. */
  manualReducedMotion: boolean | null;
  controlPanelOpen: boolean;

  setColorMode: (mode: ColorMode) => void;
  setTimeMode: (mode: TimeMode) => void;
  setAmbience: (ambience: Ambience) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setManualReducedMotion: (value: boolean | null) => void;
  setControlPanelOpen: (open: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  colorMode: "auto",
  timeMode: "sync",
  ambience: "clear",
  // Sound never starts on: browsers block unprompted audio, and a portfolio
  // that makes noise before being asked is the opposite of calm.
  soundEnabled: false,
  volume: DEFAULT_VOLUME,
  manualReducedMotion: null,
  controlPanelOpen: false,

  setColorMode: (colorMode) => set({ colorMode }),
  setTimeMode: (timeMode) => set({ timeMode }),
  setAmbience: (ambience) => set({ ambience }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
  setManualReducedMotion: (manualReducedMotion) => set({ manualReducedMotion }),
  setControlPanelOpen: (controlPanelOpen) => set({ controlPanelOpen }),
});
