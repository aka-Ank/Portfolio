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

/** Per-weather behaviour. Deliberately three small variations on one system
 * rather than three effects: the world should read as the same place in
 * different conditions. */
const BEHAVIOUR: Record<Weather, { speed: number; drift: number; size: [number, number]; streak: number }> = {
  clear: { speed: 6, drift: 9, size: [0.8, 2.2], streak: 0 },
  mist: { speed: 3, drift: 16, size: [14, 40], streak: 0 },
  rain: { speed: 320, drift: 26, size: [0.7, 1.4], streak: 16 },
};

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
      y: initial ? Math.random() * height : -20,
      vx: (Math.random() - 0.5) * behaviour.drift,
      vy: behaviour.speed * (0.5 + Math.random()),
      radius:
        behaviour.size[0] + Math.random() * (behaviour.size[1] - behaviour.size[0]),
      alpha: 0.12 + Math.random() * 0.3,
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

    const render = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      context.clearRect(0, 0, width, height);
      // The particles borrow the Aether accent so ambience and motif stay one
      // system — never a separate decorative colour.
      const style = getComputedStyle(document.documentElement);
      const colour = style.getPropertyValue("--aether").trim() || "white";

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
        } else {
          context.fillStyle = colour;
          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.fill();
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
