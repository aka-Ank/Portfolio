"use client";

import { useEffect, useRef } from "react";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";
import { PARTICLE_BUDGET } from "@/state/deviceSlice";
import type { Weather } from "@/state/uiSlice";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

interface Behaviour {
  speed: number;
  drift: number;
  size: [number, number];
  alpha: [number, number];
  streak: number;
  /** Which atmosphere token tints the pass. Only `clear` uses the Aether:
   * its slow motes are the one ambient element the motif has earned. Mist and
   * rain are weather, not life force, so they take the haze colour. */
  token: "--aether" | "--haze";
}

/** Three small variations on one system rather than three effects — the world
 * should read as the same place in different conditions. */
const BEHAVIOUR: Record<Weather, Behaviour> = {
  clear: { speed: 6, drift: 9, size: [1, 2.4], alpha: [0.18, 0.5], streak: 0, token: "--aether" },
  // Very large, very faint, very slow. Mist that you can pick individual
  // particles out of is not mist — it is bubbles.
  mist: { speed: 4, drift: 14, size: [90, 220], alpha: [0.025, 0.07], streak: 0, token: "--haze" },
  rain: { speed: 340, drift: 24, size: [0.7, 1.3], alpha: [0.1, 0.26], streak: 18, token: "--haze" },
};

/** A soft round sprite, drawn once and stamped per particle. Cheaper than
 * building a radial gradient every frame, and it is what makes the large mist
 * particles read as haze instead of as hard discs. */
function buildSprite(colour: string): HTMLCanvasElement {
  const size = 128;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const context = sprite.getContext("2d");
  if (!context) return sprite;

  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, colour);
  gradient.addColorStop(0.45, `color-mix(in oklch, ${colour} 45%, transparent)`);
  gradient.addColorStop(1, "transparent");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return sprite;
}

/**
 * The single ambient motion pass, on a plain 2D canvas.
 *
 * A canvas rather than DOM nodes because a few dozen independently-moving
 * elements is the one thing SVG genuinely handles badly — and a canvas rather
 * than WebGL because there is nothing here that needs a GPU pipeline.
 *
 * Silent on low-tier devices and under reduced motion: this is the first
 * thing that should go when there is any doubt, and nothing depends on it.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const weather = useAppStore((s) => s.weather);
  const tier = useAppStore((s) => s.tier);
  const reducedMotion = useAppStore(selectReducedMotion);

  const count = reducedMotion ? 0 : PARTICLE_BUDGET[tier];

  useEffect(() => {
    if (count === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const behaviour = BEHAVIOUR[weather];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];

    const spawn = (initial: boolean): Particle => ({
      x: Math.random() * width,
      // Respawns start a full particle-width above the top edge — with mist's
      // very large radius, a fixed small offset would pop it into view.
      y: initial ? Math.random() * height : -behaviour.size[1],
      vx: (Math.random() - 0.5) * behaviour.drift,
      vy: behaviour.speed * (0.5 + Math.random()),
      radius:
        behaviour.size[0] + Math.random() * (behaviour.size[1] - behaviour.size[0]),
      alpha:
        behaviour.alpha[0] + Math.random() * (behaviour.alpha[1] - behaviour.alpha[0]),
    });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: count }, () => spawn(true));
    };

    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let last = performance.now();
    let running = true;
    let sprite: HTMLCanvasElement | null = null;
    let spriteColour = "";

    const render = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      context.clearRect(0, 0, width, height);

      // The palette drifts continuously, so the sprite is rebuilt whenever the
      // token actually changes — not every frame, which would mean building a
      // gradient 60 times a second for a colour that moves imperceptibly.
      const colour =
        getComputedStyle(document.documentElement).getPropertyValue(behaviour.token).trim() ||
        "white";
      if (colour !== spriteColour) {
        spriteColour = colour;
        sprite = buildSprite(colour);
      }

      for (const particle of particles) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;

        if (particle.y - particle.radius > height || particle.x < -60 || particle.x > width + 60) {
          Object.assign(particle, spawn(false));
          continue;
        }

        context.globalAlpha = particle.alpha;
        if (behaviour.streak > 0) {
          context.strokeStyle = colour;
          context.lineWidth = particle.radius;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(particle.x - particle.vx * 0.05, particle.y - behaviour.streak);
          context.stroke();
        } else if (sprite) {
          const diameter = particle.radius * 2;
          context.drawImage(
            sprite,
            particle.x - particle.radius,
            particle.y - particle.radius,
            diameter,
            diameter,
          );
        }
      }
      context.globalAlpha = 1;

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);

    // A background tab should not be animating; nobody is looking and it
    // costs the visitor's battery.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        last = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count, weather]);

  if (count === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
