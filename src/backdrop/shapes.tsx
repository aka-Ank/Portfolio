import type { Depth } from "./scene";
import { mulberry32, smoothSilhouette, type Point } from "./rand";

/**
 * The shape vocabulary the whole world is drawn from.
 *
 * There is one landscape now, not eight scenes, but the constraint that made
 * eight scenes cohere is the same one that makes a single 2,600-unit strip
 * cohere along its length: every mark in it comes from this file. `world.tsx`
 * generates the strip by placing these primitives, so the far end of the wood
 * is unarguably the same hand as the near end.
 *
 * Every primitive obeys the same three rules as the original plates:
 *
 *  - **One flat fill, no gradients, no outlines.** The fill is always
 *    `var(--layer-*)`, so a shape drawn once serves all five times of day and
 *    both colour modes. Baking any colour in here would mean five exports per
 *    biome per plane.
 *  - **One viewBox per strip with `preserveAspectRatio="none"`.** Shapes stretch
 *    to the viewport; nothing here knows the screen size.
 *  - **Detail lives below y≈594** (`SCENE_HORIZON`), because the upper two
 *    thirds of the frame are where the content sits.
 *
 * Sway classes come from globals.css and are keyed to coprime loop durations,
 * so two of the same primitive placed side by side never move in step.
 */

const BASE = 900;

function fill(plane: Depth) {
  return `var(--layer-${plane})`;
}

/* -------------------------------------------------------------------------- */
/* Landforms                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A distant ridge. `crests` are y-values sampled evenly across the frame — the
 * lower the number the higher the hill.
 *
 * Biomes vary this only a little. A ridge is kilometres away, so walking from
 * one part of a wood to another does not replace it; changing its profile
 * wholesale is what would make two biomes read as two different countries
 * rather than as two clearings.
 */
export function Ridge({
  crests,
  width,
  plane = "far",
}: {
  crests: number[];
  width: number;
  plane?: Depth;
}) {
  const step = width / (crests.length - 1);
  const points: Point[] = crests.map((y, i) => ({ x: Math.round(i * step), y }));
  return <path fill={fill(plane)} d={smoothSilhouette(points, BASE)} />;
}

/**
 * A treeline, drawn as a serrated edge rather than as trees.
 *
 * Both tooth width and height vary, and neither repeats on a period. A constant
 * step for either produces a regular zigzag that reads as a saw blade — the
 * single most obvious tell that a "forest" was generated rather than drawn.
 * Real treelines cluster: a few tall crowns, a dip, then a run of low scrub.
 *
 * The run overshoots the strip's width and is clipped by the viewBox, which
 * avoids a giveaway flat stretch at the right edge.
 */
export function Treeline({
  seed,
  baseY,
  width,
  amplitude = 34,
  density = 1,
  plane = "mid",
}: {
  seed: number;
  baseY: number;
  width: number;
  amplitude?: number;
  density?: number;
  plane?: Depth;
}) {
  const overshoot = width + 40;
  const random = mulberry32(seed);
  let d = `M0 ${baseY}`;
  let x = 0;
  // Clustering: a slow drift applied on top of the per-tooth noise, so the
  // canopy has tall stands and low gaps instead of uniform scatter.
  let cluster = 0;
  while (x < overshoot) {
    cluster += (random() - 0.5) * 0.5;
    cluster = Math.max(-1, Math.min(1, cluster));
    const toothWidth = (12 + random() * 26) / density;
    const rise = (random() * amplitude + cluster * amplitude * 0.6) | 0;
    d += ` l${toothWidth.toFixed(1)}${rise >= 0 ? "-" : "+"}${Math.abs(rise)}`;
    x += toothWidth;
    const fallWidth = (10 + random() * 22) / density;
    d += ` l${fallWidth.toFixed(1)} ${(random() * amplitude * 0.9) | 0}`;
    x += fallWidth;
  }
  return <path fill={fill(plane)} d={`${d} L${overshoot} ${BASE} L0 ${BASE} Z`} />;
}

/**
 * One canopy mass, rooted at the bottom of the frame and swaying about its own
 * base — because a tree bends from where it is planted, not from its middle.
 *
 * Masses are placed individually rather than as one path so each can take its
 * own loop. A canopy that moves as a single rigid shape reads as a sheet of
 * cardboard being tilted.
 */
export function CanopyMass({
  x,
  width,
  height,
  sway,
  plane = "near",
}: {
  x: number;
  width: number;
  height: number;
  /** Omit to render the mass static. Most of a long strip is static: only the
   * first few masses are animated, because a dozen swaying domes would eat the
   * whole scene's budget and foliage behind moving foliage reads as depth
   * anyway. */
  sway?: "a" | "b" | "c";
  plane?: Depth;
}) {
  const top = BASE - height;
  const half = width / 2;
  // A dome whose shoulders curve down to the baseline, not a block with
  // vertical sides. The vertical version left a hard edge wherever two masses
  // failed to overlap, which read as a flat slab rather than as a wood — and
  // made the seam between neighbours obvious the moment the placements were
  // even slightly apart.
  const d = `M${x - half} ${BASE}
     C ${x - half} ${BASE - height * 0.42}, ${x - half * 0.93} ${top + height * 0.36}, ${x - half * 0.64} ${top + height * 0.13}
     C ${x - half * 0.33} ${top - height * 0.04}, ${x + half * 0.31} ${top - height * 0.05}, ${x + half * 0.62} ${top + height * 0.11}
     C ${x + half * 0.9} ${top + height * 0.33}, ${x + half} ${BASE - height * 0.44}, ${x + half} ${BASE} Z`;
  const shape = <path fill={fill(plane)} d={d} />;
  if (!sway) return shape;
  return (
    <g className={`sway-canopy-${sway}`} style={{ transformOrigin: `${x}px ${BASE}px` }}>
      {shape}
    </g>
  );
}

/** A tapering trunk. `lean` tilts the top without moving the root. */
export function Trunk({
  x,
  width,
  height,
  lean = 0,
  plane = "fore",
}: {
  x: number;
  width: number;
  height: number;
  lean?: number;
  plane?: Depth;
}) {
  const top = BASE - height;
  const halfBase = width / 2;
  const halfTop = width * 0.28;
  return (
    <path
      fill={fill(plane)}
      d={`M${x - halfBase} ${BASE}
          C ${x - halfBase * 0.8} ${BASE - height * 0.45}, ${x - halfTop + lean * 0.5} ${top + height * 0.3}, ${x - halfTop + lean} ${top}
          L${x + halfTop + lean} ${top}
          C ${x + halfTop + lean * 0.5} ${top + height * 0.3}, ${x + halfBase * 0.8} ${BASE - height * 0.45}, ${x + halfBase} ${BASE} Z`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Undergrowth                                                                 */
/* -------------------------------------------------------------------------- */

/** A single broad frond, the shape the original foreground plate used. */
export function Frond({
  x,
  scale = 1,
  flip = false,
  phase,
  plane = "fore",
}: {
  x: number;
  scale?: number;
  flip?: boolean;
  /** Omit to render static. */
  phase?: number;
  plane?: Depth;
}) {
  const shape = (
    <g transform={`translate(${x} ${BASE}) scale(${flip ? -scale : scale} ${scale})`}>
      <path fill={fill(plane)} d="M0 0 C 20 -62, 56 -100, 108 -118 C 76 -88, 52 -48, 42 0 Z" />
    </g>
  );
  if (phase === undefined) return shape;
  return (
    <g
      className="sway-frond"
      style={{ transformOrigin: `${x}px ${BASE}px`, animationDelay: `${phase}s` }}
    >
      {shape}
    </g>
  );
}

/**
 * A fern: several blades from one root, each shorter than the last.
 *
 * **One animated group for the whole plant, not one per blade.** Per-blade
 * phases look marginally better — the frond appears to open and close in a gust
 * — but a five-blade fern would then cost five animated nodes, and two ferns
 * would eat almost half the scene's entire budget. The blades are static paths
 * inside a single swaying group instead.
 */
export function Fern({
  x,
  scale = 1,
  blades = 5,
  phase,
  plane = "fore",
}: {
  x: number;
  scale?: number;
  blades?: number;
  /** Omit to render static. */
  phase?: number;
  plane?: Depth;
}) {
  const spread = 62;
  const shape = (
    <>
      {Array.from({ length: blades }, (_, i) => {
        const t = blades === 1 ? 0 : i / (blades - 1) - 0.5;
        const length = (86 - Math.abs(t) * 46) * scale;
        return (
          <path
            key={i}
            fill={fill(plane)}
            d={`M${x} ${BASE}
                C ${x + t * spread * 0.5} ${BASE - length * 0.55},
                  ${x + t * spread} ${BASE - length * 0.85},
                  ${x + t * spread * 1.5} ${BASE - length}
                C ${x + t * spread * 0.7} ${BASE - length * 0.7},
                  ${x + t * spread * 0.3} ${BASE - length * 0.35},
                  ${x + 7 * scale} ${BASE} Z`}
          />
        );
      })}
    </>
  );
  if (phase === undefined) return shape;
  return (
    <g
      className="sway-frond"
      style={{ transformOrigin: `${x}px ${BASE}px`, animationDelay: `${phase}s` }}
    >
      {shape}
    </g>
  );
}

/**
 * A tuft of grass. The fastest-moving thing in the scene — grass in a breeze
 * genuinely does outrun the canopy above it, and getting that ordering right is
 * most of what makes wind read as wind rather than as a global wobble.
 */
export function GrassTuft({
  x,
  height = 34,
  blades = 4,
  phase,
  plane = "fore",
}: {
  x: number;
  height?: number;
  blades?: number;
  /** Omit to render static. */
  phase?: number;
  plane?: Depth;
}) {
  const random = mulberry32(Math.round(x * 97 + height));
  const shape = (
    <>
      {Array.from({ length: blades }, (_, i) => {
        const offset = (i - (blades - 1) / 2) * 7;
        const h = height * (0.62 + random() * 0.5);
        const bend = (random() - 0.5) * 26;
        return (
          <path
            key={i}
            fill={fill(plane)}
            d={`M${x + offset} ${BASE}
                Q ${x + offset + bend * 0.5} ${BASE - h * 0.6} ${x + offset + bend} ${BASE - h}
                Q ${x + offset + bend * 0.4} ${BASE - h * 0.55} ${x + offset + 3} ${BASE} Z`}
          />
        );
      })}
    </>
  );
  if (phase === undefined) return shape;
  return (
    <g
      className="sway-grass"
      style={{ transformOrigin: `${x}px ${BASE}px`, animationDelay: `${phase}s` }}
    >
      {shape}
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* Ground furniture                                                            */
/* -------------------------------------------------------------------------- */

export function Stump({ x, scale = 1, plane = "fore" }: { x: number; scale?: number; plane?: Depth }) {
  const w = 34 * scale;
  const h = 30 * scale;
  return (
    <path
      fill={fill(plane)}
      d={`M${x - w} ${BASE} L${x - w * 0.82} ${BASE - h * 0.8}
          Q ${x} ${BASE - h * 1.12} ${x + w * 0.82} ${BASE - h * 0.8}
          L${x + w} ${BASE} Z`}
    />
  );
}

export function Rock({ x, scale = 1, plane = "fore" }: { x: number; scale?: number; plane?: Depth }) {
  const w = 40 * scale;
  const h = 22 * scale;
  return (
    <path
      fill={fill(plane)}
      d={`M${x - w} ${BASE}
          C ${x - w * 0.9} ${BASE - h * 0.7}, ${x - w * 0.35} ${BASE - h * 1.25}, ${x + w * 0.1} ${BASE - h}
          C ${x + w * 0.5} ${BASE - h * 0.82}, ${x + w * 0.85} ${BASE - h * 0.4}, ${x + w} ${BASE} Z`}
    />
  );
}



/** The ground line that closes the bottom of a scene. Every biome needs one, or
 * the undergrowth appears to float. */
export function Ground({
  y = 872,
  width,
  plane = "fore",
  profile = [0, -6, 4, -8, 2],
}: {
  y?: number;
  width: number;
  plane?: Depth;
  profile?: number[];
}) {
  const step = width / (profile.length - 1);
  const points: Point[] = profile.map((dy, i) => ({ x: Math.round(i * step), y: y + dy }));
  return <path fill={fill(plane)} d={smoothSilhouette(points, BASE)} />;
}

/**
 * The wrapper every plate uses, so the SVG props are declared once.
 *
 * `width` is the strip's own length in user units. Each depth plane is a
 * different length — the foreground travels furthest, so it needs the most
 * artwork — and the DOM box it stretches into is sized to match exactly, so
 * `preserveAspectRatio="none"` maps one user unit to one pixel and nothing is
 * distorted.
 */
export function Plate({
  width,
  style,
  children,
}: {
  width: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <svg
      style={style}
      viewBox={`0 0 ${width} 900`}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  );
}
