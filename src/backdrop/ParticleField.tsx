"use client";

import { useEffect, useRef } from "react";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";
import { resolveTheme, WEATHER } from "@/systems/theme/palette";
import { nearestAnchor, INHABITANTS } from "./scene";

/**
 * The one canvas in the scene: drifting motes, fireflies, and rain.
 *
 * Canvas rather than DOM for exactly one reason — count. SVG and HTML are
 * retained-mode, so sixty drifting specks are sixty live nodes the browser
 * keeps in memory, styles, and composites individually. Canvas is
 * immediate-mode: sixty particles are sixty draw calls into a single element.
 * Everything else in this backdrop is SVG precisely because it is *not*
 * numerous, and benefits from being server-rendered and CSS-themed instead.
 *
 * Three things stop the loop, and all three matter:
 *   - reduced motion (OS or in-app) — never starts at all,
 *   - `document.hidden` — browsers throttle background rAF, but leaving a loop
 *     scheduled in a background tab still burns wakeups on some platforms,
 *   - a zero particle count for the current weather.
 */

type Kind = "mote" | "firefly" | "drop";

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
 * is not plugged in. */
function budget(kind: Kind, wide: boolean): number {
  if (kind === "drop") return wide ? 60 : 26;
  if (kind === "firefly") return wide ? 18 : 9;
  return wide ? 26 : 12;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorMode = useAppStore((s) => s.colorMode);
  const timeMode = useAppStore((s) => s.timeMode);
  const weather = useAppStore((s) => s.weather);
  const reducedMotion = useAppStore(selectReducedMotion);

  const { family, t } = resolveTheme(colorMode, timeMode);
  const anchor = nearestAnchor(t);
  const fireflies = INHABITANTS[anchor].fireflies;
  const rain = WEATHER[weather].drops > 0;

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const kind: Kind = rain ? "drop" : fireflies ? "firefly" : "mote";
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;

    const seed = () => {
      const wide = window.innerWidth >= 768;
      const count = budget(kind, wide);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: kind === "drop" ? -0.35 : (Math.random() - 0.5) * 0.16,
        vy: kind === "drop" ? 3.4 + Math.random() * 2.2 : -(0.06 + Math.random() * 0.14),
        size: kind === "drop" ? 6 + Math.random() * 8 : 0.9 + Math.random() * 1.5,
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
    };

    const readToken = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const tint = kind === "firefly" ? readToken("--aether") : readToken("--glow");

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

        if (kind === "drop") {
          ctx.strokeStyle = tint;
          ctx.globalAlpha = 0.16;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2, p.y - p.size);
          ctx.stroke();
          continue;
        }

        // Fireflies breathe; motes hold a steady faint value. Both are well
        // under half opacity — these are meant to be noticed peripherally.
        const blink =
          kind === "firefly"
            ? 0.18 + 0.34 * (0.5 + 0.5 * Math.sin(now * 0.0007 * p.speed + p.phase))
            : 0.12;
        ctx.globalAlpha = blink;
        ctx.fillStyle = tint;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
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
  }, [reducedMotion, fireflies, rain, family]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
