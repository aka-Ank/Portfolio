import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createUiSlice,
  DEFAULT_VOLUME,
  TIME_ANCHOR_HOUR,
  familyForAnchor,
  type ColorMode,
  type TimeMode,
  type UiSlice,
  type Weather,
} from "./uiSlice";
import { createNavSlice, type NavSlice } from "./navSlice";
import { createDeviceSlice, type DeviceSlice } from "./deviceSlice";

export type AppState = UiSlice & NavSlice & DeviceSlice;

/** Exactly what `partialize` writes, and therefore exactly what `migrate` has
 * to hand back — fully populated, not a partial. */
interface PersistedPrefs {
  colorMode: ColorMode;
  timeMode: TimeMode;
  weather: Weather;
  soundEnabled: boolean;
  volume: number;
  manualReducedMotion: boolean | null;
}

const DEFAULTS: PersistedPrefs = {
  colorMode: "auto",
  timeMode: "sync",
  weather: "clear",
  soundEnabled: false,
  volume: DEFAULT_VOLUME,
  manualReducedMotion: null,
};

const COLOR_MODES: ColorMode[] = ["light", "dark", "auto"];
const WEATHERS: Weather[] = ["clear", "breeze", "misty", "rain", "cloudy", "snowy"];

function isValidTimeMode(value: unknown): value is TimeMode {
  return value === "sync" || (typeof value === "string" && value in TIME_ANCHOR_HOUR);
}

/** Coerce whatever is in storage into a valid preferences object, keeping
 * every field that survives scrutiny and defaulting the rest.
 *
 * Since v3 this also has to reconcile a *pair* rather than validate two fields
 * independently: v2 let colour mode and time of day disagree, so a returning
 * visitor can genuinely be holding `{ colorMode: "light", timeMode: "night" }`
 * — a combination that no longer has a sky to render. The pin is what gets
 * dropped, because it is the more specific of the two and the light/dark
 * toggle is the control a visitor is more likely to have set deliberately. */
function sanitise(raw: unknown): PersistedPrefs {
  const value = (raw ?? {}) as Record<string, unknown>;
  const colorMode = COLOR_MODES.includes(value.colorMode as ColorMode)
    ? (value.colorMode as ColorMode)
    : DEFAULTS.colorMode;
  const timeMode = isValidTimeMode(value.timeMode) ? value.timeMode : DEFAULTS.timeMode;
  const consistent =
    colorMode === "auto" || timeMode === "sync" || familyForAnchor(timeMode) === colorMode;

  return {
    colorMode,
    timeMode: consistent ? timeMode : DEFAULTS.timeMode,
    weather: WEATHERS.includes(value.weather as Weather)
      ? (value.weather as Weather)
      : DEFAULTS.weather,
    soundEnabled:
      typeof value.soundEnabled === "boolean" ? value.soundEnabled : DEFAULTS.soundEnabled,
    volume:
      typeof value.volume === "number" && Number.isFinite(value.volume)
        ? Math.min(1, Math.max(0, value.volume))
        : DEFAULTS.volume,
    manualReducedMotion:
      typeof value.manualReducedMotion === "boolean" || value.manualReducedMotion === null
        ? (value.manualReducedMotion as boolean | null)
        : DEFAULTS.manualReducedMotion,
  };
}

/**
 * Persisted preferences, version 3.
 *
 * The version matters. Persisted state is the one input that arrives from a
 * *previous build* of the app: a visitor who set "Golden hour" before the five
 * time-of-day states existed still has `timeMode: "golden"` in their browser,
 * and a visitor from before the forest has `ambience: "soft"` instead of a
 * weather. Restoring either unchecked used to reach the anchor table with an
 * unknown key → `undefined` → NaN → a TypeError in ThemeDriver, which aborted
 * before writing any surface token and left the site rendering unstyled.
 *
 * `migrate` runs once per visitor whose stored version is older and repairs
 * the shape; the field-level checks then catch anything `migrate` did not
 * anticipate. Both layers are cheap and the failure they prevent is total.
 */
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createUiSlice(...a),
      ...createNavSlice(...a),
      ...createDeviceSlice(...a),
    }),
    {
      name: "portfolio-preferences",
      version: 3,
      // v1 stored `ambience` and a different set of time names. There is no
      // sensible mapping from "how muted is the backdrop" to a weather, so the
      // old key is dropped rather than guessed at. v2 allowed colour mode and
      // time of day to disagree; `sanitise` reconciles that pair too.
      migrate: (persisted) => sanitise(persisted),
      // Only the visitor's deliberate choices survive a reload. Navigation
      // and device state must always reflect the current visit, never a
      // stale one.
      partialize: (state) => ({
        colorMode: state.colorMode,
        timeMode: state.timeMode,
        weather: state.weather,
        soundEnabled: state.soundEnabled,
        volume: state.volume,
        manualReducedMotion: state.manualReducedMotion,
      }),
      // Belt and braces: `migrate` only runs when the stored version is *older*
      // than the current one, so a hand-edited or partially-written entry
      // already at version 2 would otherwise go straight through unchecked.
      merge: (persisted, current) => ({ ...current, ...sanitise(persisted) }),
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
