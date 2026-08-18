"use client";

import { useEffect, useRef } from "react";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";
import { SCENE_HORIZON, type SceneContent } from "./scene";

/**
 * The one canvas in the scene: drifting motes, falling weather, and fireflies.
 *
 * Canvas rather than DOM for exactly one reason — count. SVG and HTML are
 * retained-mode, so sixty drifting specks are sixty live nodes the browser
 * keeps in memory, styles, and composites individually. Canvas is
 * immediate-mode: sixty particles are sixty draw calls into a single element.
 * Everything else in this backdrop is SVG precisely because it is *not*
 * numerous, and benefits from being server-rendered and CSS-themed instead.
 *
 * **Fireflies share this canvas rather than getting their own layer.** They are
 * the same kind of thing — many small moving points — and the loop, the resize
 * handling, the visibility gating and the reduced-motion gate all already exist
 * here. A second canvas would be a second rAF loop for the sake of separating
 * two passes that run one after the other.
 *
 * Three things stop the loop, and all three matter:
 *   - reduced motion (OS or in-app) — never starts at all,
 *   - `document.hidden` — browsers throttle background rAF, but leaving a loop
 *     scheduled in a background tab still burns wakeups on some platforms,
 *   - a zero particle count for the current weather.
 */

type Kind = SceneContent["particles"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  /** Phase offset for the blink cycle, so fireflies never pulse in unison. */
  phase: number;
  speed: number;
}

/** Deliberately modest. The brief's failure mode is "random particle spam",
 * and the difference between sixty and three hundred motes is not beauty, it
 * is noise. Mobile gets fewer because the pixels are smaller and the battery
 * is not plugged in.
 *
 * Snow is the densest of the four and still under sixty: snow reads by its
 * *motion*, not its count, and a hundred flakes is a screensaver. */
function budget(kind: Kind, wide: boolean): number {
  if (kind === "drop") return wide ? 54 : 24;
  if (kind === "flake") return wide ? 46 : 20;
  if (kind === "leaf") return wide ? 14 : 7;
  return wide ? 24 : 11;
}

/* -------------------------------------------------------------------------- */
/* Fireflies                                                                   */
/* -------------------------------------------------------------------------- */

interface Firefly {
  x: number;
  y: number;
  /** Radians per second around a slow wandering path. */
  wander: number;
  wanderPhase: number;
  drift: number;
  /** Seconds between flashes. Never shared, so no two ever pulse together. */
  period: number;
  phase: number;
  size: number;
  /**
   * The density at which this one comes out.
   *
   * Fireflies arrive a few at a time as the light goes, rather than the whole
   * population fading up together. Scaling everyone's alpha by density instead
   * would put every firefly in the air at dusk at 10% brightness, which reads as
   * a dirty screen rather than as the first few of the evening.
   */
  threshold: number;
}

/**
 * Sixteen at most, and never more than a handful lit at any instant.
 *
 * The brief's failure mode for this one is "constant firefly spam", and the
 * defence is not just count — it is that the flash occupies a small part of each
 * one's cycle, so a field of sixteen shows perhaps three or four points of light
 * at a time.
 */
const FIREFLY_MAX = 22;

/** Their vertical band, as fractions of the frame.
 *
 * Bounded by `SCENE_HORIZON` at the top, which is the same line that keeps
 * scene detail out of the upper two thirds — so fireflies are physically
 * incapable of drifting up over the hero card or a section heading. They belong
 * down among the grass, the undergrowth and the water anyway, which is where
 * that line happens to put them. */
const FIREFLY_TOP = SCENE_HORIZON + 0.02;
const FIREFLY_BOTTOM = 0.97;

/**
 * A firefly's light is *emitted*, not reflected, so it does not take the
 * scene's colour — the same argument that makes snow the one other literal
 * colour in the backdrop. Every atmosphere token inverts between the two
 * families; a firefly is this yellow-green at dusk and at midnight and in any
 * palette there has ever been.
 */
const FIREFLY_TINT = "oklch(0.88 0.17 116)";

/**
 * Four kinds: dust, drifting leaves, rain and snow.
 *
 * Which one is on screen is decided by `deriveScene` from the weather, never
 * here — this draws what it is told to. Rain falls fast and near-vertical; snow
 * drifts, wanders sideways as it goes, and falls at about a sixth of the speed,
 * which is most of what separates the two at a glance.
 */
export function ParticleField({ kind, fireflies }: { kind: Kind; fireflies: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useAppStore(selectReducedMotion);

  /**
   * Density goes through a ref, not through the effect's dependencies.
   *
   * It is continuous in sun altitude, so it changes on every tick of the world
   * clock. As a dependency it would tear down and re-seed the whole canvas
   * several times a minute at dusk — every mote and every firefly jumping to a
   * new position, which is far more visible than the thing being animated.
   */
  const density = useRef(fireflies);
  // Written in an effect rather than during render. One frame of latency on a
  // value that moves over the course of an evening is not observable.
  useEffect(() => {
    density.current = fireflies;
  }, [fireflies]);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let flies: Firefly[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;

    const seedFireflies = () => {
      const wide = window.innerWidth >= 768;
      const count = wide ? FIREFLY_MAX : Math.round(FIREFLY_MAX * 0.5);
      flies = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: (FIREFLY_TOP + Math.random() * (FIREFLY_BOTTOM - FIREFLY_TOP)) * height,
        // Slow enough that following one is a choice rather than a reflex. A
        // firefly that crosses the frame in a few seconds is a cursor.
        wander: 0.18 + Math.random() * 0.3,
        wanderPhase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.22,
        // Never round, never shared: 2.6–6.4s means no two are ever in step,
        // and none of them lands on a whole second against any CSS loop.
        period: 2.6 + Math.random() * 3.8,
        phase: Math.random() * Math.PI * 2,
        size: 1.7 + Math.random() * 1.3,
        // Spread across the range so they arrive gradually as the light goes,
        // and the last few only ever appear on the stillest, dampest nights.
        threshold: (index / count) * 0.88,
      }));
    };

    const seed = () => {
      const wide = window.innerWidth >= 768;
      const count = budget(kind, wide);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        // Leaves fall *and* travel: a leaf that only sinks reads as a bug, and
        // one that only drifts reads as dust. The horizontal component is the
        // larger of the two, because that is what wind does to a falling leaf.
        vx:
          kind === "drop"
            ? -0.4 - Math.random() * 0.3
            : kind === "flake"
              ? (Math.random() - 0.5) * 0.5
              : kind === "leaf"
                ? -(0.5 + Math.random() * 0.6)
                : (Math.random() - 0.5) * 0.16,
        vy:
          kind === "drop"
            ? 3.6 + Math.random() * 2.4
            : kind === "flake"
              ? 0.5 + Math.random() * 0.55
              : kind === "leaf"
                ? 0.22 + Math.random() * 0.3
                : -(0.06 + Math.random() * 0.14),
        size:
          kind === "drop"
            ? 6 + Math.random() * 8
            : kind === "flake"
              ? 1.1 + Math.random() * 1.7
              : kind === "leaf"
                ? 1.8 + Math.random() * 1.6
                : 0.9 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.7,
      }));
    };

    const resize = () => {
      // Cap DPR at 2: beyond that the particles are sub-perceptual and the
      // canvas is four times the pixels for nothing.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      seedFireflies();
    };

    const readToken = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      // Leaves take the foreground plane's colour so they read as having come
      // off the trees on screen. Rain takes the sky's, because rain is sky
      // falling out of it. Dust takes the light.
      //
      // Snow is the one **literal colour in the scene**, and it is a deliberate
      // exception to "the palette supplies colour". Every atmosphere token
      // inverts between the two families, so any of them would give dark flakes
      // on a dark sky or invisible ones on a light sky — `--sky-horizon` is 0.97
      // in daylight and 0.17 at night, and snow needs to be pale in both. Snow
      // is white in every palette there has ever been; hard-coding it is
      // describing the material, not baking in a theme.
      const tint =
        kind === "leaf"
          ? readToken("--layer-fore")
          : kind === "flake"
            ? "oklch(0.97 0.01 240)"
            : kind === "drop"
              ? readToken("--sky-horizon")
              : readToken("--glow");

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap rather than respawn: a particle that fades in at a random point
        // is a twinkle, and twinkling is the thing that makes a background
        // look busy.
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Rain is drawn as a streak, not a dot — a falling drop is a line at
        // any shutter speed the eye has, and dots read as bubbles.
        if (kind === "drop") {
          ctx.strokeStyle = tint;
          ctx.globalAlpha = 0.2;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2, p.y - p.size);
          ctx.stroke();
          continue;
        }

        // Snow wanders. A flake that falls straight is sleet; the sideways
        // drift on its own slow sine is the whole difference, and it costs one
        // trig call per flake.
        if (kind === "flake") {
          p.x += Math.sin(now * 0.0004 * p.speed + p.phase) * 0.5;
        }

        // Leaves tumble, which shows as their width oscillating rather than as
        // a rotation — the same read at a fraction of the cost. Everything here
        // is well under half opacity: meant to be noticed peripherally.
        ctx.globalAlpha = kind === "leaf" ? 0.3 : kind === "flake" ? 0.62 : 0.12;
        ctx.fillStyle = tint;
        ctx.beginPath();
        if (kind === "leaf") {
          const tumble = Math.abs(Math.sin(now * 0.0006 * p.speed + p.phase));
          ctx.ellipse(p.x, p.y, p.size * (0.25 + tumble * 0.75), p.size, 0.6, 0, Math.PI * 2);
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      drawFireflies(now);

      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    /**
     * The second pass: fireflies over whatever the weather is doing.
     *
     * Drawn last so they read as being in front, and skipped entirely at zero
     * density — which is most of the day, so this costs nothing whenever there
     * are none.
     */
    const drawFireflies = (now: number) => {
      const level = density.current;
      if (!(level > 0.02)) return;

      const seconds = now / 1000;

      for (const fly of flies) {
        if (level <= fly.threshold) continue;

        // A slow wandering path rather than a straight drift. Two sines on
        // unrelated rates give a loose figure that never quite repeats, which is
        // what a hovering insect looks like; a single sine is a pendulum.
        fly.x += Math.sin(seconds * fly.wander + fly.wanderPhase) * 0.34 + fly.drift;
        fly.y += Math.cos(seconds * fly.wander * 0.63 + fly.wanderPhase) * 0.22;

        const top = FIREFLY_TOP * height;
        const bottom = FIREFLY_BOTTOM * height;
        if (fly.y < top) fly.y = top;
        if (fly.y > bottom) fly.y = bottom;
        if (fly.x < -12) fly.x = width + 12;
        if (fly.x > width + 12) fly.x = -12;

        // The flash. Squaring a half-wave sine leaves a bright peak and a long
        // dark trough, so each one is *off* for roughly two thirds of its cycle
        // — which is both what a firefly does and what keeps twenty-two of them
        // reading as a handful of points of light rather than a swarm.
        //
        // This was cubed, which held each flash so briefly that catching one was
        // luck. Squared is still mostly-dark; it is just long enough to see.
        const wave = Math.sin((seconds / fly.period) * Math.PI * 2 + fly.phase);
        const flash = wave <= 0 ? 0 : wave ** 2;
        if (flash < 0.02) continue;

        // Fade the newest arrivals in over the first bit of their range, so a
        // firefly crossing its threshold does not blink into existence.
        const emergence = Math.min((level - fly.threshold) / 0.12, 1);
        const alpha = flash * emergence;

        ctx.fillStyle = FIREFLY_TINT;
        // Halo, mid, then core. Three arcs rather than a radial gradient: a
        // gradient object per firefly per frame is an allocation the loop does
        // not need. The middle ring is what gives the light a body — with only
        // an outer haze and a one-pixel centre it read as a speck of dust.
        ctx.globalAlpha = alpha * 0.16;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * 4.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha * 0.4;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion, kind]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
