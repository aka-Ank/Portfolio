"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/state/useAppStore";
import { WEATHER } from "@/systems/theme/palette";
import { resolveSky } from "@/systems/theme/sky";
import { useWorldTick, worldNow } from "@/backdrop/useWorldClock";
import { windAt } from "@/backdrop/wind";
import { wildlifeAt } from "@/backdrop/ecosystem";
import { initAudio, playOneShot, setMasterVolume, setMuted, setSoundscape } from "./audioManager";
import { bedFor, layersFor, wolfHowlAt } from "./soundscape";

/**
 * Drives the soundscape from the same world state the scene renders from.
 *
 * Nothing here decides *what* anything sounds like — `soundscape.ts` is the
 * mapping and it is pure. This is the wiring: it reads the sky, the weather and
 * the world clock, and pushes the result at the audio manager.
 *
 * Does nothing at all until the visitor turns sound on. Browsers block
 * unprompted audio anyway, and ambience should not be fetched for someone who
 * never asked for any.
 */
export function AmbienceBridge() {
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const volume = useAppStore((s) => s.volume);
  const colorMode = useAppStore((s) => s.colorMode);
  const timeMode = useAppStore((s) => s.timeMode);
  const weather = useAppStore((s) => s.weather);

  // Ticks once a second — the same clock the wildlife uses, so the owl heard is
  // the owl on screen.
  const tick = useWorldTick();

  const sky = resolveSky(colorMode, timeMode);
  const effect = WEATHER[weather];

  const bed = bedFor(sky.family, sky.t);
  // The live wind, not the weather's nominal multiplier: gusts are what make
  // the howl come and go, and this is the same number the trees sway to.
  const liveWind = windAt(worldNow()) * effect.gust;
  const layers = layersFor(weather, effect, liveWind);

  // Serialised so the effect re-runs when the *values* change, not when a fresh
  // object identity arrives every tick.
  const layerKey = JSON.stringify(layers);

  useEffect(() => {
    if (!soundEnabled) {
      setMuted(true);
      return;
    }
    initAudio();
    setMuted(false);
    setSoundscape(bed, JSON.parse(layerKey));
  }, [soundEnabled, bed, layerKey]);

  // Separate so dragging the slider re-levels without restarting a crossfade on
  // every frame of the drag.
  useEffect(() => {
    setMasterVolume(volume);
  }, [volume]);

  /**
   * One-shots.
   *
   * The owl hoot fires from the **same event the owl silhouette comes from**,
   * not a separate random timer — so the sound and the bird are the same
   * animal, and an owl that is not on screen is not heard. Tracked by the
   * event's seed, which is stable for one appearance, so it hoots once per
   * visit rather than once per tick.
   */
  const lastOwl = useRef<number | null>(null);
  const lastWolf = useRef<number | null>(null);

  useEffect(() => {
    if (!soundEnabled || tick === 0) return;

    const owl = wildlifeAt(tick, sky.sunAltitude, effect).find((e) => e.species === "owl");
    if (owl && lastOwl.current !== owl.seed) {
      lastOwl.current = owl.seed;
      playOneShot("owlHoot");
    }
    if (!owl) lastOwl.current = null;

    if (wolfHowlAt(tick, sky.sunAltitude)) {
      const slot = Math.floor(tick / 1500);
      if (lastWolf.current !== slot) {
        lastWolf.current = slot;
        playOneShot("wolfHowl");
      }
    }
  }, [soundEnabled, tick, sky.sunAltitude, effect]);

  return null;
}
