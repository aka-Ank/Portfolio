/**
 * Deterministic pseudo-randomness for scene generation.
 *
 * Every generated shape in the backdrop — treeline teeth, star positions, the
 * scatter of a fern bed — is produced from a fixed seed at module scope. That
 * is not a performance choice, it is a correctness one: a forest whose
 * silhouette reshuffles between the server render and the client's is a
 * hydration mismatch, and one that reshuffles on every reload stops reading as
 * a place. The scene should be the same wood every time it is visited.
 */

/** mulberry32. Small, fast, and good enough for scattering shapes. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Point {
  x: number;
  y: number;
}

/**
 * A smooth closed silhouette through a run of points, dropped to a baseline.
 *
 * Catmull-Rom converted to cubic Bézier, which is the cheapest way to get a
 * curve that actually passes *through* its control points — a plain quadratic
 * chain sags away from them and turns a ridgeline into a row of scallops.
 *
 * `tension` below 1 flattens the curve between points; the landforms use a
 * little under 1 so crests stay rounded rather than peaked.
 */
export function smoothSilhouette(points: Point[], baseline: number, tension = 0.9): string {
  if (points.length < 2) return "";

  const at = (index: number) => points[Math.min(Math.max(index, 0), points.length - 1)];
  let path = `M${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension;
    path += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x} ${p2.y}`;
  }

  const last = points[points.length - 1];
  return `${path} L${last.x} ${baseline} L${points[0].x} ${baseline} Z`;
}
