import { describe, expect, it } from "vitest";
import { atmosphereAt, resolveTheme } from "./palette";
import type { TimeMode } from "@/state/uiSlice";

/**
 * Regression: a stale persisted preference must never be able to break
 * rendering.
 *
 * `timeMode` is restored from the visitor's localStorage, so its value can
 * have been written by an *older build* with a different set of names — a
 * visitor who once picked "Golden hour" still has `timeMode: "golden"` stored.
 * Looking that up returned `undefined`, which became NaN, which indexed the
 * stop array as `stops[NaN]` and threw inside ThemeDriver. The effect aborted
 * before writing a single surface token, so the entire site rendered unstyled
 * — the worst possible outcome from the least important piece of state.
 */
describe("resolveTheme with stale persisted values", () => {
  const stale = ["golden", "day", "journey", "", "nonsense"] as unknown as TimeMode[];

  for (const timeMode of stale) {
    it(`falls back to the clock for a removed time mode: ${JSON.stringify(timeMode)}`, () => {
      const result = resolveTheme("light", timeMode, new Date("2026-08-16T12:00:00"));
      expect(Number.isFinite(result.t)).toBe(true);
      expect(result.t).toBeGreaterThanOrEqual(0);
      expect(result.t).toBeLessThanOrEqual(1);
    });
  }

  it("produces a usable palette for every value it can return", () => {
    for (const timeMode of stale) {
      const { family, t } = resolveTheme("dark", timeMode);
      const atmosphere = atmosphereAt(family, t);
      for (const [key, colour] of Object.entries(atmosphere)) {
        expect(Number.isFinite(colour.l), `${key}.l`).toBe(true);
        expect(Number.isFinite(colour.c), `${key}.c`).toBe(true);
        expect(Number.isFinite(colour.h), `${key}.h`).toBe(true);
      }
    }
  });

  it("clamps out-of-range ring positions rather than indexing past the stops", () => {
    for (const t of [-5, 0, 0.5, 1, 42, Number.NaN]) {
      const atmosphere = atmosphereAt("light", t);
      // NaN in must not produce NaN out — atmosphereAt clamps first.
      expect(atmosphere.skyTop).toBeDefined();
      expect(atmosphere.layerFore).toBeDefined();
    }
  });
});
