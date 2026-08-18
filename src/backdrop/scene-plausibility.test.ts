import { describe, expect, it } from "vitest";
import { deriveScene, TWILIGHT } from "./scene";
import { WEATHER } from "@/systems/theme/palette";
import { resolveSky } from "@/systems/theme/sky";
import type { Weather } from "@/state/uiSlice";

/**
 * The sky cannot show something the sky would not do.
 *
 * `deriveScene` is the only thing in the codebase that branches on time of day
 * or weather, which is what makes this test possible: sweep every hour against
 * every weather, and any impossible combination has nowhere left to hide. The
 * point is not that the current code avoids them — it is that a future change
 * which reintroduces one fails here rather than shipping and being noticed by
 * someone else months later.
 *
 * `CLAUDE.md` has described this file as existing for some time. It did not.
 * The rules were real and lived in `deriveScene`; nothing enforced them.
 */

const WEATHERS = Object.keys(WEATHER) as Weather[];

/** Every ten minutes through a full day, in both families. Fine enough to catch
 * a rule that only misbehaves in a narrow band of altitude. */
function sweep() {
  const out: {
    hour: number;
    weather: Weather;
    alt: number;
    scene: ReturnType<typeof deriveScene>;
  }[] = [];
  for (const weather of WEATHERS) {
    for (let minute = 0; minute < 24 * 60; minute += 10) {
      const hour = minute / 60;
      const at = new Date(2026, 5, 21, Math.floor(hour), minute % 60);
      for (const mode of ["light", "dark"] as const) {
        const sky = resolveSky(mode, "sync", at);
        out.push({
          hour,
          weather,
          alt: sky.sunAltitude,
          scene: deriveScene(sky, WEATHER[weather]),
        });
      }
    }
  }
  return out;
}

const ALL = sweep();

describe("nothing in the scene is ever impossible", () => {
  it("never puts stars, meteors or fireflies into falling rain or snow", () => {
    for (const { weather, scene } of ALL) {
      const effect = WEATHER[weather];
      if (effect.drops === 0 && effect.flakes === 0) continue;
      expect(scene.stars, `stars in ${weather}`).toBe(0);
      expect(scene.shootingStars, `a meteor in ${weather}`).toBe(false);
      expect(scene.fireflies, `fireflies in ${weather}`).toBe(0);
    }
  });

  it("never draws a meteor across an overcast sky", () => {
    for (const { weather, scene } of ALL) {
      if (!scene.shootingStars) continue;
      expect(WEATHER[weather].cloud, `a meteor through ${weather}`).toBeLessThan(0.35);
      // And never in a sky too bright to see one in.
      expect(scene.stars).toBeGreaterThan(0.55);
    }
  });

  it("never shows a star in daylight", () => {
    for (const { scene } of ALL) {
      const daylight = scene.sun.opacity > 0.9;
      if (daylight) expect(scene.stars).toBe(0);
    }
  });

  it("never casts a light shaft after dark", () => {
    for (const { scene } of ALL) {
      if (scene.stars > 0.3) expect(scene.shafts, "god rays at night").toBe(0);
    }
  });

  it("never lets a firefly out in daylight", () => {
    for (const { alt, scene } of ALL) {
      // The first few are up while the sun is still just above the horizon,
      // which is both real and what the `dusk` preset needs — so the bar is
      // altitude, read directly. Above golden hour is unambiguously daytime.
      if (alt > TWILIGHT.golden) {
        expect(scene.fireflies, `fireflies at ${alt.toFixed(1)}° of altitude`).toBe(0);
      }
    }
  });

  it("never shows rain particles in clear weather, or dust in rain", () => {
    for (const { weather, scene } of ALL) {
      const effect = WEATHER[weather];
      if (effect.drops > 0) expect(scene.particles).toBe("drop");
      else if (effect.flakes > 0) expect(scene.particles).toBe("flake");
      else expect(["mote", "leaf"]).toContain(scene.particles);
    }
  });
});

describe("every continuous gate really is continuous", () => {
  /**
   * The failure this catches is a rule written as a boolean by accident — a
   * threshold with no ramp. Those do not look like bugs in code review; they
   * look like the sky switching on, which is the single thing the brief rules
   * out most explicitly.
   */
  it("moves stars and fireflies gradually across dusk, never in one step", () => {
    for (const weather of WEATHERS) {
      let previous: { stars: number; fireflies: number } | null = null;
      for (let minute = 0; minute < 24 * 60; minute += 2) {
        const at = new Date(2026, 5, 21, Math.floor(minute / 60), minute % 60);
        // `auto`, so the family follows the clock. Pinning `dark` here asks for
        // the moon's arc at every hour — a night sky at noon, correctly — and
        // then measures a discontinuity that only exists because the harness
        // asked two different questions either side of it.
        const sky = resolveSky("auto", "sync", at);
        const scene = deriveScene(sky, WEATHER[weather]);
        if (previous) {
          expect(
            Math.abs(scene.stars - previous.stars),
            `stars jumped at ${minute / 60}h in ${weather}`,
          ).toBeLessThan(0.1);
          expect(
            Math.abs(scene.fireflies - previous.fireflies),
            `fireflies jumped at ${minute / 60}h in ${weather}`,
          ).toBeLessThan(0.1);
        }
        previous = { stars: scene.stars, fireflies: scene.fireflies };
      }
    }
  });

  it("keeps every scalar inside 0–1 for every hour of every weather", () => {
    for (const { scene, weather, hour } of ALL) {
      for (const key of ["shafts", "stars", "fireflies"] as const) {
        expect(Number.isFinite(scene[key]), `${key} is NaN at ${hour}h/${weather}`).toBe(true);
        expect(scene[key], `${key} out of range at ${hour}h/${weather}`).toBeGreaterThanOrEqual(0);
        expect(scene[key]).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("the sky life matches the brief's time-of-day table", () => {
  // `auto` — the family has to follow the clock for a time-of-day table to mean
  // anything. Pinning a family instead asks for that family's arc at every hour.
  const at = (hour: number, weather: Weather = "clear") => {
    const date = new Date(2026, 5, 21, Math.floor(hour), (hour % 1) * 60);
    return deriveScene(resolveSky("auto", "sync", date), WEATHER[weather]);
  };

  it("gives midday no stars and no fireflies", () => {
    const noon = at(12);
    expect(noon.stars).toBe(0);
    expect(noon.fireflies).toBe(0);
  });

  it("gives deep night a full star field", () => {
    expect(at(1).stars).toBeGreaterThan(0.5);
  });

  it("starts the fireflies at dusk, before the stars are out", () => {
    // Around sunset (18:30) the light is going but the sky is not yet dark.
    const duskish = at(19);
    expect(duskish.fireflies, "no fireflies at dusk").toBeGreaterThan(0.2);
    expect(duskish.stars, "a full star field at dusk").toBeLessThan(duskish.fireflies);
  });

  /**
   * The `dusk` preset anchors at 18.1h, 24 minutes *before* the 18:30 sunset.
   * A firefly ramp keyed to the horizon gives that setting none at all, which is
   * how the first version shipped and what the browser check caught.
   */
  it("puts a few fireflies out at the dusk preset, but not the whole population", () => {
    const preset = deriveScene(resolveSky("light", "dusk"), WEATHER.clear);
    expect(preset.fireflies, "the dusk preset has no fireflies").toBeGreaterThan(0.1);
    expect(preset.fireflies, "the dusk preset is already at full density").toBeLessThan(0.6);
  });

  it("thins the fireflies out by the small hours", () => {
    expect(at(2).fireflies).toBeLessThan(at(19).fireflies);
  });

  it("empties the air of fireflies once the wind gets up", () => {
    expect(at(19, "breeze").fireflies).toBeLessThan(at(19, "clear").fireflies * 0.5);
  });

  it("makes a still misty evening their best night, not their worst", () => {
    expect(at(19, "misty").fireflies).toBeGreaterThan(at(19, "clear").fireflies);
  });

  it("leaves a few stars visible under cloud, but far fewer", () => {
    const cloudy = at(1, "cloudy");
    expect(cloudy.stars).toBeGreaterThan(0);
    expect(cloudy.stars).toBeLessThan(at(1, "clear").stars * 0.4);
  });

  it("keeps twilight boundaries as the real ones", () => {
    expect(TWILIGHT.civil).toBe(-6);
    expect(TWILIGHT.nautical).toBe(-12);
  });
});
