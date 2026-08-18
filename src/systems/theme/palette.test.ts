import { describe, expect, it } from "vitest";
import { atmosphereAt } from "./palette";

describe("atmosphereAt", () => {
  it("clamps out-of-range ring positions rather than indexing past the stops", () => {
    for (const t of [-5, 0, 0.5, 1, 42, Number.NaN]) {
      const atmosphere = atmosphereAt("light", t);
      // NaN in must not produce NaN out — atmosphereAt clamps first. This is
      // the last line of defence for a stale persisted preference: the effect
      // that calls it writes every surface token, so throwing here once left
      // the whole site rendering unstyled.
      expect(atmosphere.skyTop).toBeDefined();
      expect(atmosphere.layerFore).toBeDefined();
      for (const [key, colour] of Object.entries(atmosphere)) {
        expect(Number.isFinite(colour.l), `${key}.l`).toBe(true);
        expect(Number.isFinite(colour.c), `${key}.c`).toBe(true);
        expect(Number.isFinite(colour.h), `${key}.h`).toBe(true);
      }
    }
  });

  it("moves continuously across every family, with no discontinuity at a stop", () => {
    for (const family of ["light", "dark"] as const) {
      let previous = atmosphereAt(family, 0);
      for (let step = 1; step <= 200; step += 1) {
        const current = atmosphereAt(family, step / 200);
        // A jump larger than this between adjacent 0.5% samples would mean a
        // stop was pasted in from the wrong arc — the kind of mistake that
        // shows up as the sky flickering as the clock ticks.
        expect(Math.abs(current.skyTop.l - previous.skyTop.l)).toBeLessThan(0.02);
        previous = current;
      }
    }
  });
});
