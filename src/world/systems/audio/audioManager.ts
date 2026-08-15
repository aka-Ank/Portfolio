import { Howl, Howler } from "howler";
import type { TimeOfDayAnchor } from "@/types/world";

// PLACEHOLDER SOURCES: synthesized in-house (see docs/05-asset-list.md and
// ENGINEER_NOTES.md) — four distinct tones so the crossfade below is
// genuinely audible/testable. Swap for real per-scene ambience later; the
// crossfade mechanics don't change.
const AMBIENCE_SRC: Record<TimeOfDayAnchor, string> = {
  dawn: "/audio/ambience-dawn.wav",
  day: "/audio/ambience-day.wav",
  sunset: "/audio/ambience-sunset.wav",
  night: "/audio/ambience-night.wav",
};

const SFX_SRC = {
  confirm: "/audio/confirm-placeholder.wav",
} as const;

const CROSSFADE_MS = 2200;
const AMBIENCE_VOLUME = 0.35;

let ambienceHowls: Partial<Record<TimeOfDayAnchor, Howl>> | null = null;
let sfxHowls: Partial<Record<keyof typeof SFX_SRC, Howl>> | null = null;
let activeAnchor: TimeOfDayAnchor | null = null;
let masterVolume = 0.7;
let muted = false;

function ensureLoaded() {
  if (ambienceHowls) return;
  ambienceHowls = {};
  for (const anchor of Object.keys(AMBIENCE_SRC) as TimeOfDayAnchor[]) {
    ambienceHowls[anchor] = new Howl({
      src: [AMBIENCE_SRC[anchor]],
      loop: true,
      volume: 0,
      html5: false,
      onloaderror: (_id, err) =>
        console.warn(`[audio] failed to load ambience "${anchor}":`, err),
    });
  }
  sfxHowls = {
    confirm: new Howl({
      src: [SFX_SRC.confirm],
      volume: 0.6,
      onloaderror: (_id, err) => console.warn("[audio] failed to load SFX:", err),
    }),
  };
}

/** Call once, on the visitor's first interaction (see docs/06 "Reduced motion"
 * and the "audio autoplay" note from Phase 1 flags — sound is opt-in, never
 * autoplayed, since browsers block it anyway and it fits the calm tone). */
export function initAudio() {
  ensureLoaded();
  Howler.volume(muted ? 0 : masterVolume);
}

/** Crossfades the ambient bed to the given time-of-day anchor's layer. */
export function crossfadeAmbienceTo(anchor: TimeOfDayAnchor) {
  ensureLoaded();
  if (activeAnchor === anchor) return;
  const previous = activeAnchor ? ambienceHowls?.[activeAnchor] : null;
  const next = ambienceHowls?.[anchor];
  activeAnchor = anchor;

  if (next && !next.playing()) next.play();
  next?.fade(next.volume(), AMBIENCE_VOLUME, CROSSFADE_MS);

  if (previous && previous !== next) {
    previous.fade(previous.volume(), 0, CROSSFADE_MS);
    window.setTimeout(() => previous.stop(), CROSSFADE_MS + 50);
  }
}

export function playSfx(id: keyof typeof SFX_SRC) {
  ensureLoaded();
  sfxHowls?.[id]?.play();
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
