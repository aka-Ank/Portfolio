import { Howl, Howler } from "howler";

/**
 * The soundscape: one time-of-day bed, any number of weather layers over it,
 * and occasional one-shots.
 *
 * This replaced a bed-plus-*one*-overlay model, which could not express the
 * thing the world actually does — rain and wind at the same time. Layers now
 * carry independent gains, so wind is *quieter* under rain rather than silenced
 * by it.
 *
 * ## Interruptibility
 *
 * Every fade starts from `howl.volume()` — the layer's **current** gain, not its
 * nominal one. Change the weather twice in two seconds and the second crossfade
 * picks up wherever the first had got to, instead of queueing behind it or
 * snapping to full first. That is the whole reason there is no fade queue here.
 *
 * ## Failure
 *
 * A missing or unplayable file is warned about **by name and path**, once, and
 * then that layer is silent. It never takes the bed down with it and never
 * throws: sound is opt-in decoration, and a portfolio that breaks because an
 * ambience file 404'd would be a bad trade.
 */

/* -------------------------------------------------------------------------- */
/* Sources                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Real filenames, URL-encoded.
 *
 * Two of these are worth knowing about. `night .m4a` has a **space before the
 * extension** — that is the actual name of the original on disk, it is carried
 * through rather than tidied away in case the file is referenced elsewhere, and
 * it works because the path is encoded to `night%20.m4a`. And
 * `dany_photo-forestbirds-2-367580` is the full name; it is long, not truncated.
 *
 * `.m4a` rather than the `.mp3` these arrive as: `scripts/encode-audio.mjs`
 * derives `public/audio/` from the untouched originals in `tracks/` at AAC-LC
 * 64 kbps, which is 21.1MB → 6.7MB for material that plays under a page at a
 * third of full gain. Basenames are preserved exactly, so the mapping below is
 * still the source names.
 */
const encode = (name: string) => `/audio/${encodeURIComponent(name)}`;

/** The time-of-day bed. One always plays while sound is on. */
export type Bed = "dawn" | "day" | "sunset" | "night";

const BED_SRC: Record<Bed, string> = {
  // Dawn chorus. No dedicated dawn file exists, and forest birds are closer to
  // a dawn chorus than the birds-and-crickets mix, which has night insects in
  // it.
  dawn: encode("dany_photo-forestbirds-2-367580.m4a"),
  day: encode("birds and cricket.m4a"),
  // Shares the dawn file deliberately: birds returning at dusk sound far more
  // like the forest-birds recording than like a daytime cricket bed.
  sunset: encode("dany_photo-forestbirds-2-367580.m4a"),
  night: encode("night .m4a"),
};

/**
 * Weather layers, over the bed. Several may play at once.
 *
 * `windHowl` is the escalation of `wind`, not a replacement for it: the two
 * play together, with the howl fading in only as the live wind gets strong.
 */
export type Layer = "rain" | "wind" | "windHowl" | "snow";

const LAYER_SRC: Record<Layer, string> = {
  rain: encode("rain.m4a"),
  wind: encode("soft wind.m4a"),
  windHowl: encode("wind_howl.m4a"),
  snow: encode("snow.m4a"),
};

/** Rare, non-looping, night only. */
export type OneShot = "owlHoot" | "wolfHowl";

const ONESHOT_SRC: Record<OneShot, string> = {
  owlHoot: encode("owl hoot.m4a"),
  wolfHowl: encode("wolf_howl.m4a"),
};

/*
 * Deliberately unused: `distant thunder with rain`.
 *
 * There is only one rain state in the weather model, so there is no heavier
 * variant for it to belong to. Using it for ordinary rain would put thunder
 * under a light shower, which is exactly the kind of wrong mapping worth
 * leaving a file on the shelf to avoid. It becomes correct the moment a
 * `storm` weather exists.
 */

/* -------------------------------------------------------------------------- */
/* Levels                                                                      */
/* -------------------------------------------------------------------------- */

const CROSSFADE_MS = 2800;
/** One-shots are short; the duck has to move faster than a weather change. */
const DUCK_MS = 600;

const BED_VOLUME = 0.4;
const LAYER_VOLUME: Record<Layer, number> = {
  rain: 0.36,
  wind: 0.3,
  windHowl: 0.26,
  snow: 0.24,
};
const ONESHOT_VOLUME: Record<OneShot, number> = { owlHoot: 0.5, wolfHowl: 0.42 };

/**
 * How far the bed drops under each layer.
 *
 * Not one number. Rain replaces most of what a forest was doing; snow *absorbs*
 * sound, so its layer is quiet but the bed under it goes quietest of all; wind
 * sits alongside the forest rather than over it. A single ducking value made
 * light wind sound like a downpour.
 */
const DUCK_UNDER: Record<Layer, number> = {
  rain: 0.68,
  snow: 0.74,
  wind: 0.32,
  windHowl: 0.42,
};

/* -------------------------------------------------------------------------- */
/* State                                                                       */
/* -------------------------------------------------------------------------- */

const beds: Partial<Record<Bed, Howl>> = {};
const layers: Partial<Record<Layer, Howl>> = {};
const shots: Partial<Record<OneShot, Howl>> = {};
let activeBed: Bed | null = null;
let activeLayers: Partial<Record<Layer, number>> = {};
/** Extra ducking from a playing one-shot, released when it ends. */
let shotDuck = 0;
let masterVolume = 0.7;
let muted = false;
let ready = false;

function warnOnce(kind: string, name: string, src: string) {
  console.warn(
    `[audio] ${kind} "${name}" could not be loaded from ${src}. ` +
      `That layer will be silent; everything else continues.`,
  );
}

/**
 * Howls are created on **first use**, never up front.
 *
 * These files total about 6.7MB. Constructing them all when sound is switched
 * on would fetch every weather a visitor is not in, so a clear day pulls the day
 * bed and nothing else. The `in` check rather than a truthiness test is what
 * makes a failed load stay cached as a failure instead of being retried on
 * every weather change.
 */
function bedHowl(bed: Bed): Howl | undefined {
  if (!(bed in beds)) {
    beds[bed] = new Howl({
      src: [BED_SRC[bed]],
      loop: true,
      volume: 0,
      html5: false,
      onloaderror: () => warnOnce("bed", bed, BED_SRC[bed]),
    });
  }
  return beds[bed];
}

function layerHowl(layer: Layer): Howl | undefined {
  if (!(layer in layers)) {
    layers[layer] = new Howl({
      src: [LAYER_SRC[layer]],
      loop: true,
      volume: 0,
      html5: false,
      onloaderror: () => warnOnce("weather layer", layer, LAYER_SRC[layer]),
    });
  }
  return layers[layer];
}

export function initAudio() {
  ready = true;
  Howler.volume(muted ? 0 : masterVolume);
}

/** Fade a howl to a target, starting from wherever it currently is. */
function fadeTo(howl: Howl | undefined, target: number, ms: number) {
  if (!howl) return;
  const current = howl.volume();
  if (target > 0 && !howl.playing()) howl.play();
  if (Math.abs(current - target) < 0.005) return;
  howl.fade(current, target, ms);
  if (target === 0) {
    // Stop only after the fade has actually finished, and only if nothing has
    // turned it back up in the meantime — otherwise a rapid weather flip-flop
    // stops a layer that is on its way back in.
    window.setTimeout(() => {
      if (howl.volume() < 0.01) howl.stop();
    }, ms + 60);
  }
}

/** What the bed should sit at, given every layer currently up. */
function bedTarget(): number {
  let duck = shotDuck;
  for (const [layer, gain] of Object.entries(activeLayers) as [Layer, number][]) {
    if (gain > 0) duck = Math.max(duck, DUCK_UNDER[layer] * gain);
  }
  return BED_VOLUME * (1 - duck);
}

/**
 * Set the whole soundscape at once.
 *
 * Bed and layers move together because the bed's level *depends* on the layers:
 * setting them separately leaves a window where the bed is at full volume under
 * rain. The two still crossfade independently in time — a bed change at dusk
 * and a weather change a minute later are separate fades, they just go through
 * one function.
 *
 * `gains` are 0–1 multipliers on each layer's nominal level, which is what lets
 * wind be *quieter* under rain rather than absent.
 */
export function setSoundscape(bed: Bed, gains: Partial<Record<Layer, number>>) {
  if (!ready) return;

  activeLayers = gains;

  if (activeBed !== bed) {
    const previous = activeBed ? beds[activeBed] : undefined;
    activeBed = bed;
    fadeTo(bedHowl(bed), bedTarget(), CROSSFADE_MS);
    if (previous && previous !== beds[bed]) fadeTo(previous, 0, CROSSFADE_MS);
  } else {
    fadeTo(beds[bed], bedTarget(), CROSSFADE_MS);
  }

  for (const layer of Object.keys(LAYER_SRC) as Layer[]) {
    const gain = gains[layer] ?? 0;
    if (gain <= 0) {
      // Only touch a layer that was actually started; asking for a howl here
      // would fetch a file for weather the visitor is not in.
      if (layer in layers) fadeTo(layers[layer], 0, CROSSFADE_MS);
      continue;
    }
    fadeTo(layerHowl(layer), LAYER_VOLUME[layer] * gain, CROSSFADE_MS);
  }
}

/**
 * A one-shot, ducking the bed while it plays.
 *
 * Ducking rather than layering at full volume: an owl over a night bed at equal
 * level is two recordings, not an owl in a wood. The duck is released on `end`
 * — and also on `loaderror`, so a missing file cannot leave the bed permanently
 * quiet.
 */
export function playOneShot(id: OneShot) {
  if (!ready) return;
  if (!(id in shots)) {
    shots[id] = new Howl({
      src: [ONESHOT_SRC[id]],
      loop: false,
      volume: ONESHOT_VOLUME[id],
      html5: false,
      onloaderror: () => {
        warnOnce("one-shot", id, ONESHOT_SRC[id]);
        shotDuck = 0;
        if (activeBed) fadeTo(beds[activeBed], bedTarget(), DUCK_MS);
      },
      onend: () => {
        shotDuck = 0;
        if (activeBed) fadeTo(beds[activeBed], bedTarget(), CROSSFADE_MS);
      },
    });
  }
  const howl = shots[id];
  if (!howl || howl.playing()) return;

  shotDuck = 0.35;
  if (activeBed) fadeTo(beds[activeBed], bedTarget(), DUCK_MS);
  howl.play();
}

export function setMuted(value: boolean) {
  muted = value;
  Howler.volume(muted ? 0 : masterVolume);
}

export function setMasterVolume(value: number) {
  masterVolume = Math.min(1, Math.max(0, value));
  if (!muted) Howler.volume(masterVolume);
}

export function isMuted() {
  return muted;
}

/** Test seam: the mapping tables, so a test can assert every referenced file
 * exists on disk without reaching into Howler. */
export const AUDIO_SOURCES = { BED_SRC, LAYER_SRC, ONESHOT_SRC };
