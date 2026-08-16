import type { ColorMode, TimeMode, Weather } from "@/state/uiSlice";
import { TIME_ANCHOR_VALUE } from "@/state/uiSlice";

/** An OKLCH colour as raw components, so it can be interpolated numerically
 * and only formatted at the point it reaches CSS. `culori` stays a
 * devDependency (the contrast audit) rather than shipping to the browser —
 * shortest-arc hue lerp is the only thing needed here. */
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

const k = (l: number, c: number, h: number): Oklch => ({ l, c, h });

/** The decorative atmosphere tokens. None of these are ever used as a text
 * colour or as a text background — see `SURFACES` for the contrast-critical
 * pair — so they are free to drift continuously without WCAG risk. */
export interface Atmosphere {
  skyTop: Oklch;
  skyMid: Oklch;
  skyHorizon: Oklch;
  glow: Oklch;
  aether: Oklch;
  /** The four forest depth planes, back to front. Each is *one flat colour*
   * per plane by design: the plates supply shape, the palette supplies colour,
   * so one silhouette serves all five times of day instead of needing five
   * baked exports. Aerial perspective is expressed by how close each plane
   * sits to the sky — far is nearly sky-coloured, foreground is furthest from
   * it — which is what reads as depth without any layer being loud. */
  layerFar: Oklch;
  layerMid: Oklch;
  layerNear: Oklch;
  layerFore: Oklch;
}

/** Five stops, one per named time of day, so `TIME_ANCHOR_VALUE` lands exactly
 * on a stop rather than between two of them. */
type Stops = [Atmosphere, Atmosphere, Atmosphere, Atmosphere, Atmosphere];

/**
 * Two families, five stops each — one per named time of day. Colour mode picks
 * the family; time of day picks the position *within* it. That is what lets
 * "light mode", "dark mode" and "time of day" all be real controls without
 * fighting each other: the light family walks its own dawn→night, the dark
 * family walks a deeper one, and neither can land the visitor somewhere the
 * other mode owns.
 *
 * In the light family the forest planes sit *below* the sky in lightness; in
 * the dark family they sit below it too, but the gap is smaller because a
 * silhouette on an already-dark sky needs very little separation to read.
 */
const LIGHT_STOPS: Stops = [
  // Dawn — the faintest warmth low in the frame, forest still cool.
  {
    skyTop: k(0.93, 0.025, 265),
    skyMid: k(0.95, 0.02, 40),
    skyHorizon: k(0.97, 0.02, 60),
    glow: k(0.97, 0.05, 70),
    aether: k(0.72, 0.1, 195),
    layerFar: k(0.88, 0.018, 250),
    layerMid: k(0.84, 0.022, 220),
    layerNear: k(0.79, 0.026, 190),
    layerFore: k(0.74, 0.03, 170),
  },
  // Morning — clear and cool.
  {
    skyTop: k(0.95, 0.018, 235),
    skyMid: k(0.97, 0.012, 215),
    skyHorizon: k(0.985, 0.008, 200),
    glow: k(0.98, 0.035, 95),
    aether: k(0.7, 0.11, 195),
    layerFar: k(0.9, 0.016, 225),
    layerMid: k(0.86, 0.022, 200),
    layerNear: k(0.81, 0.028, 178),
    layerFore: k(0.76, 0.034, 162),
  },
  // Afternoon — the flattest and brightest the site ever goes.
  {
    skyTop: k(0.96, 0.015, 230),
    skyMid: k(0.98, 0.01, 210),
    skyHorizon: k(0.99, 0.005, 160),
    glow: k(0.99, 0.025, 100),
    aether: k(0.68, 0.12, 190),
    layerFar: k(0.91, 0.014, 215),
    layerMid: k(0.87, 0.022, 190),
    layerNear: k(0.82, 0.03, 168),
    layerFore: k(0.77, 0.036, 155),
  },
  // Dusk — warm, still high-key, planes pulling down.
  {
    skyTop: k(0.92, 0.03, 255),
    skyMid: k(0.95, 0.035, 60),
    skyHorizon: k(0.96, 0.04, 45),
    glow: k(0.95, 0.08, 55),
    aether: k(0.7, 0.13, 185),
    layerFar: k(0.86, 0.024, 250),
    layerMid: k(0.81, 0.028, 210),
    layerNear: k(0.75, 0.032, 175),
    layerFore: k(0.69, 0.034, 150),
  },
  // Night, light family — the palette's own dusk-lit end. Still light enough
  // to read as "light mode"; the dark family owns actual darkness.
  {
    skyTop: k(0.88, 0.03, 265),
    skyMid: k(0.91, 0.025, 255),
    skyHorizon: k(0.93, 0.02, 250),
    glow: k(0.92, 0.03, 240),
    aether: k(0.7, 0.12, 200),
    layerFar: k(0.8, 0.026, 258),
    layerMid: k(0.75, 0.028, 245),
    layerNear: k(0.69, 0.03, 230),
    layerFore: k(0.63, 0.03, 220),
  },
];

const DARK_STOPS: Stops = [
  // Dawn — cold blue before any warmth arrives.
  {
    skyTop: k(0.19, 0.03, 275),
    skyMid: k(0.21, 0.035, 300),
    skyHorizon: k(0.25, 0.045, 35),
    glow: k(0.45, 0.08, 45),
    aether: k(0.7, 0.13, 190),
    layerFar: k(0.15, 0.026, 272),
    layerMid: k(0.13, 0.024, 265),
    layerNear: k(0.11, 0.02, 255),
    layerFore: k(0.09, 0.018, 248),
  },
  // Morning.
  {
    skyTop: k(0.2, 0.03, 250),
    skyMid: k(0.22, 0.03, 240),
    skyHorizon: k(0.25, 0.03, 220),
    glow: k(0.44, 0.05, 200),
    aether: k(0.72, 0.14, 200),
    layerFar: k(0.16, 0.024, 248),
    layerMid: k(0.14, 0.022, 240),
    layerNear: k(0.12, 0.02, 228),
    layerFore: k(0.1, 0.018, 218),
  },
  // Afternoon — the dark family's lightest point.
  {
    skyTop: k(0.21, 0.028, 240),
    skyMid: k(0.23, 0.025, 230),
    skyHorizon: k(0.26, 0.022, 215),
    glow: k(0.43, 0.04, 195),
    aether: k(0.72, 0.14, 198),
    layerFar: k(0.17, 0.022, 238),
    layerMid: k(0.15, 0.02, 228),
    layerNear: k(0.13, 0.018, 216),
    layerFore: k(0.11, 0.016, 206),
  },
  // Dusk — the last warmth on the horizon.
  {
    skyTop: k(0.17, 0.03, 270),
    skyMid: k(0.19, 0.035, 290),
    skyHorizon: k(0.22, 0.045, 30),
    glow: k(0.42, 0.08, 40),
    aether: k(0.72, 0.14, 192),
    layerFar: k(0.14, 0.026, 268),
    layerMid: k(0.12, 0.024, 258),
    layerNear: k(0.1, 0.02, 245),
    layerFore: k(0.08, 0.018, 235),
  },
  // Night — the deepest the site goes. The glow stays dim across this whole
  // family on purpose: a bright bloom on a dark page is the "blinding light
  // effect" this design rules out.
  {
    skyTop: k(0.12, 0.018, 265),
    skyMid: k(0.14, 0.02, 262),
    skyHorizon: k(0.17, 0.028, 255),
    glow: k(0.38, 0.03, 245),
    aether: k(0.74, 0.15, 205),
    layerFar: k(0.1, 0.016, 264),
    layerMid: k(0.09, 0.014, 260),
    layerNear: k(0.075, 0.012, 254),
    layerFore: k(0.06, 0.01, 250),
  },
];

/**
 * The contrast-critical pair, kept deliberately **discrete**. Interpolating
 * between the light and dark values would pass through a mid-grey ink on a
 * mid-grey surface — around 1:1 — so the light/dark switch crossfades two
 * whole rendered states instead (see ThemeDriver), never lerping the tokens
 * themselves. This is the same "two separate token systems" rule the project
 * has held from the start, enforced structurally rather than by convention.
 */
export const SURFACES = {
  light: {
    surface: "oklch(0.99 0.004 90 / 0.88)",
    surfaceSolid: "oklch(0.99 0.004 90)",
    surfaceRaised: "oklch(0.97 0.006 90 / 0.94)",
    border: "oklch(0.86 0.012 90)",
    ink: "oklch(0.18 0.012 260)",
    inkMuted: "oklch(0.44 0.012 250)",
    accentInk: "oklch(0.45 0.11 195)",
    focusRing: "oklch(0.45 0.14 205)",
  },
  dark: {
    surface: "oklch(0.2 0.018 262 / 0.82)",
    surfaceSolid: "oklch(0.18 0.018 262)",
    surfaceRaised: "oklch(0.24 0.02 262 / 0.9)",
    border: "oklch(0.32 0.02 260)",
    ink: "oklch(0.96 0.006 90)",
    inkMuted: "oklch(0.74 0.012 250)",
    accentInk: "oklch(0.8 0.12 200)",
    focusRing: "oklch(0.82 0.14 205)",
  },
} as const;

export type SurfaceFamily = keyof typeof SURFACES;

/**
 * What each weather does to the scene. Deliberately expressed as four scalars
 * rather than as separate scenes, so weather can crossfade continuously and
 * can never introduce a shape the clear scene did not already have.
 *
 * - `veil`   — how strongly the haze mutes the planes behind it. Aerial
 *              perspective, so it is what actually reads as distance.
 * - `cloud`  — opacity of the cloud band.
 * - `sway`   — multiplier on every wind-driven loop. `breeze` is the only
 *              weather that changes *motion* rather than adding an overlay,
 *              which is what wind actually is.
 * - `drops`  — rain density, 0 for everything except rain.
 *
 * No entry changes hue. Mist and rain are the same forest in different
 * conditions, not a different palette — that is what keeps weather from
 * fighting the time of day.
 */
export interface WeatherEffect {
  veil: number;
  cloud: number;
  sway: number;
  drops: number;
}

export const WEATHER: Record<Weather, WeatherEffect> = {
  clear: { veil: 0.06, cloud: 0.18, sway: 1, drops: 0 },
  cloudy: { veil: 0.22, cloud: 0.85, sway: 1.15, drops: 0 },
  misty: { veil: 0.55, cloud: 0.35, sway: 0.7, drops: 0 },
  rain: { veil: 0.38, cloud: 0.72, sway: 1.3, drops: 1 },
  breeze: { veil: 0.08, cloud: 0.3, sway: 1.9, drops: 0 },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Shortest arc around the hue circle — lerping 350→10 the long way would
 * sweep the entire spectrum through green. */
function lerpHue(a: number, b: number, t: number): number {
  const delta = ((b - a + 540) % 360) - 180;
  return (a + delta * t + 360) % 360;
}

export function lerpOklch(a: Oklch, b: Oklch, t: number): Oklch {
  return {
    l: lerp(a.l, b.l, t),
    c: lerp(a.c, b.c, t),
    h: lerpHue(a.h, b.h, t),
  };
}

export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`;
}

const ATMOSPHERE_KEYS = [
  "skyTop",
  "skyMid",
  "skyHorizon",
  "glow",
  "aether",
  "layerFar",
  "layerMid",
  "layerNear",
  "layerFore",
] as const;

export function lerpAtmosphere(a: Atmosphere, b: Atmosphere, t: number): Atmosphere {
  const out = {} as Atmosphere;
  for (const key of ATMOSPHERE_KEYS) out[key] = lerpOklch(a[key], b[key], t);
  return out;
}

/**
 * Sample a family at `t` (0–1) across its five stops.
 *
 * `Number.isFinite` rather than a bare clamp, because `Math.max(NaN, 0)` is
 * NaN — a clamp does not actually clamp NaN. That propagated to
 * `Math.floor(NaN)` and then indexed the stop array as `stops[NaN]`, which is
 * `undefined`, which threw one frame later inside `lerpAtmosphere`. Since this
 * runs on every theme change, throwing here takes the whole page's styling
 * with it, so an unusable input degrades to dawn instead.
 */
export function atmosphereAt(family: SurfaceFamily, t: number): Atmosphere {
  const stops = family === "light" ? LIGHT_STOPS : DARK_STOPS;
  const safe = Number.isFinite(t) ? Math.min(Math.max(t, 0), 1) : 0;
  const scaled = safe * (stops.length - 1);
  const index = Math.min(Math.floor(scaled), stops.length - 2);
  return lerpAtmosphere(stops[index], stops[index + 1], scaled - index);
}

/** Real local clock → a 0–1 position on the ring, and the family it implies.
 * Sunrise/sunset are fixed at 06:00/18:30 rather than computed from
 * geolocation: asking for a visitor's coordinates to tint a background is a
 * bad trade, and the approximation is invisible at this level of abstraction. */
export function clockToTime(date = new Date()): { t: number; family: SurfaceFamily } {
  const hours = date.getHours() + date.getMinutes() / 60;
  const SUNRISE = 6;
  const SUNSET = 18.5;

  if (hours >= SUNRISE && hours < SUNSET) {
    return { t: (hours - SUNRISE) / (SUNSET - SUNRISE), family: "light" };
  }
  const nightLength = 24 - SUNSET + SUNRISE;
  const into = hours >= SUNSET ? hours - SUNSET : hours + (24 - SUNSET);
  return { t: into / nightLength, family: "dark" };
}

/**
 * Resolve the visitor-facing controls into the two things the renderer
 * actually needs: which surface family is active, and where on that family's
 * ring the atmosphere sits.
 *
 * Note what is *not* an input here: scroll position. The palette depends only
 * on settings and the clock, so it stays put while the visitor reads.
 */
export function resolveTheme(
  colorMode: ColorMode,
  timeMode: TimeMode,
  now = new Date(),
): { family: SurfaceFamily; t: number } {
  const clock = clockToTime(now);
  const family: SurfaceFamily = colorMode === "auto" ? clock.family : colorMode;

  if (timeMode === "sync") return { family, t: clock.t };

  // Falling back rather than trusting the value, because this one is *not*
  // guaranteed to be a valid `TimeMode` at runtime: it is restored from the
  // visitor's localStorage, which may have been written by an older build with
  // a different set of names. An unknown key here used to produce `undefined`
  // → NaN → `stops[NaN]` → a TypeError inside ThemeDriver, which aborted the
  // effect before it wrote any surface tokens and left the whole page
  // unstyled. A stale preference must never be able to break rendering.
  const anchor = TIME_ANCHOR_VALUE[timeMode];
  return { family, t: typeof anchor === "number" ? anchor : clock.t };
}
