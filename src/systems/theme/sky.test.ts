import { describe, expect, it } from "vitest";
import { atmosphereAt } from "./palette";
import { crescentShadowOffset, resolveSky, skyAt, lunarPhase, SUNRISE, SUNSET } from "./sky";
import type { TimeMode } from "@/state/uiSlice";
import { TIME_ANCHOR_HOUR } from "@/state/uiSlice";

const REFERENCE = new Date("2026-08-16T12:00:00");

describe("the sun's arc", () => {
  it("crosses the horizon exactly at sunrise and sunset", () => {
    expect(skyAt(SUNRISE, REFERENCE).sunAltitude).toBeCloseTo(0, 6);
    expect(skyAt(SUNSET, REFERENCE).sunAltitude).toBeCloseTo(0, 6);
  });

  it("peaks at solar noon and is below the horizon at midnight", () => {
    const noon = skyAt((SUNRISE + SUNSET) / 2, REFERENCE);
    expect(noon.sunAltitude).toBeGreaterThan(55);
    expect(skyAt(0, REFERENCE).sunAltitude).toBeLessThan(-30);
  });

  it("travels left to right across the day without reversing", () => {
    let previous = -Infinity;
    for (let hour = SUNRISE; hour <= SUNSET; hour += 0.25) {
      const { sunAzimuth } = skyAt(hour, REFERENCE);
      expect(sunAzimuth).toBeGreaterThan(previous);
      previous = sunAzimuth;
    }
  });

  /**
   * The parameterisation has one seam, at midnight, where the solar parameter
   * wraps. It is placed there because the sun is ~59° below the horizon and
   * rendered at zero opacity, but the seam still has to be small: a large jump
   * would show up the moment anything downstream started interpolating it.
   */
  it("has no visible discontinuity at the midnight seam", () => {
    const before = skyAt(23.999, REFERENCE).sunAltitude;
    const after = skyAt(0.001, REFERENCE).sunAltitude;
    expect(Math.abs(before - after)).toBeLessThan(2);
  });

  it("never jumps by more than a degree between adjacent minutes", () => {
    let previous = skyAt(0, REFERENCE).sunAltitude;
    for (let minute = 1; minute < 24 * 60; minute += 1) {
      const current = skyAt(minute / 60, REFERENCE).sunAltitude;
      expect(Math.abs(current - previous)).toBeLessThan(1);
      previous = current;
    }
  });
});

describe("the moon's arc", () => {
  it("is up through the night and down through the day", () => {
    expect(skyAt(0, REFERENCE).moonAltitude).toBeGreaterThan(30);
    expect(skyAt(12, REFERENCE).moonAltitude).toBeLessThanOrEqual(0);
  });

  it("reports a real lunar phase that completes a cycle in a synodic month", () => {
    const start = lunarPhase(new Date("2026-01-01T00:00:00Z"));
    const halfway = lunarPhase(new Date("2026-01-15T18:00:00Z"));
    const full = lunarPhase(new Date("2026-01-30T12:44:00Z"));
    expect(Math.abs(start.illumination - full.illumination)).toBeLessThan(0.05);
    expect(Math.abs(start.illumination - halfway.illumination)).toBeGreaterThan(0.5);
  });

  /**
   * Regression: this mapping shipped inverted once. At full moon the shadow
   * disc sat exactly on the moon and hid it entirely, and at new moon the disc
   * was solid — the two states swapped. It looked correct in the screenshot
   * taken on the day, because that night happened to be near new, and would
   * have looked wrong a fortnight later.
   */
  it("slides the shadow clear at full moon and across the disc at new", () => {
    expect(crescentShadowOffset(1)).toBeCloseTo(1.9, 5);
    expect(crescentShadowOffset(0)).toBeLessThan(1.9);
    expect(crescentShadowOffset(1)).toBeGreaterThan(crescentShadowOffset(0));
  });

  it("never hides the moon completely, so the night always has a light source", () => {
    // Offset 0 would centre the shadow and erase the disc.
    expect(crescentShadowOffset(0)).toBeGreaterThan(0.5);
  });

  it("is monotonic and finite across the whole phase range, including junk", () => {
    let previous = -Infinity;
    for (let step = 0; step <= 100; step += 1) {
      const offset = crescentShadowOffset(step / 100);
      expect(offset).toBeGreaterThan(previous);
      previous = offset;
    }
    for (const junk of [Number.NaN, Infinity, -1, 5]) {
      expect(Number.isFinite(crescentShadowOffset(junk))).toBe(true);
    }
  });

  it("keeps illumination inside 0–1 for any date", () => {
    for (const iso of ["1970-01-01", "1999-06-15", "2000-01-06", "2026-08-16", "2199-12-31"]) {
      const { illumination } = lunarPhase(new Date(iso));
      expect(illumination).toBeGreaterThanOrEqual(0);
      expect(illumination).toBeLessThanOrEqual(1);
    }
  });
});

/**
 * The mapping the whole redesign turns on: light *is* the sun's arc and dark
 * *is* the moon's. There is no longer any combination of controls that produces
 * a half-day/half-night palette, and this is the test that says so.
 */
describe("light is the day arc, dark is the night arc", () => {
  it("puts every daytime anchor in the light family and night in the dark one", () => {
    expect(skyAt(TIME_ANCHOR_HOUR.dawn, REFERENCE).family).toBe("light");
    expect(skyAt(TIME_ANCHOR_HOUR.morning, REFERENCE).family).toBe("light");
    expect(skyAt(TIME_ANCHOR_HOUR.afternoon, REFERENCE).family).toBe("light");
    expect(skyAt(TIME_ANCHOR_HOUR.dusk, REFERENCE).family).toBe("light");
    expect(skyAt(TIME_ANCHOR_HOUR.night, REFERENCE).family).toBe("dark");
  });

  it("keeps dawn and dusk inside golden hour, where the shafts belong", () => {
    expect(skyAt(TIME_ANCHOR_HOUR.dawn, REFERENCE).sunAltitude).toBeGreaterThan(0);
    expect(skyAt(TIME_ANCHOR_HOUR.dawn, REFERENCE).sunAltitude).toBeLessThan(12);
    expect(skyAt(TIME_ANCHOR_HOUR.dusk, REFERENCE).sunAltitude).toBeGreaterThan(0);
    expect(skyAt(TIME_ANCHOR_HOUR.dusk, REFERENCE).sunAltitude).toBeLessThan(12);
  });

  it("never resolves a family the sun altitude contradicts, for any control pair", () => {
    const colorModes = ["light", "dark", "auto"] as const;
    const timeModes: TimeMode[] = ["sync", "dawn", "morning", "afternoon", "dusk", "night"];
    for (const colorMode of colorModes) {
      for (const timeMode of timeModes) {
        const sky = resolveSky(colorMode, timeMode, REFERENCE);
        expect(sky.family).toBe(sky.sunAltitude >= 0 ? "light" : "dark");
        if (colorMode !== "auto") expect(sky.family).toBe(colorMode);
      }
    }
  });
});

/**
 * Regression: a stale persisted preference must never be able to break
 * rendering.
 *
 * `timeMode` is restored from the visitor's localStorage, so its value can have
 * been written by an *older build* with a different set of names — a visitor
 * who once picked "Golden hour" still has `timeMode: "golden"` stored. Looking
 * that up returned `undefined`, which became NaN, which indexed the stop array
 * as `stops[NaN]` and threw inside ThemeDriver. The effect aborted before
 * writing a single surface token, so the entire site rendered unstyled — the
 * worst possible outcome from the least important piece of state.
 */
describe("stale persisted values", () => {
  const stale = ["golden", "day", "journey", "noon", "", "nonsense"] as unknown as TimeMode[];

  for (const timeMode of stale) {
    it(`falls back to the clock for a removed time mode: ${JSON.stringify(timeMode)}`, () => {
      const sky = resolveSky("light", timeMode, REFERENCE);
      expect(Number.isFinite(sky.t)).toBe(true);
      expect(sky.t).toBeGreaterThanOrEqual(0);
      expect(sky.t).toBeLessThanOrEqual(1);
      expect(Number.isFinite(sky.sunAltitude)).toBe(true);
    });
  }

  it("produces a usable palette for every value it can return", () => {
    for (const timeMode of stale) {
      const { family, t } = resolveSky("dark", timeMode, REFERENCE);
      const atmosphere = atmosphereAt(family, t);
      for (const [key, colour] of Object.entries(atmosphere)) {
        expect(Number.isFinite(colour.l), `${key}.l`).toBe(true);
        expect(Number.isFinite(colour.c), `${key}.c`).toBe(true);
        expect(Number.isFinite(colour.h), `${key}.h`).toBe(true);
      }
    }
  });

  it("degrades a non-finite hour to midday rather than propagating NaN", () => {
    for (const hour of [Number.NaN, Infinity, -Infinity]) {
      const sky = skyAt(hour, REFERENCE);
      expect(Number.isFinite(sky.sunAltitude)).toBe(true);
      expect(Number.isFinite(sky.t)).toBe(true);
    }
  });
});
