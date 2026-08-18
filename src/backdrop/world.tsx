import type { ReactElement } from "react";
import type { Depth } from "./scene";
import { mulberry32 } from "./rand";
import { terrainAt } from "./terrain";
import { BASINS, GEOMETRY, groundY, mistBanks, stripWidth, DRIFT_PX } from "./engine";
import { Water } from "./Water";
import { CanopyMass, Fern, Frond, GrassTuft, Plate, Rock, Stump, Treeline, Trunk } from "./shapes";

/**
 * The world, rendered.
 *
 * **Nothing is generated here.** Every plane is built once, at module scope,
 * into a constant React element — so a backdrop re-render reuses the *same*
 * element object and React skips the subtree entirely. Measured before this
 * change: the generators re-ran twice a second while the page sat idle, because
 * they were ordinary components and the backdrop re-renders on the world clock.
 * That is 167 paths of elements rebuilt and reconciled 120 times a minute, for
 * a landscape that never changes.
 *
 * Only the water is a component rather than a constant, because it genuinely
 * does change: its reflection answers to wind and to the sky.
 *
 * The landform comes from `engine.ts`, where every plane draws the *same*
 * horizon curve at its own depth. Vegetation is placed on that curve rather
 * than on a flat baseline, which is what stops plants standing in mid-air over
 * a valley — and what stops the layers reading as four unrelated silhouettes.
 */

export { DRIFT_PX, stripWidth };

const SWAY = ["a", "b", "c"] as const;

/**
 * How many things may animate per plane.
 *
 * The strips are long, so the generators place shapes at whatever spacing looks
 * right and animate only the first few; the rest are static. Foliage that never
 * moves reads as depth rather than as stillness, because something in front of
 * it is moving.
 */
const ANIMATE_LIMIT = { canopy: 6, understory: 7 } as const;

/** Sit a shape on the terrain. Every shape primitive is drawn rooted at y=900,
 * so placing one is just lifting it to where the ground actually is. */
function onGround(depth: Depth, u: number): string {
  return `translate(0 ${(groundY(depth, u) - 900).toFixed(1)})`;
}

/* -------------------------------------------------------------------------- */

function buildFar(): ReactElement {
  const { width, ground } = GEOMETRY.far;
  return (
    <Plate width={width}>
      <path fill="var(--layer-far)" d={ground} />
    </Plate>
  );
}

/**
 * The treeline, in segments that follow the terrain.
 *
 * Each segment sits on the ground curve at its own position, so the wood climbs
 * the hills and dips into the valley instead of running level across them —
 * which is the most obvious way stacked layers give themselves away.
 */
function buildMid(): ReactElement {
  const { width, ground } = GEOMETRY.mid;
  const SEGMENTS = 14;
  return (
    <Plate width={width}>
      <path fill="var(--layer-mid)" d={ground} />
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const u = (i + 0.5) / SEGMENTS;
        const { canopy, water } = terrainAt(u);
        if (canopy < 0.15 || water > 0.7) return null;
        return (
          <g key={i} transform={onGround("mid", u)}>
            <g transform={`translate(${Math.round((i * width) / SEGMENTS)} 0)`}>
              <Treeline
                seed={0x2b71 + i * 7919}
                baseY={840 - canopy * 74}
                width={Math.ceil(width / SEGMENTS) + 40}
                amplitude={12 + canopy * 30}
                density={0.5 + canopy}
              />
            </g>
          </g>
        );
      })}
    </Plate>
  );
}

function buildNear(): ReactElement {
  const { width, ground } = GEOMETRY.near;
  const random = mulberry32(0x5eed_11);
  const masses: ReactElement[] = [];
  let x = -80;
  let index = 0;

  while (x < width + 120) {
    const u = Math.min(Math.max(x / width, 0), 1);
    const { canopy, water } = terrainAt(u);
    if (canopy < 0.2 || water > 0.6) {
      x += 240;
      continue;
    }
    // Small enough to read as tree masses rather than as landform. At 420–880
    // wide and 320 tall they merged into one enormous smooth mound that looked
    // like a hill — and the hills are the ground's job, not the canopy's.
    const domeWidth = 190 + random() * 130 + canopy * 90;
    const height = 54 + canopy * 96 + random() * 30;
    masses.push(
      <g key={x} transform={onGround("near", u)}>
        <CanopyMass
          x={Math.round(x)}
          width={Math.round(domeWidth)}
          height={Math.round(height)}
          sway={index < ANIMATE_LIMIT.canopy ? SWAY[index % 3] : undefined}
        />
      </g>,
    );
    x += domeWidth * (0.5 + random() * 0.16);
    index += 1;
  }

  return (
    <Plate width={width}>
      <path fill="var(--layer-near)" d={ground} />
      {masses}
    </Plate>
  );
}

function buildFore(): ReactElement {
  const { width, ground } = GEOMETRY.fore;
  const random = mulberry32(0xa11ce);
  const items: ReactElement[] = [];
  let animated = 0;
  let x = 40;

  while (x < width) {
    const u = Math.min(Math.max(x / width, 0), 1);
    const { canopy, understory, water, engineered } = terrainAt(u);
    const roll = random();
    const animate = animated < ANIMATE_LIMIT.understory;
    const phase = -(random() * 12);
    const place = onGround("fore", u);

    // Nothing grows out of open water.
    if (water > 0.75) {
      x += 90;
      continue;
    }

    if (canopy > 0.75 && roll < 0.1) {
      items.push(
        <g key={x} transform={place}>
          <Trunk
            x={Math.round(x)}
            width={34 + random() * 22}
            height={200 + random() * 88}
            lean={(random() - 0.5) * 12}
          />
        </g>,
      );
    } else if (roll < 0.44 * canopy + 0.1) {
      items.push(
        <g key={x} transform={place}>
          <Fern
            x={Math.round(x)}
            scale={1.15 + random() * 0.75}
            blades={5}
            phase={animate ? phase : undefined}
          />
        </g>,
      );
      if (animate) animated += 1;
    } else if (roll < 0.42 + understory * 0.3) {
      items.push(
        <g key={x} transform={place}>
          <GrassTuft
            x={Math.round(x)}
            height={(28 + random() * 26) * (0.6 + understory)}
            blades={5}
            phase={animate ? phase : undefined}
          />
        </g>,
      );
      if (animate) animated += 1;
    } else if (roll < 0.74) {
      items.push(
        <g key={x} transform={place}>
          <Frond
            x={Math.round(x)}
            scale={0.95 + random() * 0.55}
            flip={random() > 0.5}
            phase={animate ? phase : undefined}
          />
        </g>,
      );
      if (animate) animated += 1;
    } else if (roll < 0.83) {
      items.push(
        <g key={x} transform={place}>
          <Stump x={Math.round(x)} scale={0.7 + random() * 0.5} />
        </g>,
      );
    } else {
      items.push(
        <g key={x} transform={place}>
          <Rock x={Math.round(x)} scale={0.6 + random() * 0.5} />
        </g>,
      );
    }

    // The engineered stretch: a faceted slab and a faint crystalline seam,
    // placed only where the story asks for it and never announced. Read
    // alongside the roots it suggests something built; read alone it is a stone.
    if (engineered > 0.4 && random() < engineered * 0.18) {
      const h = 16 + random() * 22;
      const w = 30 + random() * 40;
      items.push(
        <g key={`s${x}`} transform={place}>
          <path
            fill="var(--layer-fore)"
            d={`M${x} 900 L${x + w * 0.12} ${900 - h} L${x + w * 0.7} ${900 - h * 0.86} L${x + w} 900 Z`}
          />
          <path
            fill="var(--aether)"
            opacity={0.18 * engineered}
            d={`M${x + w * 0.32} 900 L${x + w * 0.44} ${900 - h * 0.62} L${x + w * 0.52} 900 Z`}
          />
        </g>,
      );
    }

    x += 52 + random() * 96;
  }

  return (
    <Plate width={width}>
      <path fill="var(--layer-fore)" d={ground} />
      {items}
    </Plate>
  );
}

/**
 * Ground mist, pooling where fog actually pools.
 *
 * Soft edges come from a radial gradient fill, **not** a blur filter. An SVG
 * `feGaussianBlur` over thirty banks is re-rasterised on the CPU and is exactly
 * the kind of thing that costs the frame budget; a gradient that fades to
 * transparent is free and reads the same at this softness.
 *
 * Three ranks, each drifting on its own coprime loop with its own amplitude, so
 * the bank nearest the viewer slides past the one behind it. That parallax
 * between ranks is what gives fog depth — a single layer sliding as one piece
 * reads as a sheet of tracing paper.
 *
 * Opacity is `--mist`, written by the Backdrop from weather *and* time of day,
 * so this whole layer costs one custom property to turn up or down.
 */
function buildMist(): ReactElement {
  const width = stripWidth("near");
  const banks = mistBanks("near", width);

  return (
    <Plate width={width} style={{ opacity: "var(--mist, 0)" }}>
      <defs>
        <radialGradient id="mist-fade">
          <stop offset="0%" stopColor="var(--sky-horizon)" stopOpacity={0.55} />
          <stop offset="55%" stopColor="var(--sky-horizon)" stopOpacity={0.28} />
          <stop offset="100%" stopColor="var(--sky-horizon)" stopOpacity={0} />
        </radialGradient>
      </defs>
      {[0, 1, 2].map((rank) => (
        <g
          key={rank}
          className="drift-mist"
          style={{
            animationDuration: `${97 + rank * 23}s`,
            animationDelay: `${-31 * (rank + 1)}s`,
            opacity: 0.5 + rank * 0.25,
          }}
        >
          {banks
            .filter((_, i) => i % 3 === rank)
            .map((bank) => (
              <ellipse
                key={bank.u}
                cx={bank.u * width}
                cy={bank.y + rank * 7}
                rx={bank.radius}
                // Wide and flat. Fog lies down; a circular puff is a cloud that
                // has fallen over.
                ry={9 + bank.density * 15}
                fill="url(#mist-fade)"
                opacity={bank.density}
              />
            ))}
        </g>
      ))}
    </Plate>
  );
}

const MIST = buildMist();

/** Ground mist, built once. Opacity comes from `--mist` on the stage. */
export function MistLayer() {
  return MIST;
}

/** What the water mirrors: the treeline and the hills behind it. Built once. */
const REFLECTED = buildMid();

/**
 * Built once, at module load. These are constant element objects, so React
 * compares them by reference on every re-render and skips the whole subtree.
 */
const PLANES: Record<Depth, ReactElement> = {
  far: buildFar(),
  mid: buildMid(),
  near: buildNear(),
  fore: buildFore(),
};

export function WorldPlane({ depth }: { depth: Depth }) {
  return PLANES[depth];
}

/**
 * The lakes.
 *
 * Their own plane, so water sits behind the near shore's planting and in front
 * of the treeline it reflects. Unlike the terrain this genuinely changes — the
 * reflection answers to wind and to the sky — so it stays a component.
 */
export function WaterPlane({ chop, reflectivity }: { chop: number; reflectivity: number }) {
  const { width, water } = GEOMETRY.near;
  if (BASINS.length === 0 || water.length === 0) return null;

  return (
    <Plate width={width}>
      {water.map((lake, i) => (
        <Water
          key={i}
          id={`lake${i}`}
          outline={lake.path}
          surface={lake.surface}
          width={width}
          chop={chop}
          reflectivity={reflectivity}
          reflect={REFLECTED}
        />
      ))}
    </Plate>
  );
}
