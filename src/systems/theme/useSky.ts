"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useAppStore } from "@/state/useAppStore";
import { TIME_ANCHOR_HOUR } from "@/state/uiSlice";
import { resolveSky, skyAt, type SkyState } from "./sky";

/**
 * The current sky, for components that *render* from it.
 *
 * Two problems this solves that a bare `resolveSky()` call in a component does
 * not:
 *
 * 1. **The clock advances.** The scene's discrete contents — which animals are
 *    out, whether stars are up — were previously computed once per store change
 *    and then never again, so a page left open through sunset kept its
 *    songbirds until the visitor happened to touch a setting. The interval here
 *    re-renders every minute, which is far finer than anything in the sky can
 *    visibly change.
 *
 * 2. **Server and client do not share a clock.** These components are
 *    server-rendered, and the server's timezone is not the visitor's, so
 *    branching on the real time during the first render is a hydration mismatch
 *    waiting to happen — one that would surface as React discarding and
 *    re-rendering the whole backdrop. Both sides therefore render the same
 *    neutral afternoon sky, and the real one arrives on mount. The backdrop is
 *    `aria-hidden` decoration, so nothing a visitor depends on is deferred.
 *
 * `ThemeDriver` deliberately does **not** use this hook: it reads the sky
 * inside an effect, where there is no server render to match and where seeing
 * the neutral sky first would make every night-time visitor watch a light-to-
 * dark crossfade on load.
 */
/**
 * A single minute-ticker shared by every consumer of this hook, exposed as an
 * external store.
 *
 * `useSyncExternalStore` rather than `useState` plus an effect for two concrete
 * reasons: it has a dedicated *server* snapshot, which is exactly the
 * server/client clock split described above and gets it right during hydration
 * rather than one render later; and the interval lives at module scope, so four
 * components subscribing costs one timer rather than four.
 */
let tickCount = 0;
let interval: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribeToMinute(onChange: () => void): () => void {
  listeners.add(onChange);
  interval ??= setInterval(() => {
    tickCount += 1;
    for (const listener of listeners) listener();
  }, 60_000);

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  };
}

const getMinute = () => tickCount;
/** Distinct from any client value, so "have we hydrated yet" needs no flag. */
const getServerMinute = () => -1;

export function useSky(): SkyState {
  const colorMode = useAppStore((s) => s.colorMode);
  const timeMode = useAppStore((s) => s.timeMode);
  const tick = useSyncExternalStore(subscribeToMinute, getMinute, getServerMinute);

  return useMemo(
    () =>
      tick === -1
        ? // A fixed date, not just a fixed hour: the lunar phase is computed
          // from the calendar, and letting that differ between the two renders
          // would put a different crescent in the server's markup than in the
          // client's — a mismatch on an attribute of an invisible element,
          // which is the most annoying kind to track down.
          skyAt(TIME_ANCHOR_HOUR.afternoon, new Date(0))
        : resolveSky(colorMode, timeMode),
    [tick, colorMode, timeMode],
  );
}
