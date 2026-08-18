import type { ReactNode } from "react";
import { LOOP } from "./scene";

/**
 * A lake, filling a depression in the terrain.
 *
 * **There is no vertical edge anywhere in here, and that is structural rather
 * than careful.** The water's outline is not drawn — it is the terrain curve
 * itself wherever it lies below the surface level (see `shorelineOf` in
 * `engine.ts`). Both ends of the lake are the points where the land rises back
 * through the waterline, so they meet at a shallow angle, with coves and
 * peninsulas wherever the noise put them. The previous version clipped a
 * rectangle to a range, which can only produce a straight vertical edge no
 * matter what is drawn inside it.
 *
 * Four things make the surface read as water rather than as a blue shape:
 *
 * - **Depth.** A gradient from a pale, near-transparent shallow at the shore to
 *   a dark deep. Uniform fill is the clearest tell that a lake is a `<div>`
 *   with a background colour.
 * - **A Fresnel falloff.** Reflection is strongest at grazing angles, which on
 *   screen means *just under the far shoreline*, fading toward the viewer. The
 *   mask runs that way round. Reversing it is what makes most web reflections
 *   look like a photograph flipped upside down.
 * - **Banded ripple distortion**, growing with depth and with wind.
 * - **Reflectivity that responds to the sky.** The moon reflects harder than
 *   the sun, because a dark sky has less to wash the reflection out — and calm
 *   water reflects far more than choppy.
 */

const BANDS = 6;

export function Water({
  id,
  /** The lake's outline: terrain below the surface, closed along the waterline. */
  outline,
  /** Screen y of the surface. */
  surface,
  width,
  /** 0–1 from the weather. Breaks the reflection up and flattens the mirror. */
  chop,
  /** Higher at night. See the note above. */
  reflectivity,
  /** The artwork to mirror — the same shapes standing above the waterline. */
  reflect,
}: {
  id: string;
  outline: string;
  surface: number;
  width: number;
  chop: number;
  reflectivity: number;
  reflect: ReactNode;
}) {
  const depth = 900 - surface;
  const bandHeight = depth / BANDS;
  const clarity = Math.max(0, 1 - chop * 0.8);

  return (
    <g>
      <defs>
        {/* Everything below is clipped to the lake's own shape, so the water
            can never spill over the shore it was cut from. */}
        <clipPath id={`${id}-shape`}>
          <path d={outline} />
        </clipPath>

        {/* Depth: pale at the shore, dark in the middle. */}
        <linearGradient
          id={`${id}-depth`}
          x1="0"
          y1={surface}
          x2="0"
          y2={900}
          gradientUnits="userSpaceOnUse"
        >
          {/* Water reads as *lighter* than the land around it, because what
              you are looking at is mostly reflected sky. Filling it with the
              plane's own colour — which is what it did first — makes a lake the
              same value as the bank it sits in, and it disappears. The shallows
              take the farthest plane's near-sky tone, the deep water the
              midground's. */}
          <stop offset="0" stopColor="var(--sky-horizon)" stopOpacity={0.95} />
          <stop offset="0.35" stopColor="var(--layer-far)" stopOpacity={0.92} />
          <stop offset="1" stopColor="var(--layer-mid)" stopOpacity={0.95} />
        </linearGradient>

        {/* Fresnel. Opaque just under the far shore, transparent toward the
            viewer — grazing angles reflect, steep ones do not. */}
        <linearGradient
          id={`${id}-fresnel`}
          x1="0"
          y1={surface}
          x2="0"
          y2={900}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.35" stopColor="#fff" stopOpacity={0.55} />
          <stop offset="0.75" stopColor="#fff" stopOpacity={0.12} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id={`${id}-fade`}>
          <rect x={0} y={surface} width={width} height={depth} fill={`url(#${id}-fresnel)`} />
        </mask>

        {Array.from({ length: BANDS }, (_, i) => (
          <clipPath key={i} id={`${id}-band-${i}`}>
            <rect x={0} y={surface + i * bandHeight} width={width} height={bandHeight + 1} />
          </clipPath>
        ))}
      </defs>

      <g clipPath={`url(#${id}-shape)`}>
        <rect x={0} y={surface} width={width} height={depth} fill={`url(#${id}-depth)`} />

        {/* The reflection, banded. Each band shows its own slice of the
            mirrored world and drifts independently; deeper bands drift further,
            which is the coarse form of "blur increases with depth". */}
        <g mask={`url(#${id}-fade)`} opacity={0.5 * clarity * reflectivity}>
          {Array.from({ length: BANDS }, (_, i) => {
            const amplitude = (1.6 + i * 2.4) * (0.5 + chop);
            const duration = LOOP.ripple + i * 3;
            return (
              <g key={i} clipPath={`url(#${id}-band-${i})`}>
                <g
                  className="reflect-band"
                  style={{
                    animationDuration: `${duration}s`,
                    animationDelay: `${-duration * 0.37 * (i + 1)}s`,
                    ["--reflect-shift" as string]: `${amplitude.toFixed(2)}px`,
                  }}
                >
                  <g transform={`translate(0 ${surface * 2}) scale(1 -1)`}>{reflect}</g>
                </g>
              </g>
            );
          })}
        </g>

        {/* Wind lines. A few horizontal streaks catching the sky — what a
            breeze actually looks like on water from a distance. */}
        {chop > 0.2 &&
          Array.from({ length: 3 }, (_, i) => (
            <rect
              key={i}
              className="reflect-band"
              x={-40}
              y={surface + depth * (0.22 + i * 0.24)}
              width={width + 80}
              height={1.4}
              fill="var(--sky-horizon)"
              opacity={0.16 * chop}
              style={{
                animationDuration: `${11 + i * 4}s`,
                animationDelay: `${-6 * i}s`,
                ["--reflect-shift" as string]: `${6 + i * 5}px`,
              }}
            />
          ))}
      </g>

      {/* The waterline, following the shore rather than ruled across — it
          curves with every cove because it *is* the shore. */}
      <path d={outline} fill="none" stroke="var(--sky-horizon)" strokeWidth={1.8} opacity={0.7} />
    </g>
  );
}
