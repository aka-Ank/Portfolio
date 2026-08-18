import type { ColorMode, TimeAnchor, TimeMode } from "@/state/uiSlice";
import { TIME_ANCHOR_HOUR } from "@/state/uiSlice";
import type { SurfaceFamily } from "./palette";

/**
 * The sky's physical model — and the single source of truth for time of day.
 *
 * Everything downstream reads from here: the palette's ring position, the
 * surface family, where the sun and moon sit on screen, which animals are out,
 * how strong the light shafts are, and which ambient bed plays. Nothing else in
 * the codebase is allowed to branch on the clock.
 *
 * That centralisation is the whole point. The previous arrangement had colour
 * mode and time of day as *independent* controls, which meant a visitor could
 * pin "night" while the light family was active and get a palette that was
 * neither — the "half-day/half-night" state. Deriving both from one sun
 * altitude makes that combination unrepresentable rather than merely
 * discouraged.
 *
 * Pure and synchronous by design, so it can be exhaustively tested and called
 * during render without an effect.
 */

/** Fixed civil sunrise/sunset. Deliberately *not* computed from geolocation:
 * asking a visitor for their coordinates in order to tint a background is a bad
 * trade, and at this level of abstraction the approximation is invisible. */
export const SUNRISE = 6;
export const SUNSET = 18.5;
const DAY_LENGTH = SUNSET - SUNRISE;
const NIGHT_LENGTH = 24 - DAY_LENGTH;

/** Peak altitudes in degrees. 60° is a plausible mid-latitude solar noon; the
 * moon's arc is shallower so the two never trace the same path. */
export const SUN_PEAK = 60;
export const MOON_PEAK = 55;

export interface SkyState {
  /** Hour of the day this state was sampled at, 0–24. */
  hour: number;
  /** Sun altitude in degrees. Positive is above the horizon. Every
   * plausibility rule in the scene keys off this rather than off a name. */
  sunAltitude: number;
  /** 0 at the eastern horizon (screen left) → 1 at the western (screen right).
   * Continues past the range while the body is below the horizon, so it never
   * jumps while visible. */
  sunAzimuth: number;
  moonAltitude: number;
  moonAzimuth: number;
  /** 0 = new moon, 1 = full. Drives the crescent, nothing else. */
  moonIllumination: number;
  /** True while the moon is waxing, which is the side of the disc that is lit. */
  moonWaxing: boolean;
  /** Which palette family this sky implies. Not a separate control any more. */
  family: SurfaceFamily;
  /** Position on the active family's five-stop ring, 0–1. */
  t: number;
}

/**
 * Sun altitude and azimuth for an hour of the day.
 *
 * One sinusoid over the *solar* parameter `p` (0 at sunrise, 1 at sunset)
 * covers the whole 24 hours: past 1 it goes negative, which is night. Because
 * 24 / DAY_LENGTH ≈ 1.92 — very nearly 2 — the curve is almost exactly
 * periodic, so the parameter's wrap at midnight lands at −58.9° on one side and
 * −59.9° on the other. That 1° seam sits at the deepest point of the night,
 * where the disc is far below the treeline and rendered at zero opacity.
 */
function solarPosition(hour: number): { altitude: number; azimuth: number } {
  const p = (hour - SUNRISE) / DAY_LENGTH;
  return { altitude: SUN_PEAK * Math.sin(Math.PI * p), azimuth: p };
}

/**
 * The moon rises at sunset and sets at sunrise.
 *
 * This is a deliberate simplification. A real moon rises ~50 minutes later each
 * day, so roughly half of all nights would have no moon above the horizon at
 * all — accurate, but it would leave the night sky empty and unlit on a coin
 * flip, and the moon is supposed to be *the* light source at night. The
 * illumination below is genuinely computed, so the moon still changes shape
 * night to night; only its rising time is idealised.
 */
function lunarPosition(hour: number): { altitude: number; azimuth: number } {
  const into = hour >= SUNSET ? hour - SUNSET : hour + (24 - SUNSET);
  const n = into / NIGHT_LENGTH;
  return { altitude: MOON_PEAK * Math.sin(Math.PI * n), azimuth: n };
}

/** Reference new moon: 2000-01-06 18:14 UTC. */
const NEW_MOON_EPOCH = Date.UTC(2000, 0, 6, 18, 14);
const SYNODIC_MONTH_MS = 29.530588853 * 24 * 60 * 60 * 1000;

/** Real lunar phase, because it is four lines and it means the crescent is
 * never wrong for the night someone actually visits. */
export function lunarPhase(date: Date): { illumination: number; waxing: boolean } {
  const age = (((date.getTime() - NEW_MOON_EPOCH) % SYNODIC_MONTH_MS) + SYNODIC_MONTH_MS) %
    SYNODIC_MONTH_MS;
  const cycle = age / SYNODIC_MONTH_MS;
  return {
    illumination: (1 - Math.cos(2 * Math.PI * cycle)) / 2,
    waxing: cycle < 0.5,
  };
}

/**
 * How far to slide the shadow disc across the moon to draw its phase, as a
 * fraction of the moon's own width.
 *
 * 0 leaves the shadow centred — the disc fully covered — and 1.9 carries it
 * clear off the edge. So **illumination maps directly to offset**: a full moon
 * pushes the shadow away, a new moon lets it sit right on top. Getting that
 * backwards produces a moon that is solid when it should be dark and dark when
 * it should be solid, which is invisible in a screenshot of a nearly-full night
 * and obvious a fortnight later.
 *
 * The floor is the same idealisation as the moon's rising time: a real new moon
 * is invisible, and the point of having a moon here is that the night always
 * has a light source. So the thinnest it ever goes is a crescent, not nothing.
 */
const THINNEST_CRESCENT = 0.42;

export function crescentShadowOffset(illumination: number): number {
  const safe = Number.isFinite(illumination) ? Math.min(Math.max(illumination, 0), 1) : 1;
  return (THINNEST_CRESCENT + (1 - THINNEST_CRESCENT) * safe) * 1.9;
}

/** How far into the night, 0 at sunset → 1 at sunrise. The dark family's ring. */
function nightProgress(hour: number): number {
  const into = hour >= SUNSET ? hour - SUNSET : hour + (24 - SUNSET);
  return into / NIGHT_LENGTH;
}

/**
 * Build the full sky state for a given hour.
 *
 * The family follows the sun crossing the horizon, which is what makes "light
 * mode = dawn/day/dusk, dark mode = night" structural instead of a convention
 * someone has to remember.
 */
export function skyAt(hour: number, date = new Date()): SkyState {
  const safeHour = Number.isFinite(hour) ? ((hour % 24) + 24) % 24 : 12;
  const sun = solarPosition(safeHour);
  const moon = lunarPosition(safeHour);
  const { illumination, waxing } = lunarPhase(date);

  const family: SurfaceFamily = sun.altitude >= 0 ? "light" : "dark";
  const t =
    family === "light"
      ? Math.min(Math.max((safeHour - SUNRISE) / DAY_LENGTH, 0), 1)
      : Math.min(Math.max(nightProgress(safeHour), 0), 1);

  return {
    hour: safeHour,
    sunAltitude: sun.altitude,
    sunAzimuth: sun.azimuth,
    moonAltitude: moon.altitude,
    moonAzimuth: moon.azimuth,
    moonIllumination: illumination,
    moonWaxing: waxing,
    family,
    t,
  };
}

/**
 * Resolve the visitor's two controls into one sky.
 *
 * `colorMode` no longer picks a palette independently of the time — it selects
 * which *arc* the visitor is on, and a manual light/dark choice moves the sun
 * accordingly. `timeMode` then picks the position along that arc. The two can
 * no longer disagree, because there is only one quantity.
 *
 * Note what is still not an input: scroll position. The sky depends only on
 * settings and the clock, so it stays put while someone is reading.
 */
export function resolveSky(colorMode: ColorMode, timeMode: TimeMode, now = new Date()): SkyState {
  const clockHour = now.getHours() + now.getMinutes() / 60;

  // A stale `timeMode` from an older build must never reach the lookup as an
  // unknown key: that used to produce `undefined` → NaN → an index of
  // `stops[NaN]`, which threw inside ThemeDriver before it had written a single
  // surface token and left the entire page unstyled. Falling back to the clock
  // degrades instead.
  const pinnedHour =
    timeMode === "sync" ? null : (TIME_ANCHOR_HOUR[timeMode as TimeAnchor] ?? null);

  let hour = pinnedHour ?? clockHour;

  // An explicit light/dark choice is a choice of arc. If the resolved hour sits
  // on the wrong side of the horizon for it, move to the equivalent point on
  // the requested one rather than rendering a family the sky contradicts.
  if (colorMode !== "auto") {
    const implied = skyAt(hour, now).family;
    if (implied !== colorMode) hour = TIME_ANCHOR_HOUR[colorMode === "dark" ? "night" : "afternoon"];
  }

  return skyAt(hour, now);
}
