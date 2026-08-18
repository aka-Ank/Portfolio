"use client";

import { useEffect, useSyncExternalStore, type RefObject } from "react";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";
import { windAt } from "./wind";

/**
 * The world's own clock.
 *
 * One monotonic time, independent of scroll, mount and React. Everything that
 * persists — the wind, every wildlife event — is a pure function of it, so the
 * world carries on whether or not anyone is looking at that part of it.
 *
 * Two different rates, on purpose:
 *
 * - **Wind** is written as a CSS variable four times a second. It only
 *   modulates the *amplitude* of sway loops that CSS is already running, so it
 *   does not need frame precision, and `@property --sway` interpolates between
 *   the steps anyway. Four writes a second against sixty is the difference
 *   between a background that costs nothing and one that shows up in a profile.
 * - **Wildlife** re-renders at 1Hz. An animal's *pose* comes from CSS
 *   transitions off its own progress; React only needs to know which events
 *   exist, and that changes on the order of minutes.
 *
 * With reduced motion the clock still runs but nothing subscribes to it — the
 * world is simply still, which is what the setting asks for.
 */

/** Seconds since the epoch, as a float. Deliberately wall-clock derived rather
 * than counted from mount: two tabs, or the same tab after a reload, see the
 * same world. */
export function worldNow(): number {
  return Date.now() / 1000;
}

const WIND_HZ = 4;
const EVENT_HZ = 1;

/** Writes `--sway` onto the stage. Nothing else reads the wind directly. */
export function useWind(ref: RefObject<HTMLElement | null>, gust: number) {
  const reducedMotion = useAppStore(selectReducedMotion);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (reducedMotion) {
      element.style.setProperty("--sway", "0");
      return;
    }

    const write = () => {
      element.style.setProperty("--sway", (windAt(worldNow()) * gust).toFixed(3));
    };

    write();
    const id = window.setInterval(write, 1000 / WIND_HZ);
    return () => window.clearInterval(id);
  }, [ref, gust, reducedMotion]);
}

/**
 * A tick that advances once a second, for the wildlife scheduler.
 *
 * `useSyncExternalStore` rather than state-in-an-effect, for the same two
 * reasons `useSky` uses it: it has a dedicated *server* snapshot, which is what
 * keeps the wall-clock-derived world from being a hydration mismatch on every
 * animal in the frame; and the interval lives at module scope, so any number of
 * subscribers cost one timer.
 *
 * The server snapshot is `0`, which every habitat reads as "before the world
 * started" and yields no events — so the server renders an empty world and the
 * client fills it in. The backdrop is `aria-hidden` decoration, so nothing a
 * visitor depends on is deferred.
 */
let ticks = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribeToWorld(onChange: () => void): () => void {
  listeners.add(onChange);
  timer ??= setInterval(() => {
    ticks += 1;
    for (const listener of listeners) listener();
  }, 1000 / EVENT_HZ);

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getTicks = () => ticks;
const getServerTicks = () => -1;

export function useWorldTick(): number {
  const reducedMotion = useAppStore(selectReducedMotion);
  const tick = useSyncExternalStore(subscribeToWorld, getTicks, getServerTicks);

  // With motion off the world holds still: no events are scheduled, so nothing
  // walks across the frame. The clock keeps running; nothing reads it.
  if (reducedMotion || tick < 0) return 0;
  return worldNow();
}
