import { describe, expect, it } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { AUDIO_SOURCES } from "./audioManager";
import { bedFor, layersFor, wolfHowlAt } from "./soundscape";
import { WEATHER } from "@/systems/theme/palette";
import type { Weather } from "@/state/uiSlice";

const WEATHERS = Object.keys(WEATHER) as Weather[];

/**
 * The failure this file exists to prevent: a mapping that points at a file that
 * is not there. Every previous pass of this project shipped audio paths for
 * files that did not exist, and nothing failed — the layer was simply silent,
 * which is indistinguishable from working if you are not listening for it.
 */
describe("every audio source resolves to a real file", () => {
  const all = [
    ...Object.entries(AUDIO_SOURCES.BED_SRC).map(([k, v]) => [`bed:${k}`, v] as const),
    ...Object.entries(AUDIO_SOURCES.LAYER_SRC).map(([k, v]) => [`layer:${k}`, v] as const),
    ...Object.entries(AUDIO_SOURCES.ONESHOT_SRC).map(([k, v]) => [`oneshot:${k}`, v] as const),
  ];

  it.each(all)("%s exists in public/", (_name, src) => {
    // The src is URL-encoded for the browser; decode to get the name on disk.
    const onDisk = decodeURIComponent(src).replace(/^\//, "");
    expect(existsSync(path.join(process.cwd(), "public", onDisk)), src).toBe(true);
  });

  it("encodes paths so filenames with spaces survive the round trip", () => {
    // `night .m4a` has a space *before the extension* — the real name on disk,
    // carried over from the original. Unencoded it would 404 in some servers and
    // silently fall back in others.
    for (const [, src] of all) {
      expect(src, `${src} is not URL-safe`).not.toMatch(/ /);
      expect(decodeURIComponent(src)).toMatch(/\.m4a$/);
    }
  });

  /**
   * The encoded set is what ships; `tracks/` is the archive it comes from. If a
   * source is ever added to one and not the other, this is where it shows up —
   * an `.mp3` left in `public/audio` means someone copied a file in by hand
   * instead of running `npm run audio:encode`.
   */
  it("ships only the encoded set, never the originals", () => {
    const shipped = readdirSync(path.join(process.cwd(), "public", "audio"));
    expect(shipped.filter((f) => f.endsWith(".mp3"))).toEqual([]);
  });
});

describe("weather → layers", () => {
  it("never returns a gain outside 0–1, for any weather at any wind", () => {
    for (const weather of WEATHERS) {
      for (const wind of [0, 0.5, 1, 1.9, 2.5, 3.5, 10, Number.NaN]) {
        for (const [layer, gain] of Object.entries(layersFor(weather, WEATHER[weather], wind))) {
          expect(Number.isFinite(gain), `${weather}/${layer} at wind ${wind}`).toBe(true);
          expect(gain).toBeGreaterThanOrEqual(0);
          expect(gain).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  /** The Phase 4 requirement: rain must not silence wind. */
  it("plays rain and wind together, with wind reduced rather than cut", () => {
    const rain = layersFor("rain", WEATHER.rain, 1);
    expect(rain.rain, "no rain layer in rain").toBeGreaterThan(0);
    expect(rain.wind, "wind was silenced by rain").toBeGreaterThan(0);

    // ...and quieter than the same wind on a dry day of comparable gust.
    const dry = layersFor("breeze", { ...WEATHER.breeze, gust: WEATHER.rain.gust }, 1);
    expect(rain.wind!).toBeLessThan(dry.wind!);
  });

  it("escalates to the howl only on genuinely strong wind, and keeps both", () => {
    const calm = layersFor("breeze", WEATHER.breeze, 1.4);
    expect(calm.windHowl, "howl at moderate wind").toBeUndefined();

    const strong = layersFor("breeze", WEATHER.breeze, 2.8);
    expect(strong.windHowl, "no howl at strong wind").toBeGreaterThan(0);
    expect(strong.wind, "howl replaced the soft wind instead of layering").toBeGreaterThan(0);
  });

  it("gives mist and cloud no weather layer of their own", () => {
    // Neither has a recording and neither should: fog is defined by what you
    // stop hearing, so both express themselves by ducking the bed.
    expect(layersFor("misty", WEATHER.misty, 1).rain).toBeUndefined();
    expect(layersFor("misty", WEATHER.misty, 1).snow).toBeUndefined();
    expect(layersFor("cloudy", WEATHER.cloudy, 1).rain).toBeUndefined();
    expect(layersFor("cloudy", WEATHER.cloudy, 1).snow).toBeUndefined();
  });

  it("never rains and snows at once", () => {
    for (const weather of WEATHERS) {
      const l = layersFor(weather, WEATHER[weather], 1);
      expect(!!l.rain && !!l.snow, `${weather} both rains and snows`).toBe(false);
    }
  });

  it("leaves a still, clear day completely silent above the bed", () => {
    expect(Object.keys(layersFor("clear", WEATHER.clear, 0.9))).toHaveLength(0);
  });
});

describe("time → bed", () => {
  it("puts the night bed under night and never under day", () => {
    expect(bedFor("dark", 0.5)).toBe("night");
    expect(bedFor("light", 0.5)).toBe("day");
  });

  it("uses the dawn bed early and the dusk bed late in the light family", () => {
    expect(bedFor("light", 0.05)).toBe("dawn");
    expect(bedFor("light", 0.95)).toBe("sunset");
  });
});

describe("the wolf howl", () => {
  it("never sounds outside deep night", () => {
    for (let t = 0; t < 60000; t += 7) {
      expect(wolfHowlAt(t, -5), `wolf at twilight, t=${t}`).toBe(false);
      expect(wolfHowlAt(t, 30), `wolf in daylight, t=${t}`).toBe(false);
    }
  });

  it("is rarer than anything else in the world", () => {
    let howls = 0;
    const span = 200000;
    for (let t = 0; t < span; t += 1) if (wolfHowlAt(t, -30)) howls += 1;
    // Counting seconds inside a ~2s window, so divide to get events.
    const events = howls / 2;
    const perHour = (events / span) * 3600;
    expect(perHour, `${perHour.toFixed(2)} howls an hour is too many`).toBeLessThan(1.5);
    expect(events, "the wolf never howls at all").toBeGreaterThan(0);
  });

  it("is deterministic — the same second is always the same answer", () => {
    for (const t of [1234, 98765, 1e6]) {
      expect(wolfHowlAt(t, -30)).toBe(wolfHowlAt(t, -30));
    }
  });
});
