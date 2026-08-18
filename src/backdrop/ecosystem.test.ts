import { describe, expect, it } from "vitest";
import { HABITAT_LIST, poseAt, wildlifeAt, type Species } from "./ecosystem";
import { terrainAt, waterLine, WATER_THRESHOLD } from "./terrain";
import { WEATHER } from "@/systems/theme/palette";
import { layersFor } from "@/systems/audio/soundscape";
import { GESTURE } from "./Wildlife";
import type { Weather } from "@/state/uiSlice";

const WEATHERS = Object.keys(WEATHER) as Weather[];
/** A day, sampled every ten minutes, at every weather. */
const HOURS = Array.from({ length: 144 }, (_, i) => (i / 144) * 24);
/** Sun altitude for an hour, matching the sky model closely enough for gating. */
const altAt = (hour: number) => 60 * Math.sin(Math.PI * ((hour - 6) / 12.5));

function sweep(fn: (e: ReturnType<typeof wildlifeAt>[number], alt: number, w: Weather) => void) {
  for (const weather of WEATHERS) {
    for (const hour of HOURS) {
      const alt = altAt(hour);
      // Several minutes of world time per sample, so the schedule actually
      // fires rather than being tested at one instant.
      for (let t = 0; t < 900; t += 45) {
        for (const event of wildlifeAt(hour * 3600 + t, alt, WEATHER[weather])) {
          fn(event, alt, weather);
        }
      }
    }
  }
}

describe("the terrain profile", () => {
  it("is continuous — no step big enough to read as a seam", () => {
    const keys = ["elevation", "canopy", "openness", "understory", "water", "engineered"] as const;
    let previous = terrainAt(0);
    for (let i = 1; i <= 2000; i += 1) {
      const current = terrainAt(i / 2000);
      for (const key of keys) {
        expect(
          Math.abs(current[key] - previous[key]),
          `${key} jumped at u=${(i / 2000).toFixed(3)}`,
        ).toBeLessThan(0.01);
      }
      previous = current;
    }
  });

  it("keeps every channel inside 0–1, and degrades junk input", () => {
    for (const u of [-5, 0, 0.5, 1, 42, Number.NaN, Infinity]) {
      for (const value of Object.values(terrainAt(u))) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  it("tells the intended story: open, wooded, then open again", () => {
    expect(terrainAt(0).canopy).toBeLessThan(0.2); // valley
    expect(terrainAt(0.3).canopy).toBeGreaterThan(0.8); // old forest
    expect(terrainAt(0.46).engineered).toBeGreaterThan(0.5); // engineered wood
    expect(terrainAt(0.7).water).toBeGreaterThan(0.9); // lake
    expect(terrainAt(0.85).elevation).toBeGreaterThan(0.5); // hills
    expect(terrainAt(1).canopy).toBeLessThan(0.2); // viewpoint
  });

  it("only has a water surface where there is actually water", () => {
    for (let i = 0; i <= 500; i += 1) {
      const { water } = terrainAt(i / 500);
      const line = waterLine(water);
      if (water < WATER_THRESHOLD) expect(line).toBeNull();
      else expect(line).toBeGreaterThan(600);
    }
  });
});

/**
 * The ecological gate. These are the combinations the brief rules out by name,
 * and the reason this file exists rather than the rules living in a component:
 * with wildlife *and* weather back, a component that decides for itself is a
 * place where a songbird can end up out in a downpour.
 */
describe("nothing implausible is ever out", () => {
  it("shelters everything from the rain", () => {
    sweep((event, _alt, weather) => {
      if (WEATHER[weather].drops === 0) return;
      expect(event.species, `${event.species} out in ${weather}`).toBe("__nothing__");
    });
  });

  it("keeps diurnal animals out of the dark and nocturnal ones out of the day", () => {
    const diurnal: Species[] = ["duck", "squirrel", "dragonfly", "bird"];
    sweep((event, alt) => {
      if (diurnal.includes(event.species)) {
        expect(alt, `${event.species} at altitude ${alt.toFixed(1)}`).toBeGreaterThan(-11);
      }
      if (event.species === "owl") {
        expect(alt, `owl at altitude ${alt.toFixed(1)}`).toBeLessThan(-6);
      }
    });
  });

  it("only ever places an animal in terrain that suits it", () => {
    sweep((event) => {
      const habitat = HABITAT_LIST.find((h) => h.species === event.species);
      expect(habitat, event.species).toBeDefined();
      expect(habitat!.suits(event.u), `${event.species} at u=${event.u.toFixed(3)}`).toBe(true);
    });
  });

  it("keeps waterbirds and fish on the water and burrowers off it", () => {
    sweep((event) => {
      const { water } = terrainAt(event.u);
      if (event.species === "duck" || event.species === "fish") {
        expect(water, `${event.species} on dry land`).toBeGreaterThan(0.7);
      }
      if (event.species === "squirrel") {
        expect(terrainAt(event.u).canopy, "squirrel with no trees").toBeGreaterThan(0.65);
      }
    });
  });

  it("stays rare — the world is mostly empty", () => {
    let occupied = 0;
    const samples = 600;
    for (let i = 0; i < samples; i += 1) {
      // Mid-afternoon, clear: the busiest the world ever gets.
      if (wildlifeAt(i * 17, 40, WEATHER.clear).length > 0) occupied += 1;
    }
    // Something is out less than half the time, and never many at once.
    expect(occupied / samples).toBeLessThan(0.5);
  });

  it("never puts more than three animals on screen at once", () => {
    let worst = 0;
    for (const weather of WEATHERS) {
      for (let t = 0; t < 20000; t += 11) {
        worst = Math.max(worst, wildlifeAt(t, 30, WEATHER[weather]).length);
      }
    }
    expect(worst, `peak of ${worst} simultaneous animals`).toBeLessThanOrEqual(3);
  });
});

/**
 * Persistence is the whole point of deriving events from a clock rather than
 * simulating them: the same instant must yield the same world on any machine,
 * in any tab, before or after a reload.
 */
describe("the world persists", () => {
  it("is deterministic — the same second is always the same world", () => {
    for (const t of [0, 12345.5, 98765, 1e6]) {
      const a = wildlifeAt(t, 30, WEATHER.clear);
      const b = wildlifeAt(t, 30, WEATHER.clear);
      expect(a).toEqual(b);
    }
  });

  it("carries an event forward while nobody is looking", () => {
    // Find a moment with something out, then confirm it is further along later
    // rather than restarted — which is what a mount-time simulation would do.
    for (let t = 0; t < 4000; t += 3) {
      const now = wildlifeAt(t, 30, WEATHER.clear);
      if (now.length === 0) continue;
      const later = wildlifeAt(t + 4, 30, WEATHER.clear).find(
        (e) => e.species === now[0].species && e.seed === now[0].seed,
      );
      if (!later) continue;
      expect(later.progress).toBeGreaterThan(now[0].progress);
      return;
    }
    throw new Error("no event found to follow");
  });
});

describe("behaviour arcs", () => {
  const SPECIES: Species[] = [
    "deer", "duck", "squirrel", "rabbit", "bird", "owl", "dragonfly", "fish",
  ];

  it("start and end invisible, so nothing pops in or out", () => {
    for (const species of SPECIES) {
      expect(poseAt(species, 0).opacity, `${species} at start`).toBeLessThan(0.02);
      expect(poseAt(species, 1).opacity, `${species} at end`).toBeLessThan(0.02);
    }
  });

  it("are finite everywhere, including out of range", () => {
    for (const species of SPECIES) {
      for (const p of [-1, 0, 0.5, 1, 2, Number.NaN]) {
        const pose = poseAt(species, p);
        expect(Number.isFinite(pose.x), `${species} x at ${p}`).toBe(true);
        expect(Number.isFinite(pose.y), `${species} y at ${p}`).toBe(true);
        expect(Number.isFinite(pose.opacity), `${species} opacity at ${p}`).toBe(true);
      }
    }
  });

  it("keeps every species but the bird on its own ground line", () => {
    for (const species of SPECIES) {
      if (species === "bird") continue;
      for (let p = 0; p <= 1; p += 0.05) {
        expect(poseAt(species, p).y, `${species} left the ground at ${p}`).toBe(0);
      }
    }
  });
});

/**
 * The bird is the one thing that crosses the *upper* frame, where the hero card
 * and every section heading live. Its path is therefore the one path with a
 * readability constraint on it as well as an aesthetic one.
 */
describe("the flight path", () => {
  const SEEDS = [1, 7, 42, 991, 123456, 999999937];
  const flightFor = (seed: number) =>
    Array.from({ length: 200 }, (_, i) => poseAt("bird", i / 199, seed));

  it("rises and dips rather than tracking a straight line", () => {
    for (const seed of SEEDS) {
      const ys = flightFor(seed).map((s) => s.y);
      expect(Math.max(...ys) - Math.min(...ys), `flat flight at seed ${seed}`).toBeGreaterThan(14);
    }
  });

  /**
   * The envelope is what keeps a flock in open sky above the hero card without
   * any of them knowing the card exists. `GROUND_Y.bird` is 70, and `flightOf`'s
   * ranges are chosen so the four vertical terms cannot sum past this.
   *
   * This caught a real one: the first ranges summed to 55 while the comment
   * claimed 50, and seed 7 flew to 50.1.
   */
  it("keeps every seed inside the bounded envelope", () => {
    for (const seed of SEEDS) {
      for (const { y } of flightFor(seed)) {
        // Asymmetric, because `entry` is biased upward and only the *downward*
        // bound is what keeps a bird off the hero card. A symmetric `|y|` bound
        // measures the wrong thing and fails on the harmless direction — which
        // is exactly what the first version of this assertion did.
        expect(y, `seed ${seed} dropped toward the card`).toBeLessThan(44);
        expect(y, `seed ${seed} flew off the top of the frame`).toBeGreaterThan(-64);
      }
    }
  });

  it("reverses direction several times, so it is not one arc", () => {
    for (const seed of SEEDS) {
      const samples = flightFor(seed);
      let turns = 0;
      for (let i = 2; i < samples.length; i += 1) {
        const before = samples[i - 1].y - samples[i - 2].y;
        const after = samples[i].y - samples[i - 1].y;
        if (before !== 0 && after !== 0 && Math.sign(before) !== Math.sign(after)) turns += 1;
      }
      expect(turns, `seed ${seed} only turns once`).toBeGreaterThan(2);
    }
  });

  /** The complaint this answers: every crossing was the same line, differing
   * only in which direction it was mirrored. */
  it("gives every appearance a different path", () => {
    const signatures = SEEDS.map((seed) => {
      const s = flightFor(seed);
      return [s[0].y, s[99].y, s[199].y, s[199].x].map((n) => n.toFixed(1)).join("|");
    });
    expect(new Set(signatures).size, "some seeds share a flight path").toBe(SEEDS.length);
  });

  it("varies climb and descent between appearances, not just entry height", () => {
    const slopes = SEEDS.map((seed) => {
      const s = flightFor(seed);
      return Math.sign(s[199].y - s[0].y);
    });
    expect(new Set(slopes).size, "every bird climbs, or every bird sinks").toBeGreaterThan(1);
  });

  it("still crosses the whole frame and keeps going", () => {
    for (const seed of SEEDS) {
      const samples = flightFor(seed);
      expect(samples[0].x).toBeLessThan(-200);
      expect(samples[samples.length - 1].x).toBeGreaterThan(1200);
    }
  });

  it("give the deer a genuine pause rather than a constant walk", () => {
    // An animal that moves the whole time reads as a sprite on a path.
    const moving = Array.from({ length: 100 }, (_, i) => poseAt("deer", i / 100).moving);
    const still = moving.filter((m) => !m).length;
    expect(still, "deer never stops").toBeGreaterThan(35);
  });
});

/**
 * Snow is the newest weather and the easiest to get wrong: it is visually
 * similar to rain and behaviourally its opposite. These pin the differences the
 * brief actually asks for.
 */
describe("the weather module", () => {
  it("covers every weather state with scalars and a resolvable audio mapping", () => {
    const states: Weather[] = ["clear", "breeze", "misty", "rain", "cloudy", "snowy"];
    for (const state of states) {
      expect(WEATHER[state], `${state} has no scalars`).toBeDefined();
      for (const [key, value] of Object.entries(WEATHER[state])) {
        expect(Number.isFinite(value), `${state}.${key}`).toBe(true);
        expect(value, `${state}.${key}`).toBeGreaterThanOrEqual(0);
      }
      // Every state resolves to a layer set without throwing, and every gain is
      // a usable 0-1 multiplier.
      const layers = layersFor(state, WEATHER[state], 1);
      for (const [layer, gain] of Object.entries(layers)) {
        expect(Number.isFinite(gain), `${state}.${layer}`).toBe(true);
        expect(gain, `${state}.${layer}`).toBeGreaterThanOrEqual(0);
        expect(gain, `${state}.${layer}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("never falls rain and snow at the same time", () => {
    for (const state of Object.keys(WEATHER) as Weather[]) {
      const { drops, flakes } = WEATHER[state];
      expect(drops > 0 && flakes > 0, `${state} is both raining and snowing`).toBe(false);
    }
  });

  it("makes snow calmer than rain in every respect", () => {
    const snow = WEATHER.snowy;
    const rain = WEATHER.rain;
    expect(snow.gust, "snow should be less windy than rain").toBeLessThan(rain.gust);
    expect(snow.chop, "snow should leave the water calmer than rain").toBeLessThan(rain.chop);
    // Calmer than a plain clear day, too — snowfall damps wind, it does not add it.
    expect(snow.gust, "snow should be less windy than clear").toBeLessThan(WEATHER.clear.gust);
  });

  it("mutes the distance in snow without the visibility loss of fog", () => {
    expect(WEATHER.snowy.veil).toBeGreaterThan(WEATHER.clear.veil);
    expect(WEATHER.snowy.veil).toBeLessThan(WEATHER.misty.veil);
  });

  it("only shelters animals from rain, not from snow", () => {
    // Snow is calm enough that the wood carries on; rain empties it.
    let outInSnow = 0;
    for (let t = 0; t < 20000; t += 13) {
      outInSnow += wildlifeAt(t, 20, WEATHER.snowy).length;
      expect(wildlifeAt(t, 20, WEATHER.rain).length, "something was out in the rain").toBe(0);
    }
    expect(outInSnow, "nothing ever appears in snow").toBeGreaterThan(0);
  });

  it("gives every weather a distinct feel rather than two that match", () => {
    const seen = new Set(
      (Object.keys(WEATHER) as Weather[]).map((w) => JSON.stringify(WEATHER[w])),
    );
    expect(seen.size, "two weather states are numerically identical").toBe(6);
  });
});

describe("the fox", () => {
  it("keeps to the forest edge, not the open lake shore", () => {
    const fox = HABITAT_LIST.find((h) => h.species === "fox")!;
    expect(fox).toBeDefined();
    for (let i = 0; i <= 400; i += 1) {
      const u = i / 400;
      if (!fox.suits(u)) continue;
      const { understory, canopy } = terrainAt(u);
      expect(understory, `fox in bare ground at u=${u.toFixed(2)}`).toBeGreaterThan(0.5);
      expect(canopy, `fox in the open at u=${u.toFixed(2)}`).toBeGreaterThan(0.35);
    }
  });

  it("is the rarest thing in the world", () => {
    const fox = HABITAT_LIST.find((h) => h.species === "fox")!;
    for (const other of HABITAT_LIST) {
      if (other.species === "fox") continue;
      expect(fox.interval, `fox is more common than ${other.species}`).toBeGreaterThan(
        other.interval,
      );
    }
  });

  it("is crepuscular — never out in full daylight", () => {
    const fox = HABITAT_LIST.find((h) => h.species === "fox")!;
    expect(fox.awake(45)).toBe(false);
    expect(fox.awake(2)).toBe(true);
  });
});

/**
 * The brief asks for creatures that each "feel distinct" through timing. That
 * is a claim about the *set*, not about any one animal, so it is worth checking
 * as a set: if two species share a pose arc exactly, they read as one animal
 * with two skins.
 */
describe("each species moves differently", () => {
  it("gives every species a pose arc that is finite and its own", () => {
    const all: Species[] = [
      "deer", "fox", "duck", "squirrel", "rabbit", "bird", "owl", "dragonfly", "fish",
    ];
    const signatures = new Map<string, Species[]>();

    for (const species of all) {
      const samples = Array.from({ length: 40 }, (_, i) => {
        const pose = poseAt(species, i / 39);
        expect(Number.isFinite(pose.x), `${species} x`).toBe(true);
        return `${pose.x.toFixed(1)}:${pose.moving ? 1 : 0}:${pose.lowered ? 1 : 0}`;
      }).join("|");
      const seen = signatures.get(samples) ?? [];
      seen.push(species);
      signatures.set(samples, seen);
    }

    for (const [, species] of signatures) {
      // Deer and rabbit deliberately share an arc — both walk in, stop, and
      // leave — so a pair is allowed; three or more identical is a mistake.
      expect(species.length, `identical arcs: ${species.join(", ")}`).toBeLessThanOrEqual(2);
    }
  });

  it("travels furthest for the animals that should cover ground", () => {
    const span = (s: Species) =>
      Math.abs(poseAt(s, 1).x - poseAt(s, 0).x);
    // A bird crosses the whole frame; an owl does not move at all.
    expect(span("bird")).toBeGreaterThan(span("fox"));
    expect(span("fox")).toBeGreaterThan(span("squirrel"));
    expect(span("owl")).toBe(0);
  });
});

/**
 * The motion system's central claim: species are distinguished by *timing*, and
 * individuals within a species are too. Both halves are easy to break silently
 * — a copied line in the gesture table, or a phase-only offset — and neither
 * shows up as an error.
 */
describe("gesture timing", () => {
  it("gives every species with an idle loop its own period", () => {
    const periods = Object.entries(GESTURE)
      .filter(([, g]) => g !== null)
      .map(([species, g]) => ({ species, period: g!.period }));

    const seen = new Map<number, string[]>();
    for (const { species, period } of periods) {
      seen.set(period, [...(seen.get(period) ?? []), species]);
    }
    for (const [period, species] of seen) {
      expect(species.length, `${species.join(" and ")} share a ${period}s period`).toBe(1);
    }
  });

  it("keeps species periods far enough apart to not beat together", () => {
    const periods = Object.values(GESTURE)
      .filter((g): g is { className: string; period: number } => g !== null)
      .map((g) => g.period)
      .sort((a, b) => a - b);

    for (let i = 1; i < periods.length; i += 1) {
      const ratio = periods[i] / periods[i - 1];
      // Adjacent periods that are near-integer multiples re-sync often and
      // read as one rhythm. 2s and 4s would meet every four seconds.
      const nearestMultiple = Math.round(ratio);
      if (nearestMultiple >= 2) {
        expect(
          Math.abs(ratio - nearestMultiple),
          `${periods[i - 1]}s and ${periods[i]}s are a clean ${nearestMultiple}x apart`,
        ).toBeGreaterThan(0.05);
      }
    }
  });

  it("gives every species a distinct gesture, not just a distinct period", () => {
    const classes = Object.values(GESTURE)
      .filter((g) => g !== null)
      .map((g) => g!.className);
    expect(new Set(classes).size, "two species share a gesture").toBe(classes.length);
  });

  it("leaves the two species that are already motion without an idle loop", () => {
    // A dragonfly darts and a fish is a spreading ring; both are entirely
    // motion already, and adding an idle would be a second animation on top.
    expect(GESTURE.dragonfly).toBeNull();
    expect(GESTURE.fish).toBeNull();
  });
});
