import type { TimeAnchor } from "@/state/uiSlice";

/**
 * The scene's one configuration file: what the depth planes are, how fast
 * everything loops, and which inhabitants belong to which part of the day.
 *
 * Everything the forest does is a value in here. The components read it and
 * render; they decide nothing themselves.
 */

/** Back to front. The name is also the CSS token suffix — `far` paints with
 * `--layer-far` — so adding a plane means adding a palette entry, not a
 * lookup table. */
export type Depth = "far" | "mid" | "near" | "fore";

export const DEPTHS: Depth[] = ["far", "mid", "near", "fore"];

/**
 * Vertical parallax per plane, as a fraction of `--parallax-range`.
 *
 * Small on purpose, and *not* linear with depth: the eye reads the near/far
 * ratio, not the absolute travel. Exaggerated parallax is the single most
 * common way an otherwise calm background starts feeling like a slideshow.
 */
export const DEPTH_PARALLAX: Record<Depth, number> = {
  far: 0.08,
  mid: 0.22,
  near: 0.46,
  fore: 0.78,
};

/**
 * Loop durations, in seconds.
 *
 * **These are coprime on purpose.** Nine loops running at 7/11/13/17/19/23/
 * 29/31/97/163s only return to their shared starting phase after their lowest
 * common multiple, which for these numbers is longer than any session — so the
 * scene never visibly repeats even though every individual part of it is a
 * short, cheap loop. Pick round numbers instead (10/20/30) and the whole
 * forest re-syncs every half minute, which is exactly what makes a background
 * read as a looping GIF.
 *
 * If you change one, keep it coprime with the others.
 */
export const LOOP = {
  ripple: 7,
  frond: 11,
  animalIdle: 13,
  canopyA: 17,
  shaft: 19,
  canopyB: 23,
  canopyC: 29,
  animalRare: 31,
  mist: 97,
  cloud: 163,
} as const;

/**
 * Negative start offsets, so nothing begins its cycle at page load.
 *
 * With `animation-delay: -Ns` the browser starts the animation N seconds in.
 * Without this every loop begins at phase zero simultaneously and the first
 * few seconds of the page are visibly synchronised — every tree leaning the
 * same way at the same moment. Values are arbitrary but fixed, so the scene
 * is deterministic across reloads and screenshots are stable.
 */
export const PHASE: Record<string, number> = {
  canopyA: -4.3,
  canopyB: -11.7,
  canopyC: -19.1,
  frondA: -2.9,
  frondB: -7.4,
  frondC: -1.2,
  shaftA: -6.5,
  shaftB: -13.8,
  cloudA: -37,
  cloudB: -91,
  cloudC: -128,
  animalA: -3.1,
  animalB: -8.6,
};

/** Which inhabitants belong to which part of the day. Kept to one or two at a
 * time: a forest with five visible animals reads as a zoo, and every extra one
 * is another thing competing with the text. */
export interface Inhabitants {
  deer: boolean;
  owl: boolean;
  birds: boolean;
  /** Fireflies are a particle, not a silhouette — the canvas draws them. */
  fireflies: boolean;
}

export const INHABITANTS: Record<TimeAnchor, Inhabitants> = {
  dawn: { deer: true, owl: false, birds: false, fireflies: false },
  morning: { deer: false, owl: false, birds: true, fireflies: false },
  afternoon: { deer: false, owl: false, birds: true, fireflies: false },
  dusk: { deer: true, owl: false, birds: true, fireflies: true },
  night: { deer: false, owl: true, birds: false, fireflies: true },
};

/** Light shafts only make sense when the sun is low and there is something for
 * it to slant through. Flat overhead light casts no visible shafts. */
export const SHAFT_STRENGTH: Record<TimeAnchor, number> = {
  dawn: 1,
  morning: 0.7,
  afternoon: 0.15,
  dusk: 0.85,
  night: 0,
};

/**
 * Resolve a continuous ring position (0–1) to the nearest named time, for the
 * things that cannot be interpolated — an owl is either present or it is not.
 *
 * Colour crossfades continuously through `atmosphereAt`; only discrete scene
 * *contents* snap, and they crossfade their own opacity so the snap is never
 * visible as a pop.
 */
const ANCHOR_ORDER: TimeAnchor[] = ["dawn", "morning", "afternoon", "dusk", "night"];

export function nearestAnchor(t: number): TimeAnchor {
  const clamped = Math.min(Math.max(t, 0), 1);
  const index = Math.round(clamped * (ANCHOR_ORDER.length - 1));
  return ANCHOR_ORDER[index];
}

/**
 * Where the scene's detail begins, as a fraction of the frame.
 *
 * Everything above this is open sky: no silhouette, no animal, no ground. The
 * plates put their horizon here (y≈600 of the 900-unit viewBox) so the whole
 * upper two-thirds of the viewport stays empty, which is the part the hero
 * card and every section heading actually occupy.
 *
 * This is a *composition* rule and nothing more. It is worth being exact about
 * what it does not do: the page scrolls, so a card genuinely does travel over
 * the foreground plane on its way up the screen. What keeps text legible while
 * that happens is that every panel carries its own `--surface`, and
 * `contrast-audit.test.ts` checks ink against that surface composited over
 * **every** plane colour at eleven points around both families' rings. The
 * horizon keeps the scene from being *busy* behind content; the audit is what
 * keeps it *readable*.
 */
export const SCENE_HORIZON = 0.66;
