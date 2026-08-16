import { Howl, Howler } from "howler";

/** The four ambient beds. Named for the light they belong to, not for a
 * section — the bed follows the same time-of-day value the palette does. */
export type AmbienceBed = "dawn" | "day" | "sunset" | "night";

// PLACEHOLDER SOURCES: synthesized in-house — four distinct tones, so the
// crossfade below is genuinely audible and testable. Swap the files for real
// recorded ambience later; nothing in this module changes, because the paths
// are the only thing that knows what a bed sounds like.
//
// AAC rather than WAV: the same four beds were 705KB each uncompressed, 2.7MB
// for a feature nobody has switched on yet. At 64kbps they are ~42KB and the
// difference is inaudible on ambience.
const AMBIENCE_SRC: Record<AmbienceBed, string> = {
  dawn: "/audio/ambience-dawn.m4a",
  day: "/audio/ambience-day.m4a",
  sunset: "/audio/ambience-sunset.m4a",
  night: "/audio/ambience-night.m4a",
};

const SFX_SRC = {
  confirm: "/audio/confirm-placeholder.m4a",
} as const;

const CROSSFADE_MS = 2200;
const AMBIENCE_VOLUME = 0.35;

let ambienceHowls: Partial<Record<AmbienceBed, Howl>> | null = null;
let sfxHowls: Partial<Record<keyof typeof SFX_SRC, Howl>> | null = null;
let activeAnchor: AmbienceBed | null = null;
let masterVolume = 0.7;
let muted = false;

function ensureLoaded() {
  if (ambienceHowls) return;
  ambienceHowls = {};
  for (const anchor of Object.keys(AMBIENCE_SRC) as AmbienceBed[]) {
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
export function crossfadeAmbienceTo(anchor: AmbienceBed) {
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
