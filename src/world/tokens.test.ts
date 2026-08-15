import { describe, expect, it } from "vitest";
import { resolveAnchorPair } from "./tokens";

describe("resolveAnchorPair", () => {
  it("resolves exactly on an anchor boundary", () => {
    expect(resolveAnchorPair(0)).toEqual({ from: "dawn", to: "day", t: 0 });
    expect(resolveAnchorPair(0.25)).toEqual({ from: "day", to: "sunset", t: 0 });
    expect(resolveAnchorPair(0.5)).toEqual({ from: "sunset", to: "night", t: 0 });
  });

  it("resolves midway between two anchors", () => {
    const result = resolveAnchorPair(0.125);
    expect(result.from).toBe("dawn");
    expect(result.to).toBe("day");
    expect(result.t).toBeCloseTo(0.5);
  });

  it("wraps night back to dawn", () => {
    const result = resolveAnchorPair(0.9);
    expect(result.from).toBe("night");
    expect(result.to).toBe("dawn");
    expect(result.t).toBeCloseTo(0.6);
  });

  it("wraps negative and >1 inputs the same as their 0-1 equivalent", () => {
    const a = resolveAnchorPair(-0.1);
    const b = resolveAnchorPair(0.9);
    expect(a.from).toBe(b.from);
    expect(a.to).toBe(b.to);
    expect(a.t).toBeCloseTo(b.t);

    const c = resolveAnchorPair(1.25);
    const d = resolveAnchorPair(0.25);
    expect(c.from).toBe(d.from);
    expect(c.to).toBe(d.to);
    expect(c.t).toBeCloseTo(d.t);
  });
});
