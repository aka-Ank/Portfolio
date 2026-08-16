"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";
import {
  atmosphereAt,
  formatOklch,
  resolveTheme,
  SURFACES,
  VEIL_STRENGTH,
  type Atmosphere,
  type SurfaceFamily,
} from "./palette";

/** Seconds⁻¹. Chosen so a change of setting settles in a little over a second
 * — slow enough to read as a light change, fast enough that it has finished
 * before the visitor looks back. */
const DAMPING = 3.2;

function writeAtmosphere(root: HTMLElement, atmosphere: Atmosphere) {
  root.style.setProperty("--sky-top", formatOklch(atmosphere.skyTop));
  root.style.setProperty("--sky-mid", formatOklch(atmosphere.skyMid));
  root.style.setProperty("--sky-horizon", formatOklch(atmosphere.skyHorizon));
  root.style.setProperty("--glow", formatOklch(atmosphere.glow));
  root.style.setProperty("--aether", formatOklch(atmosphere.aether));
}

function writeSurfaces(root: HTMLElement, family: SurfaceFamily) {
  const surface = SURFACES[family];
  root.dataset.family = family;
  root.style.setProperty("--surface", surface.surface);
  root.style.setProperty("--surface-solid", surface.surfaceSolid);
  root.style.setProperty("--surface-raised", surface.surfaceRaised);
  root.style.setProperty("--border-soft", surface.border);
  root.style.setProperty("--ink", surface.ink);
  root.style.setProperty("--ink-muted", surface.inkMuted);
  root.style.setProperty("--accent-ink", surface.accentInk);
  root.style.setProperty("--focus-ring", surface.focusRing);
  root.style.colorScheme = family;
}

function startViewTransition(apply: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };
  if (typeof doc.startViewTransition === "function") doc.startViewTransition(apply);
  else apply();
}

/**
 * Owns every theme CSS variable on `<html>`. Mounted once, renders nothing.
 *
 * Two different mechanisms, on purpose. The decorative tokens are damped
 * continuously in OKLCH, because a gradual light change is the whole point.
 * The surface/ink pair is switched **atomically inside a view transition**,
 * because interpolating it would pass through a mid-grey-on-mid-grey state
 * that fails WCAG for the length of the animation. A view transition
 * crossfades two states that each pass, so no frame is ever unreadable — and
 * it still reads as a soft dissolve rather than a swap.
 */
export function ThemeDriver() {
  const colorMode = useAppStore((s) => s.colorMode);
  const timeMode = useAppStore((s) => s.timeMode);
  const ambience = useAppStore((s) => s.ambience);
  const reducedMotion = useAppStore(selectReducedMotion);

  // Only `sync` and `auto` depend on wall-clock time; everything else is
  // event-driven. A minute is far finer than the palette can visibly change.
  const [clockTick, setClockTick] = useState(0);
  const clockDriven = timeMode === "sync" || colorMode === "auto";
  useEffect(() => {
    if (!clockDriven) return;
    const id = window.setInterval(() => setClockTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, [clockDriven]);

  const currentT = useRef<number | null>(null);
  const currentFamily = useRef<SurfaceFamily | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--veil-strength", String(VEIL_STRENGTH[ambience]));
    root.dataset.ambience = ambience;
  }, [ambience]);

  useEffect(() => {
    const root = document.documentElement;
    const target = resolveTheme(colorMode, timeMode);

    if (currentFamily.current !== target.family) {
      const isFirstPaint = currentFamily.current === null;
      const apply = () => {
        writeSurfaces(root, target.family);
        // The ring position is family-relative, so a family change is also a
        // jump in `t`. Landing it under the same crossfade avoids a visible
        // sweep through the new family's whole palette immediately after.
        currentT.current = target.t;
        writeAtmosphere(root, atmosphereAt(target.family, target.t));
      };

      currentFamily.current = target.family;
      if (isFirstPaint || reducedMotion) apply();
      else startViewTransition(apply);
      return;
    }

    if (currentT.current === null || reducedMotion) {
      currentT.current = target.t;
      writeAtmosphere(root, atmosphereAt(target.family, target.t));
      return;
    }

    let frame = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const from = currentT.current ?? target.t;
      const next = from + (target.t - from) * (1 - Math.exp(-DAMPING * dt));
      currentT.current = next;
      writeAtmosphere(root, atmosphereAt(target.family, next));

      if (Math.abs(target.t - next) > 0.0005) {
        frame = requestAnimationFrame(step);
      } else {
        currentT.current = target.t;
        writeAtmosphere(root, atmosphereAt(target.family, target.t));
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [colorMode, timeMode, reducedMotion, clockTick]);

  return null;
}
