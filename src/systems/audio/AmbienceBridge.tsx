"use client";

import { useEffect } from "react";
import { useAppStore } from "@/state/useAppStore";
import { resolveTheme } from "@/systems/theme/palette";
import { crossfadeAmbienceTo, initAudio, setMuted, type AmbienceBed } from "./audioManager";

/** Four beds across the ring — the ambience follows the same time value the
 * palette does, so what the visitor hears and what they see never disagree. */
function bedFor(family: "light" | "dark", t: number): AmbienceBed {
  if (family === "light") return t < 0.5 ? "dawn" : "day";
  return t < 0.5 ? "sunset" : "night";
}

/**
 * Drives the ambient bed off the same resolved theme the atmosphere uses.
 * Does nothing at all until the visitor turns sound on: browsers block
 * unprompted audio, and a portfolio that makes noise before being asked is
 * the opposite of the calm this site is going for.
 */
export function AmbienceBridge() {
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const colorMode = useAppStore((s) => s.colorMode);
  const timeMode = useAppStore((s) => s.timeMode);

  const { family, t } = resolveTheme(colorMode, timeMode);
  const bed = bedFor(family, t);

  useEffect(() => {
    if (!soundEnabled) {
      setMuted(true);
      return;
    }
    initAudio();
    setMuted(false);
    crossfadeAmbienceTo(bed);
  }, [soundEnabled, bed]);

  return null;
}
