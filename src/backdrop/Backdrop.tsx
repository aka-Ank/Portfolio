"use client";

import { useRef } from "react";
import { useAppStore } from "@/state/useAppStore";
import { resolveTheme, WEATHER } from "@/systems/theme/palette";
import { useParallax } from "./useParallax";
import { Layer } from "./Layer";
import { ParticleField } from "./ParticleField";
import { INHABITANTS, nearestAnchor, PHASE, SHAFT_STRENGTH } from "./scene";
import { Ridge, FarTreeline, MidCanopy } from "./plates/Terrain";
import { Foreground } from "./plates/Foreground";
import { Deer, Owl, Birds } from "./plates/Animals";

/**
 * The living forest behind everything.
 *
 * Composition, back to front: sky wash, key light, cloud band, four depth
 * planes, light shafts, inhabitants, particles, haze and grain.
 *
 * Two things carry the readability guarantee, and it is worth being precise
 * about which does what:
 *
 *  - The **content band** (18vh–82vh) keeps scene *detail* out of the middle
 *    of the frame. That is a composition rule: it stops the forest being busy
 *    behind the text.
 *  - The **contrast audit** is the actual guarantee. Cards scroll through the
 *    entire viewport, so they genuinely do pass over the foreground plane;
 *    what makes that safe is that every panel carries its own `--surface`, and
 *    `contrast-audit.test.ts` checks ink against that surface composited over
 *    every plane colour in both families.
 *
 * A client component because it reads the visitor's weather and time settings
 * and publishes scroll progress. Everything it *renders* is static markup: the
 * only JavaScript is `useParallax` writing one CSS variable per frame, which
 * all four planes then consume in pure CSS.
 */
export function Backdrop() {
  const stageRef = useRef<HTMLDivElement>(null);
  const colorMode = useAppStore((s) => s.colorMode);
  const timeMode = useAppStore((s) => s.timeMode);
  const weather = useAppStore((s) => s.weather);
  useParallax(stageRef);

  const { t } = resolveTheme(colorMode, timeMode);
  const anchor = nearestAnchor(t);
  const inhabitants = INHABITANTS[anchor];
  const effect = WEATHER[weather];
  const shafts = SHAFT_STRENGTH[anchor];

  return (
    <div
      ref={stageRef}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
      style={
        {
          // The wind multiplier every sway keyframe reads. One variable drives
          // the whole forest's response to weather.
          "--sway": effect.sway,
          "--parallax-range": "90px",
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--sky-top)_0%,var(--sky-mid)_52%,var(--sky-horizon)_100%)]" />

      {/* Key light — never a hard disc. A soft pool is what a painted sky
          actually looks like, and it can never blow out the content. */}
      <div
        className="absolute -left-[10%] -top-[22%] h-[80vmax] w-[80vmax] rounded-full opacity-[0.5] blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, var(--glow) 0%, color-mix(in oklch, var(--glow) 20%, transparent) 45%, transparent 72%)",
        }}
      />

      {/* Cloud band. Three very wide, very soft masses on one long loop,
          offset so they never line up. */}
      <div
        className="absolute inset-x-0 top-0 h-[42vh] transition-opacity duration-[1600ms] motion-reduce:transition-none"
        style={{ opacity: effect.cloud }}
      >
        {[PHASE.cloudA, PHASE.cloudB, PHASE.cloudC].map((delay, index) => (
          <div
            key={delay}
            className="drift-cloud absolute inset-x-[-20%] rounded-[50%] blur-[60px]"
            style={{
              top: `${4 + index * 9}%`,
              height: `${16 + index * 5}%`,
              background: "var(--sky-mid)",
              opacity: 0.5 - index * 0.09,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>

      <Layer depth="far">
        <Ridge />
      </Layer>

      <Layer depth="mid">
        <FarTreeline />
        {inhabitants.birds && <Birds />}
      </Layer>

      {/* Light shafts sit between the far and mid canopy, which is what makes
          them read as light coming *through* the wood rather than as stripes
          painted over it. */}
      {shafts > 0 && (
        <div
          className="absolute inset-x-0 top-0 h-[70vh] transition-opacity duration-[1600ms] motion-reduce:transition-none"
          style={{ opacity: shafts * 0.5 }}
        >
          {[PHASE.shaftA, PHASE.shaftB].map((delay, index) => (
            <div
              key={delay}
              className="shaft-breathe absolute top-[-10%] h-[120%] blur-[26px]"
              style={{
                left: `${22 + index * 34}%`,
                width: `${7 + index * 3}%`,
                background:
                  "linear-gradient(to bottom, color-mix(in oklch, var(--glow) 55%, transparent), transparent 78%)",
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
      )}

      <Layer depth="near">
        <MidCanopy />
        {inhabitants.owl && <Owl />}
      </Layer>

      <Layer depth="fore">
        {/* The deer renders before the fronds inside the same plane, so the
            fronds overlap it. That occlusion is what puts it *in* the wood. */}
        {inhabitants.deer && <Deer />}
        <Foreground />
      </Layer>

      <ParticleField />

      {/* Haze. Weather changes its strength, never its hue — mist and rain are
          the same forest in different conditions, not a different palette. */}
      <div
        className="drift-mist absolute inset-x-0 bottom-0 h-[64%] transition-opacity duration-[1600ms] motion-reduce:transition-none"
        style={{
          opacity: effect.veil,
          background:
            "linear-gradient(to top, var(--sky-horizon) 0%, color-mix(in oklch, var(--sky-horizon) 45%, transparent) 55%, transparent 100%)",
        }}
      />

      <div className="grain absolute inset-0" />
    </div>
  );
}
