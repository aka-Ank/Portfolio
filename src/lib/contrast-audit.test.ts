import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { converter, wcagContrast } from "culori";
import { SURFACES, atmosphereAt, formatOklch, type SurfaceFamily } from "@/systems/theme/palette";

/**
 * Programmatic WCAG AA audit of the contrast-critical token pair.
 *
 * The whole reason the theme is split into two token systems is the claim
 * that decorative atmosphere tokens can drift freely because they never sit
 * behind text, while the surface/ink pair is discrete so it can be verified
 * exhaustively. That is a claim worth testing rather than trusting, and this
 * is the test.
 *
 * The hard case is `--surface`, which is translucent: its effective colour
 * depends on whatever atmosphere happens to be behind it. So every ink token
 * is checked against the surface composited over every point on both
 * families' rings — not just against the opaque variant.
 */

const AA_BODY = 4.5;
const AA_NON_TEXT = 3;

const toRgb = converter("rgb");

/** Alpha-composite `fg` over `bg`, both as CSS colour strings. */
function composite(fg: string, bg: string): string {
  const top = toRgb(fg);
  const bottom = toRgb(bg);
  if (!top || !bottom) throw new Error(`Unparseable colour: ${fg} over ${bg}`);
  const alpha = top.alpha ?? 1;
  return formatRgb({
    r: top.r * alpha + bottom.r * (1 - alpha),
    g: top.g * alpha + bottom.g * (1 - alpha),
    b: top.b * alpha + bottom.b * (1 - alpha),
  });
}

function formatRgb({ r, g, b }: { r: number; g: number; b: number }): string {
  const channel = (value: number) => Math.round(Math.min(Math.max(value, 0), 1) * 255);
  return `rgb(${channel(r)} ${channel(g)} ${channel(b)})`;
}

/** Every atmosphere colour a translucent panel could plausibly sit in front
 * of, sampled across the whole ring rather than at the four named stops —
 * the palette is continuous, so the stops are not the only reachable values. */
function backdropsFor(family: SurfaceFamily): string[] {
  const samples: string[] = [];
  for (let step = 0; step <= 10; step += 1) {
    const atmosphere = atmosphereAt(family, step / 10);
    samples.push(
      formatOklch(atmosphere.skyTop),
      formatOklch(atmosphere.skyHorizon),
      formatOklch(atmosphere.layerNear),
      formatOklch(atmosphere.haze),
    );
  }
  return samples;
}

const FAMILIES: SurfaceFamily[] = ["light", "dark"];

describe("surface/ink contrast", () => {
  for (const family of FAMILIES) {
    const surface = SURFACES[family];
    const inks: [string, string, number][] = [
      ["ink", surface.ink, AA_BODY],
      ["inkMuted", surface.inkMuted, AA_BODY],
      ["accentInk", surface.accentInk, AA_BODY],
      ["focusRing", surface.focusRing, AA_NON_TEXT],
    ];

    describe(`${family} family`, () => {
      for (const [name, colour, threshold] of inks) {
        it(`${name} passes on the opaque surface`, () => {
          expect(wcagContrast(colour, surface.surfaceSolid)).toBeGreaterThanOrEqual(threshold);
        });

        it(`${name} passes on the translucent surface over every atmosphere`, () => {
          for (const backdrop of backdropsFor(family)) {
            const effective = composite(surface.surface, backdrop);
            const ratio = wcagContrast(colour, effective);
            expect(
              ratio,
              `${name} on --surface over ${backdrop} was ${ratio.toFixed(2)}`,
            ).toBeGreaterThanOrEqual(threshold);
          }
        });
      }

      it("accentInk passes as button text against its own fill", () => {
        // The primary CTA inverts the pair: accent fill, surface-solid text.
        expect(
          wcagContrast(surface.surfaceSolid, surface.accentInk),
        ).toBeGreaterThanOrEqual(AA_BODY);
      });
    });
  }
});

describe("globals.css first-paint defaults", () => {
  const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf-8");

  /** The CSS ships the first paint before any JS runs; palette.ts owns every
   * frame after that. If the two drift, a visitor sees one palette flash into
   * another on hydration — so they are asserted equal rather than trusted. */
  function tokensIn(block: string): Record<string, string> {
    const tokens: Record<string, string> = {};
    const re = /--([a-z-]+):\s*(oklch\([^)]+\))\s*;/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(block))) tokens[match[1]] = match[2].replace(/\s+/g, " ");
    return tokens;
  }

  const rootBlock = css.match(/:root\s*{([\s\S]*?)}/)?.[1] ?? "";
  const darkBlock = css.match(/:root:not\(\[data-family="light"\]\)\s*{([\s\S]*?)}/)?.[1] ?? "";

  const CSS_TO_SURFACE = [
    ["surface", "surface"],
    ["surface-solid", "surfaceSolid"],
    ["surface-raised", "surfaceRaised"],
    ["border-soft", "border"],
    ["ink", "ink"],
    ["ink-muted", "inkMuted"],
    ["accent-ink", "accentInk"],
    ["focus-ring", "focusRing"],
  ] as const;

  it.each([
    ["light", rootBlock] as const,
    ["dark", darkBlock] as const,
  ])("%s surface tokens match palette.ts", (family, block) => {
    const tokens = tokensIn(block);
    expect(Object.keys(tokens).length).toBeGreaterThan(0);
    for (const [cssName, tsName] of CSS_TO_SURFACE) {
      const expected = SURFACES[family as SurfaceFamily][tsName].replace(/\s+/g, " ");
      expect(tokens[cssName], `--${cssName}`).toBe(expected);
    }
  });
});
