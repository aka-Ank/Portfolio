/**
 * The shape of the world, as six continuous functions of position along it.
 *
 * This is the environmental-storytelling layer. Nothing here draws anything —
 * it answers "what is it like at this point in the landscape", and every
 * generator samples it. The journey it describes is:
 *
 *   open valley → forest trail → old forest → engineered wood
 *     → stream → lake → rolling hills → viewpoint
 *
 * **Why functions rather than places.** A list of eight scenes gives eight
 * seams to hide. Six curves give none: "the trees thin, more light reaches the
 * ground, the grass thickens, a stream appears and widens into a lake" is
 * literally `canopy` falling while `openness`, `understory` and `water` rise,
 * sampled per shape. There is no boundary to cross because there are no
 * boundaries — the terrain at u=0.61 is simply what the interpolation says.
 *
 * Sections are *viewpoints* onto this, not owners of it. A section does not get
 * to ask for a lake; it happens to be standing where the water function is high.
 */

export interface TerrainSample {
  /** 0–1. Ridge and hill height. Higher means the horizon lifts. */
  elevation: number;
  /** 0–1. Tree density and canopy closure overhead. */
  canopy: number;
  /** 0–1. How much open sky and direct light. Inverse-ish of canopy, but not
   * exactly: a lake shore is open *and* has trees behind it. */
  openness: number;
  /** 0–1. Ground cover — grass, fern, moss, flowers. */
  understory: number;
  /** 0–1. Damp ground → stream → river → lake. Above ~0.6 there is a real
   * water surface with a reflection. */
  water: number;
  /** 0–1. How far nature has been quietly colonised by structure: roots that
   * run like traces, geometric stone, crystalline seams. Never announced. */
  engineered: number;
}

type Stop = TerrainSample & { u: number };

/**
 * The journey, as keyframes. Everything between them is interpolated.
 *
 * The stops are placed to sit under the sections they belong to — the lake
 * under Skills, the hills under Education — but nothing enforces that mapping,
 * and it does not need to. If the page gets longer the terrain simply stretches
 * with it, because both are parameterised by the same 0–1 travel.
 */
const STOPS: Stop[] = [
  // Open valley. The widest sky in the world and almost nothing on the ground,
  // because this is where the hero card sits.
  { u: 0.0, elevation: 0.3, canopy: 0.08, openness: 1.0, understory: 0.2, water: 0.0, engineered: 0.0 },
  // Forest trail. Vegetation closes in; the valley becomes a path.
  { u: 0.14, elevation: 0.34, canopy: 0.45, openness: 0.68, understory: 0.55, water: 0.0, engineered: 0.0 },
  // Old forest. The oldest, densest wood — big trunks, deep understory.
  { u: 0.3, elevation: 0.42, canopy: 0.88, openness: 0.28, understory: 0.72, water: 0.04, engineered: 0.0 },
  // Engineered wood. Same forest, quietly colonised. `engineered` peaks here
  // and nowhere else.
  { u: 0.46, elevation: 0.4, canopy: 0.9, openness: 0.24, understory: 0.6, water: 0.1, engineered: 0.62 },
  // The stream. Trees begin to thin and the ground gets wet.
  { u: 0.58, elevation: 0.33, canopy: 0.58, openness: 0.56, understory: 0.66, water: 0.36, engineered: 0.3 },
  // The lake. The most open, most peaceful point in the world.
  { u: 0.7, elevation: 0.24, canopy: 0.22, openness: 0.94, understory: 0.74, water: 0.96, engineered: 0.04 },
  // Rolling hills beyond the far shore.
  { u: 0.85, elevation: 0.58, canopy: 0.18, openness: 0.96, understory: 0.52, water: 0.18, engineered: 0.0 },
  // The viewpoint. Opens out again — the world's last breath, and the calmest.
  { u: 1.0, elevation: 0.46, canopy: 0.1, openness: 1.0, understory: 0.32, water: 0.0, engineered: 0.0 },
];

const KEYS = ["elevation", "canopy", "openness", "understory", "water", "engineered"] as const;

/** Smoothstep, so the curve leaves and arrives at each stop with zero slope.
 * Linear interpolation puts a visible crease at every keyframe — a straight
 * ramp meeting another straight ramp is a corner, and the eye finds corners. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Sample the world at `u` (0 at the start of the journey, 1 at the end).
 *
 * Degrades to the first stop for a non-finite input rather than propagating
 * NaN into every generator downstream — this is called from render paths that
 * have no business throwing.
 */
export function terrainAt(u: number): TerrainSample {
  const safe = Number.isFinite(u) ? Math.min(Math.max(u, 0), 1) : 0;

  let index = 0;
  while (index < STOPS.length - 2 && STOPS[index + 1].u < safe) index += 1;

  const a = STOPS[index];
  const b = STOPS[index + 1];
  const span = b.u - a.u;
  const t = span > 0 ? smoothstep(Math.min(Math.max((safe - a.u) / span, 0), 1)) : 0;

  const out = {} as TerrainSample;
  for (const key of KEYS) out[key] = a[key] + (b[key] - a[key]) * t;
  return out;
}

/**
 * Where the water surface sits in the frame, in viewBox units, at a given
 * water level. Below `WATER_THRESHOLD` there is no surface at all — just damp
 * ground — which is what makes the stream *become* a lake rather than a lake
 * fading in at low opacity.
 */
export const WATER_THRESHOLD = 0.45;

export function waterLine(water: number): number | null {
  if (water < WATER_THRESHOLD) return null;
  const t = (water - WATER_THRESHOLD) / (1 - WATER_THRESHOLD);
  // A wide lake sits higher in the frame than a narrow stream, because more of
  // its far shore is visible.
  return 830 - t * 120;
}
