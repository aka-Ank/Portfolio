"use client";

import { useState } from "react";
import { setMasterVolume } from "@/world/systems/audio/audioManager";

/** Real, always-visible mute + volume control — docs/08-roadmap.md Phase 4
 * "safe mute + volume control" (the system itself was wired in Phase 2). */
export function AudioControls({
  muted,
  onToggleMute,
}: {
  muted: boolean;
  onToggleMute: () => void;
}) {
  const [volume, setVolume] = useState(0.7);

  return (
    <div className="pointer-events-auto flex items-center gap-2">
      <button
        onClick={onToggleMute}
        aria-pressed={muted}
        aria-label={muted ? "Unmute ambient sound" : "Mute ambient sound"}
        className="rounded px-2 py-1 outline-offset-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
      >
        {muted ? "🔇" : "🔊"}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        disabled={muted}
        onChange={(e) => {
          const next = Number(e.target.value);
          setVolume(next);
          setMasterVolume(next);
        }}
        aria-label="Ambient sound volume"
        className="w-20 accent-[var(--accent)] disabled:opacity-40"
      />
    </div>
  );
}
