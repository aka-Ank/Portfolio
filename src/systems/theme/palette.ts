import type { Weather } from "@/state/uiSlice";

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
  /** The disc of whichever body is up. Kept as its own token rather than reusing
   * `glow`, because the disc and the light it throws are different things: the
   * bloom has to stay soft and wide while the disc stays small and defined.
   *
   * In the dark family this is held **dim** for the same reason `glow` is: a
   * moon bright enough to look like a lamp is the "blinding light effect" the
   * design rules out. `contrast-audit.test.ts` samples it too — a panel really
   * does scroll in front of the moon — though the palette clears that bar with
   * room to spare, so dimness here is the design constraint and the audit is
   * the backstop. */
  celestial: Oklch;
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

/** Five stops per family, evenly spaced across the ring, so each named time
 * lands on or beside a stop rather than in the middle of a long interpolation. */
type Stops = [Atmosphere, Atmosphere, Atmosphere, Atmosphere, Atmosphere];

/**
 * Two families, and they are not two moods — they are **the sun's arc and the
 * moon's**.
 *
 * `LIGHT_STOPS` walks sunrise → sunset: dawn, morning, noon, afternoon, dusk.
 * `DARK_STOPS` walks sunset → sunrise: nightfall, early night, midnight, late
 * night, first light. `t` is the fraction travelled along whichever arc the sun
 * altitude puts the visitor on, so `t = 0` is always "the body has just risen"
 * and `t = 1` is always "it is about to set".
 *
 * This replaces an arrangement where both families carried all five *named*
 * times independently of each other, which forced two stops that described
 * nothing real — a "night" in the light family that was actually late dusk, and
 * an "afternoon" in the dark family that was just the least dark night. Those
 * were the artefacts of colour mode and time of day being orthogonal controls.
 * Now the sky decides both, so every stop is a place the sun actually goes.
 *
 * In the light family the forest planes sit *below* the sky in lightness; in
 * the dark family they sit below it too, but the gap is smaller because a
 * silhouette on an already-dark sky needs very little separation to read.
 *
 * The light family's near and fore planes were deepened once the world became a
 * generated strip. At 0.81 and 0.76 against a 0.97 sky each plane differed from
 * its neighbour by 0.05, which was enough while the planes were three or four
 * large shapes and not enough once the foreground carried fern blades and grass:
 * the detail was there in the DOM and invisible on screen. The floor is set by
 * `contrast-audit.test.ts`, which requires bare `--ink` to clear 4.5:1 against
 * every plane colour — that puts the darkest usable light-family plane at about
 * lightness 0.60.
 */
const LIGHT_STOPS: Stops = [
  // Dawn — the faintest warmth low in the frame, forest still cool. The sun is
  // barely above the treeline, so the disc is at its most saturated.
  {
    skyTop: k(0.93, 0.025, 265),
    skyMid: k(0.95, 0.02, 40),
    skyHorizon: k(0.97, 0.02, 60),
    glow: k(0.97, 0.05, 70),
    celestial: k(0.89, 0.155, 62),
    aether: k(0.72, 0.1, 195),
    layerFar: k(0.88, 0.018, 250),
    layerMid: k(0.815, 0.024, 220),
    layerNear: k(0.725, 0.03, 190),
    layerFore: k(0.635, 0.036, 170),
  },
  // Morning — clear and cool, the warmth burnt off.
  {
    skyTop: k(0.95, 0.018, 235),
    skyMid: k(0.97, 0.012, 215),
    skyHorizon: k(0.985, 0.008, 200),
    glow: k(0.98, 0.035, 95),
    celestial: k(0.945, 0.105, 82),
    aether: k(0.7, 0.11, 195),
    layerFar: k(0.9, 0.016, 225),
    layerMid: k(0.835, 0.024, 200),
    layerNear: k(0.745, 0.032, 178),
    layerFore: k(0.655, 0.04, 162),
  },
  // Noon — the flattest and brightest the site ever goes. Overhead light casts
  // no visible shafts, which is why SHAFT strength bottoms out here.
  {
    skyTop: k(0.96, 0.015, 230),
    skyMid: k(0.98, 0.01, 210),
    skyHorizon: k(0.99, 0.005, 160),
    glow: k(0.99, 0.025, 100),
    celestial: k(0.965, 0.075, 95),
    aether: k(0.68, 0.12, 190),
    layerFar: k(0.91, 0.014, 215),
    layerMid: k(0.845, 0.024, 190),
    layerNear: k(0.755, 0.034, 168),
    layerFore: k(0.665, 0.042, 155),
  },
  // Afternoon — still bright, warmth beginning to return as the sun descends.
  {
    skyTop: k(0.955, 0.018, 238),
    skyMid: k(0.975, 0.016, 90),
    skyHorizon: k(0.985, 0.018, 75),
    glow: k(0.985, 0.045, 85),
    celestial: k(0.94, 0.115, 76),
    aether: k(0.69, 0.12, 188),
    layerFar: k(0.9, 0.016, 222),
    layerMid: k(0.83, 0.026, 198),
    layerNear: k(0.735, 0.034, 172),
    layerFore: k(0.64, 0.04, 158),
  },
  // Dusk — warm, still high-key, planes pulling down. The last stop before the
  // sun crosses the horizon and the dark family takes over.
  {
    skyTop: k(0.92, 0.03, 255),
    skyMid: k(0.95, 0.035, 60),
    skyHorizon: k(0.96, 0.04, 45),
    glow: k(0.95, 0.08, 55),
    celestial: k(0.865, 0.175, 45),
    aether: k(0.7, 0.13, 185),
    layerFar: k(0.86, 0.024, 250),
    layerMid: k(0.785, 0.03, 210),
    layerNear: k(0.69, 0.036, 175),
    layerFore: k(0.62, 0.04, 150),
  },
];

/**
 * The moon's arc. `glow` and `celestial` stay dim across this entire family,
 * which is the reason the night reads as calm rather than as a page with a lamp
 * on it. A moon at lightness 0.53 against a sky at 0.13 is still a four-to-one
 * ratio, which is plenty to read as "bright".
 *
 * That ceiling is now a hard constraint rather than taste. The moon crosses the
 * same band as section headings, and headings are bare `--ink` on the raw
 * backdrop with no surface underneath — so the disc is part of their effective
 * background. At lightness 0.62 that pair measured 3.24:1 and failed AA.
 * `contrast-audit.test.ts` pins it.
 *
 * Note the asymmetry with the light family, which is not an oversight: at night
 * the disc separates from the sky by **lightness**, but in daylight it cannot —
 * the sky is already at 0.95 and there is nowhere brighter to go. So the sun
 * separates by **chroma** instead, which is why its stops carry three to five
 * times the daytime sky's saturation. A near-white disc on a near-white sky was
 * the first version, and it was invisible.
 */
const DARK_STOPS: Stops = [
  // Nightfall — the sun is just below the horizon and the last warmth is still
  // draining out of the western sky. Civil twilight: fireflies, no stars yet.
  {
    skyTop: k(0.17, 0.03, 270),
    skyMid: k(0.19, 0.035, 290),
    skyHorizon: k(0.22, 0.045, 30),
    glow: k(0.42, 0.08, 40),
    celestial: k(0.50, 0.02, 250),
    aether: k(0.72, 0.14, 192),
    layerFar: k(0.14, 0.026, 268),
    layerMid: k(0.12, 0.024, 258),
    layerNear: k(0.1, 0.02, 245),
    layerFore: k(0.08, 0.018, 235),
  },
  // Early night — the warmth is gone, the sky is fully blue-black, the moon is
  // climbing.
  {
    skyTop: k(0.145, 0.024, 268),
    skyMid: k(0.165, 0.026, 265),
    skyHorizon: k(0.195, 0.032, 258),
    glow: k(0.4, 0.04, 248),
    celestial: k(0.52, 0.018, 252),
    aether: k(0.73, 0.145, 200),
    layerFar: k(0.12, 0.02, 266),
    layerMid: k(0.105, 0.018, 260),
    layerNear: k(0.09, 0.016, 252),
    layerFore: k(0.07, 0.014, 244),
  },
  // Midnight — the deepest the site goes, and the moon at its highest.
  {
    skyTop: k(0.12, 0.018, 265),
    skyMid: k(0.14, 0.02, 262),
    skyHorizon: k(0.17, 0.028, 255),
    glow: k(0.38, 0.03, 245),
    celestial: k(0.53, 0.014, 255),
    aether: k(0.74, 0.15, 205),
    layerFar: k(0.1, 0.016, 264),
    layerMid: k(0.09, 0.014, 260),
    layerNear: k(0.075, 0.012, 254),
    layerFore: k(0.06, 0.01, 250),
  },
  // Late night — indistinguishable from midnight to the eye, and that is
  // correct: nothing happens in the sky between 1am and 4am.
  {
    skyTop: k(0.13, 0.02, 262),
    skyMid: k(0.15, 0.022, 258),
    skyHorizon: k(0.18, 0.028, 250),
    glow: k(0.39, 0.032, 242),
    celestial: k(0.52, 0.016, 252),
    aether: k(0.73, 0.145, 202),
    layerFar: k(0.105, 0.018, 262),
    layerMid: k(0.095, 0.016, 256),
    layerNear: k(0.08, 0.014, 250),
    layerFore: k(0.065, 0.012, 246),
  },
  // First light — cold blue, one hint of warmth at the horizon, the moon
  // setting. The stop that hands over to the light family's dawn.
  {
    skyTop: k(0.19, 0.03, 275),
    skyMid: k(0.21, 0.035, 300),
    skyHorizon: k(0.25, 0.045, 35),
    glow: k(0.45, 0.08, 45),
    celestial: k(0.49, 0.022, 248),
    aether: k(0.7, 0.13, 190),
    layerFar: k(0.15, 0.026, 272),
    layerMid: k(0.13, 0.024, 265),
    layerNear: k(0.11, 0.02, 255),
    layerFore: k(0.09, 0.018, 248),
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
 * What each weather does to the world.
 *
 * Five scalars, not a set of scenes, so weather crossfades continuously and can
 * never introduce a shape the clear world lacked. They feed three consumers at
 * once — the visuals, the ecosystem (`ecosystem.ts` shelters animals from rain)
 * and the soundscape — which is what makes weather a property of the world
 * rather than a filter over it.
 *
 * - `veil`   — haze strength. Aerial perspective, so it is what reads as
 *              distance and as reduced visibility.
 * - `cloud`  — cloud band opacity, and how much it attenuates the sun.
 * - `gust`   — multiplier on the wind. `breeze` changes *only* this: no
 *              overlay at all, because that is what wind actually is.
 * - `drops`  — rain density. Also the flag every sheltering animal reads.
 * - `flakes` — snow density. Separate from `drops` rather than a shared
 *              "precipitation" number, because the two behave nothing alike:
 *              rain falls fast, roughens water and drives animals to shelter;
 *              snow drifts, settles the water flat and is calm enough that most
 *              things stay out in it. One scalar could not express both.
 * - `chop`   — how broken the water surface is, which distorts the reflection.
 *
 * No entry changes hue. Mist and rain are the same world in different
 * conditions, not a different palette — that is what keeps weather from
 * fighting the time of day.
 */
export interface WeatherEffect {
  veil: number;
  cloud: number;
  gust: number;
  drops: number;
  flakes: number;
  chop: number;
}

export const WEATHER: Record<Weather, WeatherEffect> = {
  clear: { veil: 0.1, cloud: 0.22, gust: 1, drops: 0, flakes: 0, chop: 0.15 },
  breeze: { veil: 0.12, cloud: 0.28, gust: 1.85, drops: 0, flakes: 0, chop: 0.55 },
  misty: { veil: 0.58, cloud: 0.34, gust: 0.6, drops: 0, flakes: 0, chop: 0.05 },
  rain: { veil: 0.4, cloud: 0.76, gust: 1.35, drops: 1, flakes: 0, chop: 0.9 },
  cloudy: { veil: 0.24, cloud: 0.82, gust: 1.15, drops: 0, flakes: 0, chop: 0.35 },
  // Snow is the calmest state in the set, and every number says so. The gust is
  // *below* clear — snow that whips is a blizzard, and this is meant to be a
  // quiet winter afternoon. `chop` is the lowest of all six because snowfall
  // settles water rather than roughening it, so the lake is at its most mirror-
  // like here. The veil sits between clear and mist: enough to cool and mute
  // the distance without the visibility loss of fog.
  snowy: { veil: 0.34, cloud: 0.62, gust: 0.72, drops: 0, flakes: 1, chop: 0.04 },
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
  "celestial",
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

/* Resolving the visitor's controls into a family and a ring position now lives
 * in `sky.ts`, because both fall out of the sun's altitude rather than being
 * chosen independently. This module is colour only. */
