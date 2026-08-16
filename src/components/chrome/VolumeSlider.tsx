"use client";

import { useAppStore } from "@/state/useAppStore";
import { cn } from "@/lib/utils";

/**
 * The ambient bed's level.
 *
 * A real `<input type="range">` rather than a custom-drawn control: it comes
 * with keyboard support (arrows, Home/End, Page Up/Down), the correct
 * `slider` role and value announcements, and pointer capture during a drag —
 * all of which a div-with-listeners has to reimplement and usually gets wrong.
 * The styling lives in globals.css under `.volume-slider`.
 *
 * `--volume-pct` drives the filled portion of the track, so the fill follows
 * the value without a second element to keep in sync.
 */
export function VolumeSlider({ className, id = "volume" }: { className?: string; id?: string }) {
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const percent = Math.round(volume * 100);

  return (
    <input
      id={id}
      type="range"
      min={0}
      max={100}
      step={1}
      value={percent}
      onChange={(event) => setVolume(Number(event.target.value) / 100)}
      aria-label="Ambient sound volume"
      aria-valuetext={`${percent} percent`}
      style={{ "--volume-pct": `${percent}%` } as React.CSSProperties}
      className={cn("volume-slider", className)}
    />
  );
}
