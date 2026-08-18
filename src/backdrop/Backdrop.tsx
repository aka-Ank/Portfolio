"use client";

import { useRef } from "react";
import { useAppStore } from "@/state/useAppStore";
import { useSky } from "@/systems/theme/useSky";
import { WEATHER } from "@/systems/theme/palette";
import { useSceneScroll } from "./useSceneScroll";
import { useWind, useWorldTick } from "./useWorldClock";
import { wildlifeAt } from "./ecosystem";
import { Layer } from "./Layer";
import { DRIFT_PX, WorldPlane, WaterPlane, MistLayer, stripWidth } from "./world";
import { Wildlife } from "./Wildlife";
import { ParticleField } from "./ParticleField";
import { Sun, Moon } from "./Celestial";
import { Sky } from "./Sky";
import { deriveScene, PHASE } from "./scene";

/**
 * One continuous forest behind everything.
 *
 * Composition, back to front: sky wash, sun or moon, cloud band, four depth
 * planes of a single landscape, light shafts, drifting motes, haze and grain.
 *
 * **The world is an ecosystem, not a set of effects.** Wildlife is a pure
 * function of the world clock (`ecosystem.ts`), so a deer that walks off while
 * the visitor is scrolling elsewhere is exactly where it would be when they
 * come back — nothing is simulated, so nothing can be lost. Habitats are
 * predicates over the terrain, so the ducks are wherever the lake is.
 *
 * **Weather reaches everything at once.** The same five scalars drive the haze,
 * the cloud band, the wind, the water's chop and which animals shelter — and
 * the soundscape, through `AmbienceBridge`.
 *
 * **The world is one strip per plane, not a set of scenes.** Scrolling slides
 * them horizontally at per-depth rates, so a different part of the wood comes
 * into frame because the viewer moved. There is no crossfade to tune because
 * there is no transition — see `world.tsx`.
 *
 * Two things carry the readability guarantee, and it is worth being precise
 * about which does what:
 *
 *  - `SCENE_HORIZON` keeps scene *detail* out of the upper two-thirds of the
 *    frame. That is a composition rule: it stops the forest being busy behind
 *    the text. The sun and moon are the deliberate exception — they have to
 *    cross the sky to be a light source at all.
 *  - The **contrast audit** is the actual guarantee. Cards scroll through the
 *    entire viewport, so they genuinely do pass over the foreground plane and
 *    over the moon; what makes that safe is that every panel carries its own
 *    `--surface`, and `contrast-audit.test.ts` checks ink against that surface
 *    composited over every plane, glow and celestial colour in both families.
 */


export function Backdrop() {
  const stageRef = useRef<HTMLDivElement>(null);
  const weather = useAppStore((s) => s.weather);
  const sky = useSky();
  const effect = WEATHER[weather];
  const worldTime = useWorldTick();

  useSceneScroll(stageRef);
  useWind(stageRef, effect.gust);

  const scene = deriveScene(sky, effect);

  // Mist is the one weather layer that also answers to the time of day. Fog
  // forms overnight and burns off through the morning, so the first stretch of
  // the light family carries a boost that the same weather at noon does not —
  // "a misty dawn" is a different picture from "a misty afternoon", and without
  // this they were the same one.
  const dawnBoost = sky.family === "light" ? Math.max(0, 0.34 * (1 - sky.t / 0.3)) : 0.12;
  const mist = Math.min(effect.veil + dawnBoost, 1);
  // Rare by design: most seconds have nothing out at all. See `ecosystem.ts`.
  const wildlife = wildlifeAt(worldTime, sky.sunAltitude, effect);

  return (
    <div
      ref={stageRef}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
      style={
        {
          // `--sway` is written by `useWind` four times a second and
          // interpolated by @property, so gusts are real without a per-frame
          // style write. This is only the pre-hydration fallback.
          "--sway": 1,
          "--parallax-range": "90px",
          // Horizontal travel is what carries the whole sense of movement. It
          // is much larger than the vertical because it is no longer a garnish
          // on a fixed scene — it *is* how the visitor travels through the
          // world, and how one section's view differs from the next.
          "--drift-range": `${DRIFT_PX}px`,
          // One property turns the whole ground-mist layer up or down.
          "--mist": mist,
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--sky-top)_0%,var(--sky-mid)_52%,var(--sky-horizon)_100%)]" />

      {/* Stars sit behind the moon and in front of the sky wash, so the moon
          always reads as nearer than the field it crosses. */}
      <Sky density={scene.stars} meteors={scene.shootingStars} />

      <Sun placement={scene.sun} />
      <Moon
        placement={scene.moon}
        illumination={scene.moonIllumination}
        waxing={scene.moonWaxing}
      />

      {/* Cloud band. Three very wide, very soft masses on one long loop,
          offset so they never line up. It sits in front of the sun and moon,
          which is what makes an overcast sky read as the light being *blocked*
          rather than as grey shapes laid over a still-visible disc. */}
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
        <WorldPlane depth="far" />
      </Layer>

      <Layer depth="mid">
        <WorldPlane depth="mid" />
      </Layer>

      {/* Light shafts sit between the far and mid canopy, which is what makes
          them read as light coming *through* the wood rather than as stripes
          painted over it. They lean with the sun: `--sun-lean` is the azimuth
          re-expressed as a tilt, so at dawn the light slants one way and at
          dusk the other, which is the detail that ties them to the disc
          overhead rather than leaving them as decoration. */}
      {scene.shafts > 0.01 && (
        <div
          className="absolute inset-x-0 top-0 h-[70vh] transition-opacity duration-[1600ms] motion-reduce:transition-none"
          style={
            {
              opacity: scene.shafts * 0.5,
              "--sun-lean": `${(scene.sun.x / 100 - 0.5) * 26}deg`,
            } as React.CSSProperties
          }
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
        <WorldPlane depth="near" />
        {/* Ground mist sits behind the near shore's planting and in front of
            the treeline, so the wood recedes into it rather than standing on
            top of it. */}
        <MistLayer />
        {/* Water sits behind the near shore's planting and in front of the
            treeline it reflects. */}
        <WaterPlane
          chop={effect.chop}
          // The moon reflects harder than the sun: a dark sky has far less to
          // wash the reflection out, which is why a lake at night is a mirror
          // and at noon is a bright blur.
          reflectivity={sky.family === "dark" ? 1 : 0.72}
        />
        <Wildlife
          events={wildlife.filter((e) => e.species === "bird" || e.species === "squirrel")}
          width={stripWidth("near")}
        />
      </Layer>

      <Layer depth="fore">
        <WorldPlane depth="fore" />
        <Wildlife
          events={wildlife.filter((e) => e.species !== "bird" && e.species !== "squirrel")}
          width={stripWidth("fore")}
        />
      </Layer>

      <ParticleField kind={scene.particles} fireflies={scene.fireflies} />

      {/* Aerial haze — the depth wash, not the fog. It reads as distance rather
          than as weather, and it is deliberately weaker than it used to be now
          that `MistLayer` carries the actual mist: at full strength the two
          stacked into a flat wash over the whole lower frame.

          Overscanned by 6% each side because `drift-mist` translates ±4%: at
          `inset-x-0` the drift slides the haze off one edge and leaves a hard
          vertical seam down the other. */}
      <div
        className="drift-mist absolute bottom-0 h-[64%] transition-opacity duration-[1600ms] motion-reduce:transition-none"
        style={{
          left: "-6%",
          right: "-6%",
          opacity: effect.veil * 0.45,
          background:
            "linear-gradient(to top, var(--sky-horizon) 0%, color-mix(in oklch, var(--sky-horizon) 45%, transparent) 55%, transparent 100%)",
        }}
      />

      <div className="grain absolute inset-0" />
    </div>
  );
}
