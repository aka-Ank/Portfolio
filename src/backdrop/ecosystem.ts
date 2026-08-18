import { mulberry32 } from "./rand";
import { terrainAt } from "./terrain";
import type { WeatherEffect } from "@/systems/theme/palette";

/**
 * The world's wildlife, as a pure function of time.
 *
 * **This is the piece that makes a persistent world affordable.** The obvious
 * reading of "the deer keeps walking while you scroll away" is a running
 * simulation with state to keep, update and reconcile. Instead, every event is
 * derived from the world clock: a seeded schedule decides whether something is
 * happening in a given time bucket, and where it has got to is
 * `progress = elapsed / duration`.
 *
 * That means scrolling away and back puts the deer exactly where it "would" be
 * — not because anything simulated it, but because its position was never
 * stored anywhere to lose. Off-screen events cost nothing, nothing resets on
 * scroll, nothing resets on reload, and there is no memory to leak.
 *
 * **Habitats are predicates over the terrain, not a placement table.** Ducks
 * are wherever the water is, squirrels wherever the canopy is. Move the lake
 * and the ducks move with it, because there is no second list to keep in sync.
 */

export type Species =
  | "deer"
  | "fox"
  | "duck"
  | "squirrel"
  | "rabbit"
  | "bird"
  | "owl"
  | "dragonfly"
  | "fish";

export interface Habitat {
  species: Species;
  /** Does this stretch of world suit it? */
  suits: (u: number) => boolean;
  /** Awake now? Sun altitude in degrees. */
  awake: (sunAltitude: number) => boolean;
  /** Mean seconds between appearances. Deliberately long — see RARITY. */
  interval: number;
  /** How long one appearance lasts, in seconds. */
  duration: number;
  /** Does it stay out in the rain? Most things do not. */
  weathersRain?: boolean;
}

/**
 * Rarity is a feature, not a limitation.
 *
 * The brief asks for a world that "feels alive because movement is uncommon",
 * and that is exactly right: a meadow with something crossing it every ten
 * seconds is a screensaver. These intervals mean a visitor reading for two
 * minutes will probably see one or two events, and someone who never scrolls
 * past the lake may see none at all — which is what visiting a real wood is
 * like.
 */
const HABITATS: Habitat[] = [
  {
    species: "deer",
    // Open woodland and clearings, which includes the lake shore rather than
    // being limited to it — the arc has the deer lower its head, and that reads
    // as grazing in a clearing just as well as drinking at the water.
    suits: (u) => terrainAt(u).openness > 0.5 && terrainAt(u).understory > 0.45,
    awake: (alt) => alt < 18,
    interval: 210,
    duration: 46,
  },
  {
    species: "duck",
    suits: (u) => terrainAt(u).water > 0.7,
    awake: (alt) => alt > -6,
    interval: 150,
    duration: 62,
  },
  {
    species: "fish",
    suits: (u) => terrainAt(u).water > 0.7,
    awake: (alt) => alt > -10,
    interval: 95,
    duration: 5,
  },
  {
    species: "dragonfly",
    suits: (u) => terrainAt(u).water > 0.55,
    awake: (alt) => alt > 12,
    interval: 130,
    duration: 22,
  },
  {
    species: "squirrel",
    suits: (u) => terrainAt(u).canopy > 0.65,
    awake: (alt) => alt > 0,
    interval: 175,
    duration: 16,
  },
  {
    // Forest edge, and the rarest thing in the world by a wide margin. A fox
    // seen twice in a visit is a zoo; seen once in ten is a memory.
    species: "fox",
    suits: (u) => terrainAt(u).understory > 0.5 && terrainAt(u).canopy > 0.35,
    awake: (alt) => alt < 8,
    interval: 320,
    duration: 30,
  },
  {
    species: "rabbit",
    suits: (u) => terrainAt(u).understory > 0.55 && terrainAt(u).canopy < 0.7,
    awake: (alt) => alt < 14,
    interval: 240,
    duration: 12,
  },
  {
    species: "bird",
    // High overhead, so anywhere with sky. The one thing that crosses the
    // *upper* frame, which is why it is kept small and far.
    suits: (u) => terrainAt(u).openness > 0.4,
    awake: (alt) => alt > -4,
    interval: 120,
    duration: 34,
  },
  {
    species: "owl",
    suits: (u) => terrainAt(u).canopy > 0.5,
    awake: (alt) => alt < -6,
    interval: 260,
    duration: 70,
  },
];

/**
 * The most that may be out at once, anywhere in the world.
 *
 * A hard cap rather than a hope. Eight habitats rolling independently do
 * occasionally line up, and four or five animals on screen together stops being
 * a wood and starts being a nature documentary — as well as blowing the
 * animation budget. Ties are broken by *start time*, so the cap never evicts
 * something mid-walk in favour of something that just arrived; an event that
 * survives the cut on one tick survives it on the next.
 */
export const MAX_CONCURRENT = 3;

export interface WildlifeEvent {
  species: Species;
  /** Position along the world, 0–1. */
  u: number;
  /** World time this appearance began. Used only to break the concurrency cap
   * deterministically. */
  startedAt: number;
  /** 0→1 through this appearance. Drives the whole behaviour arc. */
  progress: number;
  /** Stable per-appearance, so size, direction and gait vary between visits
   * without varying *within* one. */
  seed: number;
  /** Left-to-right or right-to-left. */
  forward: boolean;
}

/** How rain suppresses everything that shelters from it. */
function shelters(habitat: Habitat, weather: WeatherEffect): boolean {
  return weather.drops > 0 && !habitat.weathersRain;
}

/**
 * Everything currently out in the world.
 *
 * Deterministic in `worldTime`: the same second always yields the same events,
 * on any machine, in any tab, before or after a reload.
 */
export function wildlifeAt(
  worldTime: number,
  sunAltitude: number,
  weather: WeatherEffect,
): WildlifeEvent[] {
  const time = Number.isFinite(worldTime) ? worldTime : 0;
  const events: WildlifeEvent[] = [];

  for (const [index, habitat] of HABITATS.entries()) {
    if (!habitat.awake(sunAltitude) || shelters(habitat, weather)) continue;

    // Which slot of this species' schedule are we in, and how far through it.
    const slot = Math.floor(time / habitat.interval);
    const into = time - slot * habitat.interval;

    // A seeded roll per slot decides *whether* this slot has an appearance at
    // all, and where in the slot it starts. Most slots are empty, which is
    // where the rarity comes from — the interval is the upper bound on
    // frequency, not the frequency.
    const random = mulberry32((slot * 7919 + index * 104729) >>> 0);
    if (random() > 0.55) continue;

    const start = random() * Math.max(habitat.interval - habitat.duration, 1);
    const elapsed = into - start;
    if (elapsed < 0 || elapsed > habitat.duration) continue;

    // Where in its habitat. Rejection-sample a few positions rather than
    // scanning the whole world — the suitable stretches are wide, so this finds
    // one almost immediately, and giving up silently is correct: it just means
    // this species has nowhere to be right now.
    let u = -1;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidate = random();
      if (habitat.suits(candidate)) {
        u = candidate;
        break;
      }
    }
    if (u < 0) continue;

    events.push({
      species: habitat.species,
      u,
      startedAt: slot * habitat.interval + start,
      progress: elapsed / habitat.duration,
      seed: Math.floor(random() * 1e9),
      forward: random() > 0.5,
    });
  }

  return events.sort((a, b) => a.startedAt - b.startedAt).slice(0, MAX_CONCURRENT);
}

/**
 * The behaviour arc, as a position and a pose over `progress`.
 *
 * Every arc starts and ends *outside* the frame, which is what stops anything
 * appearing or vanishing: a deer walks in from beyond the edge, stops, looks,
 * drinks, and walks out. The pauses are the important part — an animal that
 * moves continuously across the screen reads as a sprite on a path, and the
 * thing that makes it read as alive is that it spends most of its visit
 * standing still.
 */
export interface Pose {
  /** Offset from the event's `u`, in viewBox units. */
  x: number;
  /**
   * Offset from the species' ground line, in viewBox units. Negative is up.
   *
   * Only the bird uses it, and it is **geometry rather than animation** — a term
   * in the flight path, not a second animated node. That distinction is the
   * whole reason a rise and a dip were affordable: the animation budget counts
   * one bird event as three nodes already, and a wrapper carrying a vertical
   * loop would have made it four.
   */
  y: number;
  /** 0–1, faded at both ends so nothing pops. */
  opacity: number;
  /** Is it moving right now? Drives whether the walk cycle plays. */
  moving: boolean;
  /** Head-down, for grazing and drinking. */
  lowered: boolean;
}

/**
 * A bird's flight, randomised per appearance.
 *
 * Every crossing used to be the same line: same entry height, same span, same
 * undulation, same gentle climb — so however random the *schedule* was, the
 * flight itself was recognisably one asset replayed. These five numbers come
 * from the event's own seed, so one crossing enters high and sinks slowly across
 * a long shallow arc and the next cuts through low, fast and climbing.
 *
 * The envelope is bounded deliberately: `y` stays within roughly ±50 units of
 * the bird's ground line, which keeps a flock in open sky above the hero card
 * without any of them needing to know the card exists.
 */
function flightOf(seed: number) {
  const random = mulberry32((seed || 1) >>> 0);
  return {
    /*
     * The four vertical terms sum, so the envelope is
     * `entry + |slope| + amplitude * 1.3` at worst — 6 + 18 + 19.5 ≈ 43.5 below
     * the ground line, 63.5 above it. Against `GROUND_Y.bird = 70` that is 6 to
     * 113 in a 900-unit frame, which clears the hero card's top edge.
     *
     * The first version of these ranges summed to 55 and a seeded test caught a
     * flight at 50.1. Widening any of them means redoing that sum.
     */
    /** Where it comes in, relative to the ground line. Biased upward. */
    entry: -26 + random() * 32,
    /** Net climb or descent across the whole crossing. Either sign. */
    slope: (random() - 0.5) * 36,
    /** How deep the rise and dip runs. */
    amplitude: 8 + random() * 7,
    /** How many rise-and-dip cycles fit into one crossing. */
    cycles: 1.3 + random() * 1.9,
    /** How far it travels, which is also how fast — the duration is fixed. */
    span: 1600 + random() * 800,
  };
}

export function poseAt(species: Species, progress: number, seed = 0): Pose {
  // `Math.max(NaN, 0)` is NaN — a clamp does not clamp NaN — and this feeds an
  // SVG transform, where NaN silently drops the whole element rather than
  // erroring. Guard before clamping.
  const p = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 1) : 0;
  const fade = Math.min(p / 0.06, (1 - p) / 0.06, 1);
  const opacity = Math.max(0, Math.min(fade, 1));

  switch (species) {
    case "fox": {
      // Crosses further than a deer and never stops as long — a fox on the move
      // pauses to listen, not to feed.
      const travel = p < 0.34 ? p / 0.34 : p > 0.62 ? 1 + (p - 0.62) / 0.38 : 1;
      return {
        x: -260 + travel * 260,
        y: 0,
        opacity,
        moving: p < 0.34 || p > 0.62,
        lowered: p > 0.44 && p < 0.52,
      };
    }
    case "deer":
    case "rabbit": {
      // In, pause, (drink), out. The middle 45% is a stand.
      const travel = p < 0.28 ? p / 0.28 : p > 0.72 ? 1 + (p - 0.72) / 0.28 : 1;
      return {
        x: -220 + travel * 220,
        y: 0,
        opacity,
        moving: p < 0.28 || p > 0.72,
        lowered: p > 0.42 && p < 0.62,
      };
    }
    case "duck":
      // Paddles slowly across, never leaves the water.
      return { x: -90 + p * 180, y: 0, opacity, moving: true, lowered: p % 0.4 < 0.08 };
    case "squirrel":
      return { x: -40 + p * 80, y: 0, opacity, moving: p < 0.4 || p > 0.6, lowered: false };
    case "bird": {
      /*
       * Crosses the whole frame and keeps going — on its own line, not a shared
       * one. See `flightOf`: entry height, slope, amplitude, wavelength and span
       * all come from the appearance's seed.
       *
       * Two sines on unrelated rates. The long one is the *rise and dip*, which
       * the seed shapes; the short one is the shallower undulation of a glide
       * between wingbeats, and its 3.1× ratio to the first is deliberately not a
       * whole number, so the path never repeats within a crossing.
       *
       * This is **geometry, not animation** — no node, no loop, no budget. What
       * makes it *smooth* is separate: `Wildlife` samples this at 1Hz and CSS
       * interpolates between the samples. Without that the bird jumps ~56 units
       * once a second, which is exactly what "hopping" looked like.
       */
      const flight = flightOf(seed);
      const rise = Math.sin(p * Math.PI * 2 * flight.cycles) * flight.amplitude;
      const glide = Math.sin(p * Math.PI * 2 * flight.cycles * 3.1) * (flight.amplitude * 0.3);
      return {
        x: -300 + p * flight.span,
        y: flight.entry + flight.slope * p + rise + glide,
        opacity,
        moving: true,
        lowered: false,
      };
    }
    case "owl":
      return { x: 0, y: 0, opacity, moving: false, lowered: false };
    case "dragonfly":
      return { x: -60 + Math.sin(p * Math.PI * 3) * 120, y: 0, opacity, moving: true, lowered: false };
    case "fish":
      // A ring on the surface, and gone.
      return { x: 0, y: 0, opacity: opacity * (1 - p), moving: false, lowered: false };
  }
}

/** Exposed for the plausibility test. */
export const HABITAT_LIST = HABITATS;
