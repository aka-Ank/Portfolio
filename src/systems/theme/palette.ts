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
  haze: Oklch;
  layerFar: Oklch;
  layerMid: Oklch;
  layerNear: Oklch;
  glow: Oklch;
  aether: Oklch;
}

type Stops = [Atmosphere, Atmosphere, Atmosphere, Atmosphere];

/**
 * Two families, four stops each. Colour mode picks the family; time-of-day
 * picks the position *within* it. That is what lets "light mode", "dark
 * mode" and "time of day" all be real controls without fighting each other:
 * light mode walks dawn → golden hour, dark mode walks dusk → deep night,
 * and neither can land the visitor somewhere the other mode owns.
 */
const LIGHT_STOPS: Stops = [
  // Dawn — cool sky over a warm horizon.
  {
    skyTop: k(0.72, 0.06, 265),
    skyMid: k(0.83, 0.05, 40),
    skyHorizon: k(0.91, 0.06, 60),
    haze: k(0.93, 0.025, 55),
    layerFar: k(0.78, 0.03, 250),
    layerMid: k(0.62, 0.05, 190),
    layerNear: k(0.42, 0.05, 165),
    glow: k(0.95, 0.08, 75),
    aether: k(0.72, 0.1, 195),
  },
  // Morning — clear and soft.
  {
    skyTop: k(0.78, 0.07, 235),
    skyMid: k(0.88, 0.05, 215),
    skyHorizon: k(0.94, 0.03, 195),
    haze: k(0.95, 0.015, 200),
    layerFar: k(0.82, 0.03, 210),
    layerMid: k(0.66, 0.06, 175),
    layerNear: k(0.45, 0.07, 158),
    glow: k(0.97, 0.05, 95),
    aether: k(0.68, 0.12, 195),
  },
  // Midday — high key, the brightest the site ever goes.
  {
    skyTop: k(0.8, 0.08, 230),
    skyMid: k(0.9, 0.05, 210),
    skyHorizon: k(0.96, 0.02, 150),
    haze: k(0.96, 0.012, 160),
    layerFar: k(0.84, 0.035, 200),
    layerMid: k(0.68, 0.07, 165),
    layerNear: k(0.47, 0.08, 150),
    glow: k(0.98, 0.04, 100),
    aether: k(0.66, 0.13, 190),
  },
  // Golden hour — warm, low sun, long shadows.
  {
    skyTop: k(0.7, 0.08, 255),
    skyMid: k(0.84, 0.09, 65),
    skyHorizon: k(0.9, 0.11, 55),
    haze: k(0.92, 0.05, 55),
    layerFar: k(0.76, 0.05, 250),
    layerMid: k(0.58, 0.07, 145),
    layerNear: k(0.38, 0.06, 130),
    glow: k(0.93, 0.13, 60),
    aether: k(0.7, 0.14, 185),
  },
];

const DARK_STOPS: Stops = [
  // Dusk — the last warmth still on the horizon.
  {
    skyTop: k(0.28, 0.06, 275),
    skyMid: k(0.38, 0.08, 300),
    skyHorizon: k(0.48, 0.11, 35),
    haze: k(0.36, 0.05, 290),
    layerFar: k(0.26, 0.04, 270),
    layerMid: k(0.2, 0.04, 230),
    layerNear: k(0.14, 0.03, 210),
    glow: k(0.66, 0.15, 45),
    aether: k(0.7, 0.14, 190),
  },
  // Early night.
  {
    skyTop: k(0.2, 0.05, 270),
    skyMid: k(0.26, 0.06, 268),
    skyHorizon: k(0.33, 0.06, 255),
    haze: k(0.28, 0.04, 265),
    layerFar: k(0.2, 0.035, 265),
    layerMid: k(0.155, 0.03, 245),
    layerNear: k(0.11, 0.025, 230),
    glow: k(0.72, 0.05, 250),
    aether: k(0.74, 0.15, 200),
  },
  // Night — moonlight, the Observatory's own light.
  {
    skyTop: k(0.15, 0.035, 268),
    skyMid: k(0.19, 0.04, 265),
    skyHorizon: k(0.24, 0.045, 258),
    haze: k(0.22, 0.03, 262),
    layerFar: k(0.165, 0.03, 265),
    layerMid: k(0.13, 0.025, 250),
    layerNear: k(0.095, 0.02, 235),
    glow: k(0.78, 0.04, 245),
    aether: k(0.76, 0.16, 205),
  },
  // Deep night — the only warm light left is the fire itself. The Aether
  // stays teal here on purpose: it is the one motif that never changes hue,
  // which is what makes it read as a recurring symbol rather than lighting.
  {
    skyTop: k(0.13, 0.03, 265),
    skyMid: k(0.16, 0.035, 262),
    skyHorizon: k(0.21, 0.05, 45),
    haze: k(0.2, 0.035, 40),
    layerFar: k(0.15, 0.025, 260),
    layerMid: k(0.12, 0.025, 30),
    layerNear: k(0.09, 0.02, 25),
    glow: k(0.68, 0.14, 50),
    aether: k(0.74, 0.15, 200),
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

/** Weather modifies the haze band's strength and adds an overlay pass. It
 * never changes hue — mist and rain should read as the same world in
 * different conditions, not as a different palette. */
export const WEATHER_HAZE: Record<Weather, number> = {
  clear: 0.28,
  mist: 0.62,
  rain: 0.48,
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
  "haze",
  "layerFar",
  "layerMid",
  "layerNear",
  "glow",
  "aether",
] as const;

export function lerpAtmosphere(a: Atmosphere, b: Atmosphere, t: number): Atmosphere {
  const out = {} as Atmosphere;
  for (const key of ATMOSPHERE_KEYS) out[key] = lerpOklch(a[key], b[key], t);
  return out;
}

/** Sample a family at `t` (0–1) across its four stops. */
export function atmosphereAt(family: SurfaceFamily, t: number): Atmosphere {
  const stops = family === "light" ? LIGHT_STOPS : DARK_STOPS;
  const clamped = Math.min(Math.max(t, 0), 1);
  const scaled = clamped * (stops.length - 1);
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
 * Resolve the three visitor-facing controls plus the current section into the
 * two things the renderer actually needs: which surface family is active, and
 * where on that family's ring the atmosphere sits.
 */
export function resolveTheme(
  colorMode: ColorMode,
  timeMode: TimeMode,
  sectionTime: number,
  now = new Date(),
): { family: SurfaceFamily; t: number } {
  const clock = clockToTime(now);
  const family: SurfaceFamily = colorMode === "auto" ? clock.family : colorMode;

  if (timeMode === "sync") return { family, t: clock.t };
  if (timeMode === "journey") return { family, t: sectionTime };
  return { family, t: TIME_ANCHOR_VALUE[timeMode] };
}
