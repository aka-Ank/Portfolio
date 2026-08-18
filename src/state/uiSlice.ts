import type { StateCreator } from "zustand";

/** Which side of the horizon the visitor wants to be on. `auto` follows the
 * real clock.
 *
 * This is no longer independent of the time of day: light *is* the sun's arc
 * and dark *is* the moon's, so choosing one chooses where the sun sits. See
 * `systems/theme/sky.ts`. */
export type ColorMode = "light" | "dark" | "auto";

/** The five named points on the day. Each one is an *hour*, from which the sun
 * altitude, the palette ring position and the surface family are all derived —
 * so a named time can never imply a family the sky contradicts. */
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
 * Weather. Six states, each changing the world's *mood* — never its hue, and
 * never its readability.
 *
 * The identifiers are deliberately not renamed to match their labels
 * (`breeze` shows as "Windy", `rain` as "Rainy"). They are persisted to
 * localStorage, so renaming them would strand every returning visitor's setting
 * for no functional gain; `sanitise` would silently reset it. The labels live in
 * the control, where they belong.
 */
export type Weather = "clear" | "breeze" | "misty" | "rain" | "cloudy" | "snowy";

/**
 * The hour each named time pins to — the anchors' single definition.
 *
 * Hours rather than ring positions, because the sun's altitude is now what
 * everything derives from. The four daytime anchors all land at a positive
 * altitude and therefore in the light family; `night` lands at −46°, deep in
 * the dark one. That is what makes "light = dawn/day/dusk, dark = night"
 * structural: it is a consequence of where the sun is, not a rule enforced
 * somewhere else.
 *
 * `dawn` and `dusk` sit at +9° and +6° on purpose — inside golden hour, where
 * the light shafts are strongest and the warmth is real rather than asserted.
 */
export const TIME_ANCHOR_HOUR: Record<TimeAnchor, number> = {
  dawn: 6.6,
  morning: 9.2,
  afternoon: 15.2,
  dusk: 18.1,
  night: 22,
};

/** Which family each named time implies. Derived from the hours above rather
 * than listed independently, so the two can never drift apart. */
export function familyForAnchor(anchor: TimeAnchor): "light" | "dark" {
  return TIME_ANCHOR_HOUR[anchor] >= 6 && TIME_ANCHOR_HOUR[anchor] < 18.5 ? "light" : "dark";
}

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

  // The two time controls are kept consistent *here* rather than in the sky
  // model, so the store can never hold a combination the renderer has to
  // reconcile. Light and dark are the sun's arc and the moon's; picking a named
  // time therefore also picks a side of the horizon, and picking a side of the
  // horizon discards a pin that contradicts it.
  setColorMode: (colorMode) =>
    set((state) => ({
      colorMode,
      timeMode:
        colorMode !== "auto" &&
        state.timeMode !== "sync" &&
        familyForAnchor(state.timeMode) !== colorMode
          ? "sync"
          : state.timeMode,
    })),

  setTimeMode: (timeMode) =>
    set({
      timeMode,
      // "Follow the clock" is one intent, not two: a visitor who asks for the
      // real time and then gets an unrelated pinned family has been given half
      // of what they asked for.
      colorMode: timeMode === "sync" ? "auto" : familyForAnchor(timeMode),
    }),
  setWeather: (weather) => set({ weather }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
  setManualReducedMotion: (manualReducedMotion) => set({ manualReducedMotion }),
  setControlPanelOpen: (controlPanelOpen) => set({ controlPanelOpen }),
});
