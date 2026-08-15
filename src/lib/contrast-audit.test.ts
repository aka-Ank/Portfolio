import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { converter, wcagContrast } from "culori";
import { WORLD_TOKENS } from "@/world/tokens";
import type { TimeOfDayAnchor } from "@/types/world";

/**
 * Programmatic WCAG AA contrast audit — docs/07-accessibility-and-testing.md
 * "checked programmatically, not eyeballed once at 'day'." Reads the real
 * shipped CSS (globals.css) rather than a hand-copied duplicate of the
 * token values, so this breaks the moment a token changes without the
 * audit being re-verified — the whole point of a regression test.
 *
 * Two things are checked:
 * 1. The fixed UI/chrome token pairs actually used in the codebase
 *    (bg-[var(--x)] text-[var(--y)] combinations — grepped for real usage,
 *    not assumed).
 * 2. The one pairing that's genuinely tricky: --ink-inverse text sitting on
 *    the translucent --scrim background used by every floating overlay
 *    panel over the 3D world. Because --scrim has alpha, its *effective*
 *    on-screen color depends on whatever world content is behind it —
 *    globals.css's own comment claims contrast "can never silently fail at
 *    some point in the day/night cycle" by construction, which is exactly
 *    the kind of claim worth verifying rather than trusting. This
 *    alpha-composites --scrim over every anchor's sky/fog/ground color (the
 *    plausible backgrounds a panel could sit in front of) across all 4
 *    time-of-day anchors, in both the light (:root) and dark (.dark) token
 *    sets — the latter isn't reachable via any UI toggle today, but it's
 *    shipped CSS and worth not silently breaking.
 */

const AA_BODY_TEXT = 4.5;

const toRgb = converter("rgb");

function extractTokens(cssBlock: string): Record<string, string> {
  const tokens: Record<string, string> = {};

  // Pass 1: literal oklch(...) values.
  const literalRe = /--([a-z-]+):\s*(oklch\([^)]+\))\s*;/g;
  let match: RegExpExecArray | null;
  while ((match = literalRe.exec(cssBlock))) {
    tokens[match[1]] = match[2];
  }

  // Pass 2: var(--x) indirections (e.g. `--secondary-foreground: var(--ink);`)
  // resolved against pass 1's literals — one level of indirection covers
  // every token this audit cares about in the current CSS.
  const varRe = /--([a-z-]+):\s*var\(--([a-z-]+)\)\s*;/g;
  while ((match = varRe.exec(cssBlock))) {
    const [, name, referenced] = match;
    if (tokens[referenced]) tokens[name] = tokens[referenced];
  }

  return tokens;
}

const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf-8");
const rootBlock = css.match(/:root\s*{([^}]+)}/)?.[1] ?? "";
const darkBlock = css.match(/\.dark\s*{([^}]+)}/)?.[1] ?? "";
const lightTokens = extractTokens(rootBlock);
const darkTokens = extractTokens(darkBlock);

if (Object.keys(lightTokens).length === 0 || Object.keys(darkTokens).length === 0) {
  throw new Error(
    "Failed to parse :root/.dark token blocks from globals.css — the audit below would silently test nothing.",
  );
}

function contrast(fg: unknown, bg: unknown): number {
  return wcagContrast(fg as string, bg as string);
}

/** Standard source-over alpha compositing of a translucent color onto an opaque background. */
function compositeOver(translucent: string, backgroundHex: string) {
  const fg = toRgb(translucent);
  const bg = toRgb(backgroundHex);
  if (!fg || !bg) throw new Error(`Could not parse color: "${translucent}" or "${backgroundHex}"`);
  const alpha = fg.alpha ?? 1;
  return {
    mode: "rgb" as const,
    r: fg.r * alpha + bg.r * (1 - alpha),
    g: fg.g * alpha + bg.g * (1 - alpha),
    b: fg.b * alpha + bg.b * (1 - alpha),
  };
}

const THEMES: [string, Record<string, string>][] = [
  ["light (:root)", lightTokens],
  ["dark (.dark)", darkTokens],
];

describe("UI chrome token contrast — fixed pairs actually used in the codebase", () => {
  for (const [themeName, tokens] of THEMES) {
    it(`${themeName}: --accent-foreground on --accent (ChatWidget's user bubble)`, () => {
      expect(contrast(tokens["accent-foreground"], tokens.accent)).toBeGreaterThanOrEqual(
        AA_BODY_TEXT,
      );
    });

    it(`${themeName}: --primary-foreground on --primary (CTA buttons)`, () => {
      expect(contrast(tokens["primary-foreground"], tokens.primary)).toBeGreaterThanOrEqual(
        AA_BODY_TEXT,
      );
    });

    it(`${themeName}: --primary as standalone text on --paper (year labels, metric values, active-state indicators)`, () => {
      // A real Lighthouse/axe-core run caught this class of bug live:
      // --accent used as a bare text color (no explicit bg- in the same
      // className) inherits the ambient --paper background and fails badly
      // (2.2:1) — this audit's original fixed-pairs list only checked
      // explicit bg-[var(--x)] + text-[var(--y)] combinations in one
      // className, so a standalone text-[var(--accent)] slipped through.
      // Fixed by switching every such site to --primary (same hue, built
      // for exactly this). Asserting it here protects that fix and covers
      // the failure mode going forward.
      expect(contrast(tokens.primary, tokens.paper)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
    });

    it(`${themeName}: --secondary-foreground on --secondary (assistant chat bubbles)`, () => {
      expect(
        contrast(tokens["secondary-foreground"], tokens.secondary),
      ).toBeGreaterThanOrEqual(AA_BODY_TEXT);
    });

    it(`${themeName}: --ink on --paper (body text, classic mode default)`, () => {
      expect(contrast(tokens.ink, tokens.paper)).toBeGreaterThanOrEqual(AA_BODY_TEXT);
    });

    it(`${themeName}: --muted-foreground on --paper (de-emphasized body text)`, () => {
      expect(contrast(tokens["muted-foreground"], tokens.paper)).toBeGreaterThanOrEqual(
        AA_BODY_TEXT,
      );
    });
  }
});

describe("Overlay chrome (--ink-inverse on --scrim) against every world background, all 4 time-of-day anchors", () => {
  const anchors: TimeOfDayAnchor[] = ["dawn", "day", "sunset", "night"];

  for (const [themeName, tokens] of THEMES) {
    for (const anchor of anchors) {
      const worldBgCandidates: Record<string, string> = {
        skyTop: WORLD_TOKENS[anchor].skyTop,
        skyHorizon: WORLD_TOKENS[anchor].skyHorizon,
        fog: WORLD_TOKENS[anchor].fog,
        ground: WORLD_TOKENS[anchor].ground,
      };

      for (const [bgName, bgHex] of Object.entries(worldBgCandidates)) {
        it(`${themeName}, ${anchor} (${bgName} behind the scrim): --ink-inverse stays readable`, () => {
          const composited = compositeOver(tokens.scrim, bgHex);
          expect(contrast(tokens["ink-inverse"], composited)).toBeGreaterThanOrEqual(
            AA_BODY_TEXT,
          );
        });
      }
    }
  }
});
