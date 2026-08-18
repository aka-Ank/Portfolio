import type { SkyState } from "@/systems/theme/sky";
import type { WeatherEffect } from "@/systems/theme/palette";
import { MOON_PEAK, SUN_PEAK } from "@/systems/theme/sky";

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
 * **These are coprime on purpose.** Loops running at 5/7/11/13/17/19/23/29/31/
 * 37/41/43/53/97/163s only return to their shared starting phase after their lowest
 * common multiple, which for these numbers is longer than any session — so the
 * scene never visibly repeats even though every individual part of it is a
 * short, cheap loop. Pick round numbers instead (10/20/30) and the whole
 * forest re-syncs every half minute, which is exactly what makes a background
 * read as a looping GIF.
 *
 * If you change one, keep it coprime with the others.
 */
export const LOOP = {
  /** Grass is the fastest thing on screen and reeds among the slowest; see the
   * ordering note in globals.css. Both are prime, like every other entry. */
  grass: 5,
  ripple: 7,
  frond: 11,
  animalIdle: 13,
  canopyA: 17,
  shaft: 19,
  canopyB: 23,
  canopyC: 29,
  animalRare: 31,
  drip: 43,
  reed: 53,
  mist: 97,
  cloud: 163,

  /**
   * The star field's three groups.
   *
   * Three periods, not one, and that is the whole twinkle: the field is split
   * into thirds and each third breathes on its own prime, so what a visitor sees
   * is stars going soft and bright *out of step with each other* — which is what
   * irregular blinking looks like — while the cost stays three animated nodes
   * rather than one per star. 41, 47 and 59 next line up after 113,693 seconds,
   * which is a day and a half.
   *
   * Individual stars deliberately do **not** twinkle independently. That needs
   * a node each, and thirty-six of them flickering is a screensaver rather than
   * a sky.
   */
  starA: 41,
  starB: 47,
  starC: 59,

  /**
   * Two sparkle groups, on top of the three that breathe.
   *
   * The breathing groups carry the field's *mood* — a slow swell over three
   * quarters of a minute. That is atmosphere, but at that rate nothing ever
   * catches the eye, which is why the sky read as static even once it was
   * animating. These two are the opposite: a handful of the brightest stars,
   * on a sharp keyframe and a short period, so something in the field is
   * actually *sparkling* at any given moment.
   *
   * 11 and 13 duplicate `frond` and `animalIdle`. Deliberate and harmless: the
   * coprime rule exists so the scene never re-synchronises visibly, and a star
   * at the top of the frame re-syncing with a fern at the bottom is not
   * something any eye can see. They are coprime with **each other**, which is
   * the part that matters here.
   */
  sparkleA: 11,
  sparkleB: 13,

  /**
   * Two meteors, on primes.
   *
   * Each is drawn for about 3% of its cycle and hidden for the rest, so the
   * period is not the frequency — it is the *upper bound* on it, and the sky is
   * empty almost all of the time. Two rather than one because a streak that
   * always falls from the same corner on the same diagonal stops reading as an
   * event and starts reading as a loop; with 61 and 79 the two paths interleave
   * without pattern.
   *
   * **These were 89 and 127 and that was too rare to be worth having.** A
   * visitor looking at the page for half a minute would reliably see nothing at
   * all, which is not "occasional", it is absent. Together these average a
   * streak every ~35 seconds on a clear dark night — so a two-minute visit gets
   * a few, most weather and all of the day still get none, and a meteor is
   * still something that happens rather than something that is on.
   */
  meteorSlow: 61,
  meteorSlower: 79,
  meteorSlowest: 101,
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
  starA: -12.4,
  starB: -31.5,
  starC: -8.2,
  sparkleA: -3.7,
  sparkleB: -9.1,
  // Offset by well over half of the shorter period, so the two meteors cannot
  // both be mid-streak at the same moment on the first cycle after load — two
  // at once reads as a shower, which is a different and much louder event.
  meteorA: -12.4,
  meteorB: -71.3,
  meteorC: -37.8,
  dripA: -5.8,
  dripB: -21.3,
};

/**
 * Horizontal drift per plane, as a fraction of `--drift-range`.
 *
 * Nearer planes travel further, which is the correct direction and the whole
 * reason it reads as depth. This is what carries the sense of moving *along*
 * the treeline as the page scrolls — different silhouettes come into frame for
 * different sections, so each one has its own view of the same wood without the
 * palette ever depending on scroll position.
 */
export const DEPTH_DRIFT: Record<Depth, number> = {
  far: 0.15,
  mid: 0.35,
  near: 0.65,
  fore: 1,
};

/**
 * Twilight boundaries, in degrees of sun altitude. Real ones — these are the
 * thresholds actual dusk is defined by, and using them rather than invented
 * numbers is most of what makes the scene's timing feel right.
 */
export const TWILIGHT = {
  /** Below this the light is warm and low, and shafts are long. */
  golden: 12,
  /** Sun below the horizon but the sky still lit. Birds settle around here. */
  civil: -6,
  /** Full dark for practical purposes; stars are out. */
  nautical: -12,
} as const;

function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
}

/** Where a body sits on screen: `x` as a percentage of the viewport width, `y`
 * in vh. At zero altitude `y` is exactly `SCENE_HORIZON`, so the sun sets into
 * the treeline the plates already draw there rather than near it. */
export interface CelestialPlacement {
  x: number;
  y: number;
  opacity: number;
}

export const CELESTIAL_ARC = {
  /** Rise and set points, inset from the frame edges so the disc is never half
   * clipped at the moment it matters most. */
  left: 7,
  right: 93,
  /** Apex height in vh. High enough to sit above the hero card's text, low
   * enough that the arc reads as an arc rather than as a straight line. */
  apexY: 14,
} as const;

function place(altitude: number, azimuth: number, peak: number, opacity: number) {
  const horizonY = SCENE_HORIZON * 100;
  return {
    x: CELESTIAL_ARC.left + (CELESTIAL_ARC.right - CELESTIAL_ARC.left) * azimuth,
    y: horizonY - (horizonY - CELESTIAL_ARC.apexY) * clamp01(altitude / peak),
    opacity,
  };
}

/**
 * Everything the scene contains, and **the only thing in the codebase allowed
 * to branch on time of day or weather.**
 *
 * That restriction is what makes the sky's plausibility testable instead of
 * merely intended. Every impossible combination — fireflies in a downpour,
 * stars through falling snow, a meteor across an overcast sky, god rays at
 * midnight — is prevented *here*, by arithmetic, and `scene-plausibility.test.ts`
 * sweeps the whole day against every weather to prove none of them can be
 * expressed. A component that decided any of this for itself would be a second
 * place for the rules to live, and the second place is always the one that drifts.
 *
 * Every gate is a **continuous 0–1 scalar, not a boolean**, wherever the eye
 * could catch the transition. Stars emerge through dusk and dissolve at dawn;
 * fireflies come up as the light goes and thin out through the small hours. A
 * boolean would snap, and a snap is exactly the thing that reads as an effect
 * switching on rather than as evening arriving.
 *
 * It keys off sun *altitude* rather than a named time of day, so those
 * transitions are smooth by construction.
 *
 * Nothing here reads scroll position, and nothing here is random.
 */
export interface SceneContent {
  sun: CelestialPlacement;
  moon: CelestialPlacement;
  /** 0-1, how much of the moon's disc is lit, and which limb. */
  moonIllumination: number;
  moonWaxing: boolean;
  /** 0-1 multiplier, not a boolean, so the light fades rather than cutting. */
  shafts: number;
  /** 0-1. Continuous in sun altitude, so stars *emerge* through dusk and fade
   * through dawn rather than switching on at a boundary. */
  stars: number;
  /** Only on a clear, genuinely dark sky. */
  shootingStars: boolean;
  /** 0-1. Peaks in the hour after sunset and thins through the night — see
   * the derivation below, which is about insects rather than about lighting. */
  fireflies: number;
  /** The single particle canvas draws one kind at a time. Precipitation wins
   * over the ambient kinds, because you do not notice dust in a snowstorm. */
  particles: "mote" | "leaf" | "drop" | "flake";
}

export function deriveScene(sky: SkyState, weather: WeatherEffect): SceneContent {
  const alt = sky.sunAltitude;

  // The sun's disc fades out as it meets the treeline rather than vanishing at
  // exactly zero altitude.
  const sunOpacity = clamp01((alt + 2) / 6);
  const moonOpacity = sky.family === "light" ? 0 : clamp01(sky.moonAltitude / 8);

  // Shafts need a low sun and something for the light to catch on. They ramp in
  // from the horizon, peak in golden hour, and fade to nothing as the sun climbs
  // overhead — flat noon light casts no visible beam.
  const geometry =
    alt <= 0
      ? 0
      : alt < TWILIGHT.golden
        ? alt / TWILIGHT.golden
        : Math.max(0, 1 - (alt - TWILIGHT.golden) / 45);

  // Stars come out through nautical twilight, not at sunset. The first appear
  // around −8° and the field is full by −18°, which is roughly when they
  // actually do — and it means dusk gets a few faint ones while the sky is
  // still blue, and dawn loses them gradually.
  //
  // Cloud and haze take them away, and precipitation takes them entirely: you
  // cannot see a star through falling snow, and a star field over rain is the
  // kind of impossible combination the scene is built to make unrepresentable.
  const clarity = clamp01(1 - weather.cloud) * clamp01(1 - weather.veil);
  const falling = weather.drops > 0 || weather.flakes > 0;
  const stars = falling ? 0 : clamp01((-alt - 8) / 10) * clarity;

  /*
   * Fireflies, derived from what fireflies actually do rather than from what
   * would look nice.
   *
   * Three independent facts about the insect, multiplied:
   *
   * - **They fly at dusk, and the display tails off through the night.** Peak
   *   activity is the first hour or so after sunset, and the first few are up
   *   while the sun is still just above the horizon — which is why `dusk` ramps
   *   from +9° rather than from sunset. That number is load-bearing, and it is
   *   the presets that fix it: `dusk` anchors at 18.1h against an 18:30 sunset,
   *   which is **exactly +6.0° of altitude**, and `dawn` at 6.6h is exactly
   *   +9.0°. Starting the ramp at the horizon gives the one setting named
   *   "dusk" no fireflies at all; starting it at +9 gives dusk a fifth of the
   *   population and dawn none, which is the brief's table. `deepNight` then
   *   takes half of them
   *   away again below −14°; without that a firefly field at 3am is as busy as
   *   one at nine in the evening, which is wrong in a way people notice without
   *   being able to say why.
   * - **They need still air.** A flying insect a centimetre across does not
   *   hold a hover in wind, so `calm` empties the air by the time `gust`
   *   reaches breeze. This is also what stops them fighting the trees: when the
   *   canopy is moving, they are not there.
   * - **They like it humid.** Mist is their best night, not their worst, which
   *   is the one place this departs from "haze hides things" — a damp still
   *   evening is exactly when a wood lights up.
   *
   * And they are gone entirely in rain or snow. That is a hard zero rather than
   * a small number: an insect that cannot fly in a shower is not merely rarer
   * in one.
   */
  const dusk = clamp01((9 - alt) / 15);
  const deepNight = 1 - 0.5 * clamp01((-alt - 14) / 18);
  const calm = clamp01(1 - (weather.gust - 1) / 1.1);
  const humid = 0.85 + 0.3 * clamp01(weather.veil * 1.6);
  const fireflies = falling ? 0 : clamp01(dusk * deepNight * calm * humid);

  return {
    sun: place(alt, sky.sunAzimuth, SUN_PEAK, sunOpacity),
    moon: place(sky.moonAltitude, sky.moonAzimuth, MOON_PEAK, moonOpacity),
    moonIllumination: sky.moonIllumination,
    moonWaxing: sky.moonWaxing,
    shafts: clamp01(geometry),
    stars,
    // A meteor needs a clear, dark sky. Anything less and it is a streak drawn
    // over a cloud. Keyed off `stars` rather than off altitude directly, so
    // anything that takes the stars away takes the meteors with it for free —
    // there is no second weather rule here to fall out of step with the first.
    shootingStars: stars > 0.55 && weather.cloud < 0.35 && !falling,
    fireflies,
    // Precipitation first — rain and snow are the whole point of the weather
    // being visible, and dust behind a snowfall is detail nobody can see.
    // Otherwise leaves come down when the light is low, which gives dusk and
    // dawn a texture midday does not have.
    particles:
      weather.drops > 0 ? "drop" : weather.flakes > 0 ? "flake" : alt < 14 ? "leaf" : "mote",
  };
}

/**
 * Where the scene's detail begins, as a fraction of the frame.
 *
 * Everything above this is open sky: no silhouette, no ground. The strips put
 * their horizon here (y≈600 of the 900-unit viewBox) so the whole upper two
 * thirds of the viewport stays empty, which is the part the hero card and every
 * section heading actually occupy.
 *
 * This is a *composition* rule and nothing more. It is worth being exact about
 * what it does not do: the page scrolls, so a card genuinely does travel over
 * the foreground plane on its way up. What keeps text legible while that
 * happens is that every panel carries its own `--surface`, and
 * `contrast-audit.test.ts` checks ink against that surface composited over
 * **every** plane colour at eleven points around both families' rings. The
 * horizon keeps the scene from being *busy* behind content; the audit is what
 * keeps it *readable*.
 */
export const SCENE_HORIZON = 0.66;

/**
 * How high *landform* may reach, as a fraction of the frame.
 *
 * Hills, the far shore and the lake's reflection need more of the frame than
 * `SCENE_HORIZON` allows, or the world is a landscape seen through a letterbox.
 * They get to 50%; everything with edges and contrast — undergrowth, trunks,
 * structures, animals — still stops at `SCENE_HORIZON`, because those are what
 * actually compete with text.
 *
 * The one deliberate exception is high birds, which the brief asks for by name
 * and which cross the upper frame. They are three specks of `--layer-mid` a few
 * units across, they appear on the order of once every two minutes, and they
 * are gone in half a minute. Anything else up there needs a better reason.
 */
export const LANDFORM_HORIZON = 0.5;
