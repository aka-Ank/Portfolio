import { mulberry32 } from "./rand";
import { terrainAt } from "./terrain";
import { DEPTH_DRIFT, type Depth } from "./scene";

/**
 * The world engine: one landscape, generated once, at module scope.
 *
 * **Nothing in here runs during a React render.** Every path in the world is a
 * string built when this module is first evaluated and never rebuilt. That is
 * not a micro-optimisation — measured before this existed, the terrain
 * generators were re-running *twice a second* while the page sat idle, because
 * they were plain components and the backdrop re-renders on the world clock.
 * 167 paths of React elements, reconciled, every 500ms, for a scene that had
 * not changed.
 *
 * Everything is seeded, so the world is identical on the server, in the
 * browser, and between reloads. There is no `Math.random()` here and there must
 * never be one.
 *
 * ## The single horizon
 *
 * There is exactly one terrain curve, `horizonAt(u)`. Every depth plane draws
 * *the same curve*, shifted down and flattened by its distance — which is what
 * makes the layers read as one landscape seen at different depths rather than
 * as four independently generated silhouettes that happen to be stacked. The
 * previous version generated a ridge, a treeline and a ground line from three
 * unrelated functions, and the eye picks that up immediately.
 *
 * ## Why the lake has no straight edges
 *
 * The shoreline is not drawn. Water fills to a **level**, and the shore is
 * wherever the terrain curve crosses that level. Because the terrain is a
 * smooth spline crossing the level at a shallow angle, the resulting shore is
 * curved, uneven, and different at each end — with coves and small peninsulas
 * wherever the noise puts them. A rectangle clipped to a range, which is what
 * this replaced, can only ever produce a vertical edge.
 */

/* -------------------------------------------------------------------------- */
/* Noise                                                                      */
/* -------------------------------------------------------------------------- */

/** Smooth value noise. One octave, cosine-interpolated between seeded lattice
 * points — enough for landform, and far cheaper than gradient noise. */
function valueNoise(seed: number, frequency: number) {
  const random = mulberry32(seed);
  const lattice = Array.from({ length: Math.ceil(frequency) + 3 }, () => random());
  return (u: number): number => {
    const x = u * frequency;
    const i = Math.floor(x);
    const t = x - i;
    const smooth = t * t * (3 - 2 * t);
    return lattice[i] + (lattice[i + 1] - lattice[i]) * smooth;
  };
}

/** Fractal sum. Each octave doubles the frequency and halves the amplitude, so
 * the curve has ridges, shoulders and small undulations at once — the thing
 * that separates a landscape from a sine wave. */
function fbm(seed: number, octaves: number, baseFrequency: number) {
  const layers = Array.from({ length: octaves }, (_, i) =>
    valueNoise(seed + i * 7919, baseFrequency * 2 ** i),
  );
  return (u: number): number => {
    let total = 0;
    let amplitude = 1;
    let norm = 0;
    for (const layer of layers) {
      total += layer(u) * amplitude;
      norm += amplitude;
      amplitude *= 0.5;
    }
    return total / norm;
  };
}

/* -------------------------------------------------------------------------- */
/* The horizon                                                                */
/* -------------------------------------------------------------------------- */

const RELIEF_NOISE = fbm(0x1a2b3c, 4, 9);

/**
 * The world's one terrain curve. 0 is the lowest ground, 1 the highest.
 *
 * Two components. `terrainAt(u).elevation` is the *story* — the designed
 * journey through valley, forest, lake basin and hills. The noise is the
 * *texture* on top of it, which is what stops the designed curve reading as a
 * designed curve. Story first, so the landscape still says what it is meant to.
 */
export function horizonAt(u: number): number {
  const safe = Number.isFinite(u) ? Math.min(Math.max(u, 0), 1) : 0;
  const story = terrainAt(safe).elevation;
  return Math.min(Math.max(story * 0.78 + (RELIEF_NOISE(safe) - 0.5) * 0.34, 0), 1);
}

/**
 * Where a plane's ground sits, and how much relief it shows.
 *
 * Distance flattens terrain and lifts it up the frame — aerial perspective, and
 * the reason a far ridge reads as far. Every plane uses the *same* horizon
 * curve through this, so they cannot disagree about where a hill is.
 */
const PLANE_VIEW: Record<Depth, { base: number; relief: number }> = {
  far: { base: 612, relief: 150 },
  mid: { base: 700, relief: 118 },
  near: { base: 790, relief: 92 },
  fore: { base: 884, relief: 64 },
};

export function groundY(depth: Depth, u: number): number {
  const view = PLANE_VIEW[depth];
  return view.base - horizonAt(u) * view.relief;
}

/* -------------------------------------------------------------------------- */
/* Water                                                                      */
/* -------------------------------------------------------------------------- */

export interface Basin {
  /** World positions where the terrain crosses the water level. */
  from: number;
  to: number;
  /** Terrain height the water fills to, 0–1. */
  level: number;
}

/**
 * Lakes live in depressions, and the depressions are found rather than placed.
 *
 * Scan the horizon for a run that sits below a threshold, then fill it to just
 * under the height of its lowest rim. That is the difference between water that
 * is *part of* the landscape and water laid on top of it: a lake here cannot
 * exist on a slope, because a slope has no run below the level.
 */
function findBasins(samples = 900): Basin[] {
  const heights = Array.from({ length: samples + 1 }, (_, i) => horizonAt(i / samples));
  const basins: Basin[] = [];

  let start: number | null = null;
  for (let i = 0; i <= samples; i += 1) {
    // Only the designed lake stretch is allowed to hold water; elsewhere a dip
    // is a dell, not a pond. `water` is the story saying "there is water here",
    // and the horizon says "and this is the shape it takes".
    const eligible = terrainAt(i / samples).water > 0.3 && heights[i] < 0.34;
    if (eligible && start === null) start = i;
    if ((!eligible || i === samples) && start !== null) {
      const from = start / samples;
      const to = i / samples;
      if (to - from > 0.03) {
        let lowest = 1;
        for (let j = start; j < i; j += 1) lowest = Math.min(lowest, heights[j]);

        // A basin fills to its **outlet** — the lower of the two rims — because
        // that is the point water would spill over. Picking an arbitrary depth
        // above the lowest point instead left more than half the bed standing
        // proud of the surface, which is not a lake, it is a boggy dip with
        // islands in it. Just under the rim, so the shore is land rather than a
        // knife edge.
        const rim = Math.min(
          heights[Math.max(start - 1, 0)],
          heights[Math.min(i, samples)],
        );
        const level = Math.max(rim - 0.012, lowest + 0.01);
        basins.push({ from, to, level });
      }
      start = null;
    }
  }
  return basins;
}

export const BASINS = findBasins();

/** Screen y of a basin's surface on a given plane. */
export function waterY(depth: Depth, basin: Basin): number {
  const view = PLANE_VIEW[depth];
  return view.base - basin.level * view.relief;
}

/**
 * The wet span at a basin's level: every u where terrain is below the surface.
 *
 * Sampled rather than solved, because the terrain is an fbm sum with no
 * closed-form inverse. 600 samples across the basin puts the shore within a
 * pixel or two at any realistic width, and the result is a *curve* — the shore
 * follows wherever the land happens to dip under the level, which is what
 * produces coves and peninsulas without any of them being authored.
 */
/**
 * How far the water's *near* edge reaches down the frame per unit of depth.
 *
 * A heightmap in side view gives each position one ground height, so drawing
 * the water column between the terrain and the level yields a band as thin as
 * the terrain's relief — on the near plane that measured about 20 pixels, which
 * on screen is a white sliver, not a lake.
 *
 * What is actually being looked at is the water *surface*, seen at a shallow
 * angle, and a surface seen at a shallow angle occupies vertical space in
 * proportion to how far away its far edge is. So the visible band is the
 * terrain's depth below the waterline, exaggerated — zero at the shore, widest
 * over the deepest part. That produces a lens-shaped lake, which is exactly
 * what a lake looks like in this projection.
 */
const SURFACE_FORESHORTENING = 5.2;

export function shorelineOf(basin: Basin, depth: Depth, width: number): string {
  const steps = 400;
  const surface = waterY(depth, basin);
  const far: string[] = [];
  const near: string[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const u = basin.from + ((basin.to - basin.from) * i) / steps;
    const x = (u * width).toFixed(1);
    // Positive where the land lies below the waterline.
    const submerged = Math.max(groundY(depth, u) - surface, 0);
    const reach = Math.min(surface + submerged * SURFACE_FORESHORTENING, 898);
    far.push(`${x} ${surface.toFixed(1)}`);
    near.push(`${x} ${reach.toFixed(1)}`);
  }

  // Out along the waterline, back along the near shore. Both edges meet at the
  // ends, where `submerged` reaches zero — so the lake comes to a point at each
  // shore instead of being cut off. There is no vertical segment anywhere in
  // this path, which is the whole reason it is built this way: the previous
  // version clipped a rectangle to a range and could only ever produce one.
  return `M${far.join(" L")} L${near.reverse().join(" L")} Z`;
}

/**
 * Where mist collects.
 *
 * Fog is heavier than air: it pools in hollows and sits over water, and it
 * thins over high ground. A single band across the whole frame — which is what
 * the haze layer is — reads as a wash over the picture rather than as something
 * *in* the landscape, because it ignores the landscape completely.
 *
 * These banks are sampled from the same horizon curve everything else uses, so
 * they sit in the dips by construction. Two inputs: how low the ground is, and
 * whether there is water under it. Water wins, because a lake at dawn steams
 * whether or not it happens to be the lowest point around.
 */
export interface MistBank {
  /** World position, 0–1. */
  u: number;
  /** Screen y of the bank's centre. */
  y: number;
  /** Half-width in strip units. */
  radius: number;
  /** 0–1, how thick this particular bank is. */
  density: number;
}

export function mistBanks(depth: Depth, width: number, samples = 90): MistBank[] {
  const banks: MistBank[] = [];

  for (let i = 0; i < samples; i += 1) {
    const u = (i + 0.5) / samples;
    const height = horizonAt(u);
    const { water } = terrainAt(u);

    // Low ground collects mist; high ground sheds it. `1 - height` is the
    // hollow, and water adds to it regardless of elevation.
    const lowness = Math.max(0, 0.46 - height) / 0.46;
    const density = Math.min(lowness * 0.75 + water * 0.85, 1);
    if (density < 0.22) continue;

    banks.push({
      u,
      // Sits *on* the ground, rising a little as it thickens — mist over a lake
      // stands taller than mist in a damp hollow.
      y: groundY(depth, u) - 6 - density * 26,
      radius: (width / samples) * (2.2 + density * 3.4),
      density,
    });
  }

  return banks;
}

/* -------------------------------------------------------------------------- */
/* Prebuilt geometry                                                          */
/* -------------------------------------------------------------------------- */

const FRAME = 1440;
export const DRIFT_PX = 1150;

export function stripWidth(depth: Depth): number {
  return Math.round(FRAME + DEPTH_DRIFT[depth] * DRIFT_PX);
}

/** The terrain silhouette for a plane, as one closed path. Built once. */
function buildGround(depth: Depth): string {
  const width = stripWidth(depth);
  const steps = Math.round(width / 6);
  const points: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    points.push(`${((u * width) | 0).toFixed(0)} ${groundY(depth, u).toFixed(1)}`);
  }
  return `M0 900 L${points.join(" L")} L${width} 900 Z`;
}

export interface PlaneGeometry {
  width: number;
  ground: string;
  water: { basin: Basin; path: string; surface: number }[];
}

/**
 * Every plane's geometry, built once when this module loads.
 *
 * This is the object React renders. It contains strings and numbers — no
 * elements, no closures, nothing that changes — so a re-render of the backdrop
 * costs a prop comparison rather than a landscape.
 */
export const GEOMETRY: Record<Depth, PlaneGeometry> = {
  far: buildPlane("far"),
  mid: buildPlane("mid"),
  near: buildPlane("near"),
  fore: buildPlane("fore"),
};

function buildPlane(depth: Depth): PlaneGeometry {
  const width = stripWidth(depth);
  return {
    width,
    ground: buildGround(depth),
    // Only the two nearer planes carry water. A lake visible on the far ridge
    // would be a second lake at a different distance, which is not what a lake
    // looks like from anywhere.
    water:
      depth === "near" || depth === "fore"
        ? BASINS.map((basin) => ({
            basin,
            path: shorelineOf(basin, depth, width),
            surface: waterY(depth, basin),
          }))
        : [],
  };
}
