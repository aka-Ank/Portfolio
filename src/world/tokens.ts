// World lighting/color tokens per time-of-day anchor.
//
// Source of truth for the *design intent* is docs/01-design-specification.md
// §3.1, authored in OKLCH. three.js's Color class does not parse oklch()
// strings, so each token below is a hand-picked sRGB hex approximation of
// its OKLCH counterpart, kept next to the OKLCH value for traceability.
// Refine these visually once real scene content exists to judge them against
// (see SESSION.md Phase 1 "deferred" notes).

import type { TimeOfDayAnchor } from "@/types/world";

export interface WorldAnchorTokens {
  /** OKLCH source value, documentation only — not parsed at runtime. */
  oklch: {
    skyTop: string;
    skyHorizon: string;
    fog: string;
    lightKey: string;
    foliageAmbient: string;
    ground: string;
    aether: string;
  };
  skyTop: string;
  skyHorizon: string;
  fog: string;
  lightKey: string;
  foliageAmbient: string;
  ground: string;
  aether: string;
  /** Exponential fog density — see docs/01 §4 "fog is a compositional tool". */
  fogDensity: number;
  lightIntensity: number;
  ambientIntensity: number;
  /** Sun/moon elevation in radians, fed to drei's <Sky> sunPosition. */
  sunElevation: number;
  /** drei <Sky> Preetham-model params — tuned per anchor for mood, since the
   * shader computes its own color from these rather than accepting an
   * arbitrary top/horizon color directly. */
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
  /** 0-1 — how visible the supplemental starfield should be (Preetham sky
   * has no concept of night/stars on its own). */
  starsOpacity: number;
}

export const WORLD_TOKENS: Record<TimeOfDayAnchor, WorldAnchorTokens> = {
  dawn: {
    oklch: {
      skyTop: "oklch(0.55 0.06 280)",
      skyHorizon: "oklch(0.78 0.09 55)",
      fog: "oklch(0.85 0.03 70)",
      lightKey: "oklch(0.88 0.08 70)",
      foliageAmbient: "oklch(0.45 0.07 150)",
      ground: "oklch(0.35 0.03 60)",
      aether: "oklch(0.80 0.09 195)",
    },
    skyTop: "#6b6f95",
    skyHorizon: "#dba97e",
    fog: "#ddd0bf",
    lightKey: "#e8cd9c",
    foliageAmbient: "#4d6b52",
    ground: "#4a3d33",
    aether: "#a8d8d4",
    fogDensity: 0.035,
    lightIntensity: 1.1,
    ambientIntensity: 0.55,
    sunElevation: 0.12,
    turbidity: 8,
    rayleigh: 1.5,
    mieCoefficient: 0.008,
    mieDirectionalG: 0.85,
    starsOpacity: 0.1,
  },
  day: {
    oklch: {
      skyTop: "oklch(0.62 0.10 230)",
      skyHorizon: "oklch(0.82 0.05 200)",
      fog: "oklch(0.90 0.01 200)",
      lightKey: "oklch(0.95 0.05 95)",
      foliageAmbient: "oklch(0.50 0.09 145)",
      ground: "oklch(0.38 0.03 60)",
      aether: "oklch(0.72 0.14 195)",
    },
    skyTop: "#5a89b8",
    skyHorizon: "#bcd7db",
    fog: "#dde3e3",
    lightKey: "#f3ecd9",
    foliageAmbient: "#4f7a54",
    ground: "#4f4136",
    aether: "#4bb8b0",
    fogDensity: 0.02,
    lightIntensity: 1.6,
    ambientIntensity: 0.7,
    sunElevation: 0.55,
    turbidity: 4,
    rayleigh: 1.2,
    mieCoefficient: 0.004,
    mieDirectionalG: 0.7,
    starsOpacity: 0,
  },
  sunset: {
    oklch: {
      skyTop: "oklch(0.45 0.08 290)",
      skyHorizon: "oklch(0.68 0.16 40)",
      fog: "oklch(0.72 0.08 40)",
      lightKey: "oklch(0.75 0.18 45)",
      foliageAmbient: "oklch(0.40 0.08 130)",
      ground: "oklch(0.30 0.04 40)",
      aether: "oklch(0.68 0.17 165)",
    },
    skyTop: "#48416f",
    skyHorizon: "#d97a3f",
    fog: "#c99177",
    lightKey: "#e0813f",
    foliageAmbient: "#435c37",
    ground: "#3c2f24",
    aether: "#2fae87",
    fogDensity: 0.04,
    lightIntensity: 1.2,
    ambientIntensity: 0.5,
    sunElevation: 0.08,
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.012,
    mieDirectionalG: 0.9,
    starsOpacity: 0.15,
  },
  night: {
    oklch: {
      skyTop: "oklch(0.18 0.03 260)",
      skyHorizon: "oklch(0.28 0.05 265)",
      fog: "oklch(0.30 0.03 260)",
      lightKey: "oklch(0.55 0.03 250)",
      foliageAmbient: "oklch(0.22 0.04 200)",
      ground: "oklch(0.15 0.02 260)",
      aether: "oklch(0.75 0.18 205)",
    },
    skyTop: "#14131f",
    skyHorizon: "#262340",
    fog: "#292838",
    lightKey: "#7c85a0",
    foliageAmbient: "#172a26",
    ground: "#131320",
    aether: "#4fd3ef",
    fogDensity: 0.045,
    lightIntensity: 0.35,
    ambientIntensity: 0.3,
    sunElevation: -0.2,
    turbidity: 2,
    rayleigh: 0.5,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.7,
    starsOpacity: 1,
  },
};

export const ANCHOR_SEQUENCE: TimeOfDayAnchor[] = ["dawn", "day", "sunset", "night"];

/**
 * Linearly interpolates every numeric/color token between two anchors.
 * Colors are interpolated in the caller via THREE.Color.lerpColors — this
 * function only resolves which two anchors + local t to interpolate between
 * for a given global timeOfDay scalar (0-1, wrapping).
 */
export function resolveAnchorPair(timeOfDay: number): {
  from: TimeOfDayAnchor;
  to: TimeOfDayAnchor;
  t: number;
} {
  const wrapped = ((timeOfDay % 1) + 1) % 1;
  const segment = 1 / ANCHOR_SEQUENCE.length;
  const index = Math.floor(wrapped / segment);
  const from = ANCHOR_SEQUENCE[index];
  const to = ANCHOR_SEQUENCE[(index + 1) % ANCHOR_SEQUENCE.length];
  const t = (wrapped - index * segment) / segment;
  return { from, to, t };
}
