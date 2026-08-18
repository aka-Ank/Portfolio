import { describe, expect, it } from "vitest";
import { BASINS, GEOMETRY, groundY, horizonAt, shorelineOf, stripWidth, waterY } from "./engine";
import { terrainAt } from "./terrain";
import type { Depth } from "./scene";

const DEPTHS: Depth[] = ["far", "mid", "near", "fore"];

describe("the horizon is one curve", () => {
  it("is continuous — no step big enough to read as a cliff", () => {
    let previous = horizonAt(0);
    for (let i = 1; i <= 5000; i += 1) {
      const current = horizonAt(i / 5000);
      expect(Math.abs(current - previous), `jump at u=${i / 5000}`).toBeLessThan(0.01);
      previous = current;
    }
  });

  it("stays in range and degrades junk input", () => {
    for (const u of [-3, 0, 0.5, 1, 9, Number.NaN, Infinity]) {
      const h = horizonAt(u);
      expect(Number.isFinite(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(1);
    }
  });

  /**
   * The whole point of a single horizon: every plane draws the *same* landform
   * at its own depth. If two planes disagreed about where a hill is, the eye
   * would read them as unrelated silhouettes stacked up — which is exactly what
   * the previous version did, with a ridge, a treeline and a ground line coming
   * from three unrelated functions.
   */
  it("puts every plane's hills and valleys in the same places", () => {
    const sample = (depth: Depth) =>
      Array.from({ length: 200 }, (_, i) => groundY(depth, i / 200));

    const reference = sample("far");
    for (const depth of DEPTHS.slice(1)) {
      const other = sample(depth);
      // Compare *shape*, not absolute position: each plane sits lower and
      // flatter, so normalise both to their own range before correlating.
      const norm = (xs: number[]) => {
        const lo = Math.min(...xs);
        const hi = Math.max(...xs);
        return xs.map((x) => (x - lo) / (hi - lo));
      };
      const a = norm(reference);
      const b = norm(other);
      const meanAbsDiff = a.reduce((sum, v, i) => sum + Math.abs(v - b[i]), 0) / a.length;
      expect(meanAbsDiff, `${depth} disagrees with far about the landform`).toBeLessThan(0.02);
    }
  });

  it("lowers and flattens each plane as it comes forward", () => {
    // Aerial perspective: nearer ground sits lower in the frame.
    const mid = Array.from({ length: 50 }, (_, i) => groundY("far", i / 50));
    const fore = Array.from({ length: 50 }, (_, i) => groundY("fore", i / 50));
    for (let i = 0; i < 50; i += 1) expect(fore[i]).toBeGreaterThan(mid[i]);

    const spread = (xs: number[]) => Math.max(...xs) - Math.min(...xs);
    expect(spread(fore), "foreground should show less relief than the far ridge").toBeLessThan(
      spread(mid),
    );
  });
});

describe("water sits in the terrain, not on it", () => {
  it("finds at least one basin", () => {
    expect(BASINS.length).toBeGreaterThan(0);
  });

  it("only ever fills a genuine depression", () => {
    for (const basin of BASINS) {
      // Every point inside the basin is at or below the fill level...
      let below = 0;
      const steps = 200;
      for (let i = 0; i <= steps; i += 1) {
        const u = basin.from + ((basin.to - basin.from) * i) / steps;
        if (horizonAt(u) <= basin.level) below += 1;
      }
      expect(below / steps, "basin is not actually a dip").toBeGreaterThan(0.7);

      // ...and the terrain rises back above it at both ends, which is what
      // makes it a basin rather than a slope with water on it.
      expect(horizonAt(Math.max(basin.from - 0.02, 0))).toBeGreaterThan(basin.level - 0.02);
      expect(horizonAt(Math.min(basin.to + 0.02, 1))).toBeGreaterThan(basin.level - 0.02);
    }
  });

  it("puts water only where the story says there is water", () => {
    for (const basin of BASINS) {
      const mid = (basin.from + basin.to) / 2;
      expect(terrainAt(mid).water).toBeGreaterThan(0.3);
    }
  });
});

/**
 * The defect this whole rewrite was for: the lake used to begin with a perfectly
 * vertical edge, because it was a rectangle clipped to a range. It cannot now,
 * because its outline *is* the terrain curve below the waterline — but that is
 * the kind of claim worth pinning down rather than trusting.
 */
describe("the shoreline has no straight vertical edges", () => {
  const parse = (d: string) =>
    d
      .replace(/[MLZ]/g, " ")
      .trim()
      .split(/\s+/)
      .reduce<{ x: number; y: number }[]>((points, value, i, all) => {
        if (i % 2 === 0) points.push({ x: Number(value), y: Number(all[i + 1]) });
        return points;
      }, []);

  it("never drops more than a few units without moving sideways", () => {
    for (const depth of ["near", "fore"] as const) {
      const width = stripWidth(depth);
      for (const basin of BASINS) {
        const points = parse(shorelineOf(basin, depth, width));
        for (let i = 1; i < points.length; i += 1) {
          const dx = Math.abs(points[i].x - points[i - 1].x);
          const dy = Math.abs(points[i].y - points[i - 1].y);
          // A vertical wall is a large dy with a near-zero dx. Real ground
          // never does that at this sampling density.
          if (dy > 6) {
            expect(
              dx,
              `${depth}: ${dy.toFixed(1)}u drop over ${dx.toFixed(2)}u across — that is a wall`,
            ).toBeGreaterThan(0.5);
          }
        }
      }
    }
  });

  it("meets the surface at both ends rather than being cut off at one", () => {
    for (const basin of BASINS) {
      const surface = waterY("near", basin);
      const points = parse(shorelineOf(basin, "near", stripWidth("near")));
      expect(Math.abs(points[0].y - surface)).toBeLessThan(0.5);
      expect(Math.abs(points[points.length - 1].y - surface)).toBeLessThan(0.5);
    }
  });

  it("has an uneven shore — coves and peninsulas, not a symmetrical bowl", () => {
    for (const basin of BASINS) {
      const surface = waterY("near", basin);
      const points = parse(shorelineOf(basin, "near", stripWidth("near")));
      const depths = points.map((p) => p.y - surface);
      const mean = depths.reduce((a, b) => a + b, 0) / depths.length;
      const variance = depths.reduce((a, d) => a + (d - mean) ** 2, 0) / depths.length;
      // A perfectly regular basin has almost no variance in its bed profile.
      expect(Math.sqrt(variance), "lake bed is suspiciously smooth").toBeGreaterThan(1);
    }
  });
});

describe("geometry is built once", () => {
  it("exposes plain data, not elements or closures", () => {
    for (const depth of DEPTHS) {
      const plane = GEOMETRY[depth];
      expect(typeof plane.ground).toBe("string");
      expect(plane.ground.startsWith("M")).toBe(true);
      expect(typeof plane.width).toBe("number");
      for (const lake of plane.water) {
        expect(typeof lake.path).toBe("string");
        expect(Number.isFinite(lake.surface)).toBe(true);
      }
    }
  });

  it("is the same object on every access — nothing regenerates", () => {
    expect(GEOMETRY.fore).toBe(GEOMETRY.fore);
    expect(GEOMETRY.fore.ground).toBe(GEOMETRY.fore.ground);
  });
});
