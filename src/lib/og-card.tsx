import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { about } from "@/content/about";
import { groundY } from "@/backdrop/engine";
import { mulberry32 } from "@/backdrop/rand";
import type { Depth } from "@/backdrop/scene";

/**
 * The social card: the site's own dusk, with the site's own skyline.
 *
 * Shared by `opengraph-image.tsx` and `twitter-image.tsx` so there is one card,
 * not two that drift. Both are statically generated at build time — nothing here
 * reads a request — so this costs a build step and zero runtime.
 *
 * ## The skyline is real
 *
 * The four ridges are sampled from `groundY()`, the same function the live
 * backdrop draws from. It is not a drawing *of* the site, it is the site's
 * terrain at a different crop, which means it cannot fall out of date when the
 * curves in `terrain.ts` change.
 *
 * ## Why the colours are literals here
 *
 * Satori parses a small CSS subset and does not understand `oklch()`, so the
 * palette cannot be handed over as it is written. These are the sRGB
 * equivalents of `atmosphereAt("light", 1)` — full dusk — and `SURFACES.light`.
 * `og-card.test.ts` converts the real tokens with culori and asserts every one
 * of them matches, so a palette edit fails the suite rather than silently
 * leaving the card on last month's colours.
 *
 * Dusk rather than night for one concrete reason: the dark family's four layer
 * colours run #050914 → #000204 against a #0a0f1c sky, so a night skyline is
 * four blacks on black. At dusk they separate.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${about.name} — ${about.role}`;

/** `atmosphereAt("light", 1)` and `SURFACES.light`, in sRGB. Pinned by test. */
const C = {
  skyTop: "#d8e6f9",
  skyMid: "#ffead8",
  skyHorizon: "#ffeadc",
  glow: "#ffe1bc",
  celestial: "#ffa96a",
  aether: "#00b8a9",
  layerFar: "#c6d3e1",
  layerMid: "#a4bfc4",
  layerNear: "#85a39a",
  layerFore: "#768d7a",
  ink: "#0e1217",
  inkMuted: "#4e5359",
  accentInk: "#006768",
} as const;

/**
 * The crop, in the backdrop's own 900-unit coordinate space.
 *
 * `groundY` puts the far ridge at 462–612 and the foreground at 820–884, so a
 * window of 450→900 holds the whole landscape and none of the empty sky above
 * it. It is drawn into 300px with `preserveAspectRatio="none"`, which squashes
 * vertically by a third — deliberate, and what makes the card read as a panorama
 * rather than a slice of the page.
 */
const CROP_TOP = 450;
const CROP_HEIGHT = 450;
const BAND_HEIGHT = 300;
const SAMPLES = 300;

function ridgePath(depth: Depth): string {
  const points: string[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const u = i / SAMPLES;
    points.push(`${(u * size.width).toFixed(1)},${groundY(depth, u).toFixed(1)}`);
  }
  return `M ${points.join(" L ")} L ${size.width},900 L 0,900 Z`;
}

/**
 * Conifers along a ridge crest, in the plane's own colour.
 *
 * Same fill as the ridge, so they merge into one silhouette exactly as they do
 * on the site — trees are the *edge* of a plane, never objects on top of it.
 * Without them the card is four rolling hills, which is a landscape but not this
 * landscape. Seeded per plane so every build produces the same card.
 */
function treesPath(depth: Depth, seed: number, spacing: number, height: number): string {
  const random = mulberry32(seed);
  const parts: string[] = [];
  for (let u = spacing * 0.5; u < 1; u += spacing) {
    const at = Math.min(u + (random() - 0.5) * spacing * 0.8, 1);
    const x = at * size.width;
    const y = groundY(depth, at);
    const h = height * (0.7 + random() * 0.6);
    const w = h * 0.34;
    // +3 on the base so the trunk never floats off a steep slope.
    parts.push(`M ${(x - w).toFixed(1)},${(y + 3).toFixed(1)} L ${x.toFixed(1)},${(y - h).toFixed(1)} L ${(x + w).toFixed(1)},${(y + 3).toFixed(1)} Z`);
  }
  return parts.join(" ");
}

/** The whole landscape as one data-URI SVG. Satori renders `<img>` reliably;
 * it does not render inline SVG children. */
function skylineDataUri(): string {
  const planes: [Depth, string][] = [
    ["far", C.layerFar],
    ["mid", C.layerMid],
    ["near", C.layerNear],
    ["fore", C.layerFore],
  ];
  // Nothing on `far` — at that distance the crest is a smooth ridge, which is
  // what aerial perspective looks like and what stops the card reading as four
  // copies of one plane.
  const canopy: Partial<Record<Depth, { seed: number; spacing: number; height: number }>> = {
    mid: { seed: 0x5eed01, spacing: 0.017, height: 20 },
    near: { seed: 0x5eed02, spacing: 0.021, height: 30 },
    fore: { seed: 0x5eed03, spacing: 0.027, height: 42 },
  };
  const paths = planes
    .map(([depth, fill]) => {
      const trees = canopy[depth];
      const ridge = `<path d="${ridgePath(depth)}" fill="${fill}"/>`;
      if (!trees) return ridge;
      const crest = treesPath(depth, trees.seed, trees.spacing, trees.height);
      return `${ridge}<path d="${crest}" fill="${fill}"/>`;
    })
    .join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${BAND_HEIGHT}" ` +
    `viewBox="0 ${CROP_TOP} ${size.width} ${CROP_HEIGHT}" preserveAspectRatio="none">${paths}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");

export async function ogCard() {
  const [serif, sans, mono] = await Promise.all([
    readFile(path.join(FONT_DIR, "InstrumentSerif-Regular.woff")),
    readFile(path.join(FONT_DIR, "InstrumentSans-Regular.woff")),
    readFile(path.join(FONT_DIR, "JetBrainsMono-Regular.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundImage: `linear-gradient(180deg, ${C.skyTop} 0%, ${C.skyMid} 54%, ${C.skyHorizon} 100%)`,
        }}
      >
        {/* The sun's bloom, then its disc. Two elements for the same reason the
            palette keeps `glow` and `celestial` apart: the light thrown is wide
            and soft, the body is small and defined. */}
        <div
          style={{
            position: "absolute",
            top: -36,
            right: 28,
            width: 520,
            height: 520,
            borderRadius: 260,
            backgroundImage: `radial-gradient(circle, ${C.glow} 0%, rgba(255,225,188,0) 66%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 176,
            right: 240,
            width: 96,
            height: 96,
            borderRadius: 48,
            background: C.celestial,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            // The text has to finish above the far ridge, which on the left of
            // the crop sits around y=418. Everything below is sized to land the
            // last line near y=350.
            padding: "70px 0 0 88px",
            maxWidth: 820,
          }}
        >
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 20,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.accentInk,
            }}
          >
            {about.role}
          </div>
          <div
            style={{
              fontFamily: "Instrument Serif",
              fontSize: 94,
              lineHeight: 1.02,
              // One line, always. Wrapped across two it stops being a name and
              // starts being a headline, and it pushes the tagline into the trees.
              whiteSpace: "nowrap",
              color: C.ink,
              marginTop: 18,
            }}
          >
            {about.name}
          </div>
          {/* The one accent rule. `--aether` is the identity hue and the only
              place it appears on this card. */}
          <div style={{ width: 132, height: 3, background: C.aether, marginTop: 30 }} />
          <div
            style={{
              fontFamily: "Instrument Sans",
              fontSize: 26,
              lineHeight: 1.38,
              color: C.inkMuted,
              marginTop: 24,
              maxWidth: 620,
            }}
          >
            {about.tagline}
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element -- this JSX is
            rendered by satori into a PNG, not by React into the DOM; `next/image`
            has nothing to optimise here and would not render at all. */}
        <img
          src={skylineDataUri()}
          width={size.width}
          height={BAND_HEIGHT}
          alt=""
          style={{ position: "absolute", left: 0, bottom: 0 }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: serif, style: "normal", weight: 400 },
        { name: "Instrument Sans", data: sans, style: "normal", weight: 400 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
