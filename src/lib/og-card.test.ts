import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { converter, formatHex, parse } from "culori";
import { atmosphereAt, SURFACES } from "@/systems/theme/palette";
import { alt, size } from "./og-card";
import { about } from "@/content/about";

/**
 * The card's colours are sRGB literals because satori cannot parse `oklch()`.
 * That makes them a copy of the palette, and a copy is a thing that drifts. This
 * is the same guard `contrast-audit.test.ts` puts on the CSS defaults: convert
 * the real token, assert the literal matches.
 */
const toRgb = converter("rgb");
const hex = (o: { l: number; c: number; h: number }) =>
  formatHex(toRgb({ mode: "oklch", l: o.l, c: o.c, h: o.h }))!;

/** Parsed out of the source rather than exported, so the card keeps one flat
 * literal table instead of growing an export just for its test. */
function cardColours(): Record<string, string> {
  const src = readFileSync(path.join(process.cwd(), "src", "lib", "og-card.tsx"), "utf8");
  const block = src.match(/const C = \{([\s\S]*?)\} as const;/);
  if (!block) throw new Error("could not find the colour table in og-card.tsx");
  const out: Record<string, string> = {};
  for (const [, key, value] of block[1].matchAll(/(\w+):\s*"(#[0-9a-f]{6})"/g)) {
    out[key] = value;
  }
  return out;
}

describe("the OG card's colours are the palette's", () => {
  const C = cardColours();
  /** Full dusk. Chosen because the dark family's layers are four blacks. */
  const dusk = atmosphereAt("light", 1);

  it("found every literal", () => {
    expect(Object.keys(C)).toHaveLength(13);
  });

  it.each(Object.keys(dusk) as (keyof typeof dusk)[])(
    "%s matches atmosphereAt('light', 1)",
    (token) => {
      expect(C[token], `og-card.tsx has ${C[token]} for ${token}`).toBe(hex(dusk[token]));
    },
  );

  it.each(["ink", "inkMuted", "accentInk"] as const)("%s matches SURFACES.light", (token) => {
    expect(C[token]).toBe(formatHex(parse(SURFACES.light[token])!));
  });

  /**
   * The layers have to stay visibly apart or the skyline is one shape. This is
   * what rules out the night palette for this card, so it is worth asserting
   * rather than remembering.
   */
  it("keeps the four ridges distinguishable from each other", () => {
    const ls = [dusk.layerFar, dusk.layerMid, dusk.layerNear, dusk.layerFore].map((o) => o.l);
    for (let i = 1; i < ls.length; i += 1) {
      expect(ls[i - 1] - ls[i], `layer ${i} is not darker than layer ${i - 1}`).toBeGreaterThan(
        0.03,
      );
    }
  });
});

describe("the OG card's metadata", () => {
  it("is the size every platform crops from", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
  });

  it("has alt text that names the person, not the picture", () => {
    expect(alt).toContain(about.name);
    expect(alt).toContain(about.role);
  });
});
