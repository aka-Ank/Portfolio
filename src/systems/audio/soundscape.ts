import type { Weather } from "@/state/uiSlice";
import type { WeatherEffect } from "@/systems/theme/palette";
import { mulberry32 } from "@/backdrop/rand";
import type { Bed, Layer } from "./audioManager";

/**
 * Weather and sky → which layers play, and how loudly.
 *
 * Pure, so the whole mapping can be asserted in a test rather than listened to.
 * This is the audio twin of `deriveScene`: it reads the same scalars the
 * visuals read, which is what stops the soundscape contradicting the picture.
 */

/** Which bed the time of day calls for. */
export function bedFor(family: "light" | "dark", t: number): Bed {
  if (family === "dark") return t < 0.12 || t > 0.88 ? "sunset" : "night";
  return t < 0.25 ? "dawn" : t > 0.82 ? "sunset" : "day";
}

/**
 * Which weather layers, at what gain.
 *
 * Three things this gets right that a flat weather→file table cannot:
 *
 * - **Rain and wind play together.** Wind is derived from `gust`, which every
 *   weather has, so rain (gust 1.35) keeps a wind bed underneath it at reduced
 *   gain rather than being silenced by the rain.
 * - **Wind escalates.** `soft wind` is the base; `wind_howl` fades in on top
 *   only as the *live* wind rises, and the two play together rather than one
 *   replacing the other. The live value comes from `windAt() * gust`, which is
 *   the same number the trees are swaying to.
 * - **Mist and cloud get no layer at all.** Neither has a dedicated recording,
 *   and neither should: fog is defined by what you *stop* hearing. They express
 *   themselves by ducking the bed, which `DUCK_UNDER` does for the layers and
 *   `quiet` does here.
 */
export function layersFor(
  weather: Weather,
  effect: WeatherEffect,
  liveWind: number,
): Partial<Record<Layer, number>> {
  const out: Partial<Record<Layer, number>> = {};

  if (effect.drops > 0) out.rain = 1;
  if (effect.flakes > 0) out.snow = 1;

  // Wind is a property of every weather, not a weather of its own. Below 1.2 it
  // is a still day and gets nothing.
  const gust = effect.gust;
  if (gust >= 1.2) {
    // Reduced under precipitation: you can hear wind in rain, but not as the
    // main event.
    const under = effect.drops > 0 || effect.flakes > 0 ? 0.45 : 1;
    out.wind = Math.min((gust - 1.2) / 0.8, 1) * under;
  }

  // The howl needs genuinely strong wind — the live value, which gusts, not the
  // weather's nominal multiplier. It rides on top of `soft wind`.
  if (liveWind >= 2) out.windHowl = Math.min((liveWind - 2) / 1.2, 1);

  // Snow is nearly silent and mist is defined by absence; neither should let a
  // wind layer sit over it at full strength.
  if (weather === "misty" || weather === "snowy") {
    if (out.wind) out.wind *= 0.4;
    delete out.windHowl;
  }

  return out;
}

/**
 * A deterministic schedule for the wolf howl.
 *
 * The same trick the ecosystem uses — a seeded roll per time slot — so it needs
 * no timer, no state, and gives the same answer in any tab.
 *
 * **Rarity, chosen deliberately.** The existing conventions are owl 260s and
 * fox 320s, and a wolf should be rarer than either: it is the single most
 * attention-taking sound in the set, and one heard twice in a visit stops being
 * atmosphere. 1,500 seconds with a 30% roll works out to roughly one howl every
 * 80 minutes of night — most visitors will never hear it, which is the point.
 */
const WOLF_INTERVAL = 1500;
const WOLF_CHANCE = 0.3;

export function wolfHowlAt(worldTime: number, sunAltitude: number): boolean {
  // Deep night only. Not merely "dark" — a wolf at civil twilight is a dog.
  if (sunAltitude > -12) return false;
  const slot = Math.floor(worldTime / WOLF_INTERVAL);
  const random = mulberry32((slot * 2654435761) >>> 0);
  if (random() > WOLF_CHANCE) return false;
  // One moment inside the slot, not the whole slot.
  const at = random() * WOLF_INTERVAL;
  const into = worldTime - slot * WOLF_INTERVAL;
  return into >= at && into < at + 2;
}
