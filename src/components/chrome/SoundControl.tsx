"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { useAppStore } from "@/state/useAppStore";
import { VolumeSlider } from "./VolumeSlider";

/**
 * The ambient sound control: one round button that shows the current state and
 * opens the level.
 *
 * It replaced a bare mute toggle sitting next to a slider that was
 * `hidden sm:block` and only rendered while sound was already on — which meant
 * that on a phone there was no way to set the level at all without opening the
 * settings panel, and on desktop the strip's width changed whenever sound was
 * toggled.
 *
 * Three things this has to do, and each is a deliberate piece:
 *
 * - **Show the level without being opened.** The ring around the button is a
 *   conic gradient driven by the volume, so the control reads at a glance
 *   rather than only after a click. The icon carries the same information in a
 *   second channel (muted / low / high), because a ring is a colour-and-shape
 *   signal and some visitors will not resolve it.
 * - **Mute in one action.** Opening a popover to reach the mute button would
 *   make the most common action the slowest, so the button toggles sound
 *   directly and the popover is reached by the caret beside it.
 * - **Stay reachable by keyboard.** The popover closes on Escape and returns
 *   focus to the control that opened it, and closes on outside pointer input.
 *
 * Weather is *not* here. It briefly lived in this popover while it was
 * audio-only; now that it changes the scene as well it belongs in Settings with
 * the other world controls, and having it in two places would be worse than
 * either.
 */

export function SoundControl() {
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);
  const volume = useAppStore((s) => s.volume);

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Stop here rather than letting it bubble: the page's global shortcut
      // handler also listens for Escape, and closing this popover should not
      // also dismiss whatever else is open behind it.
      event.stopPropagation();
      setOpen(false);
      toggleRef.current?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const percent = Math.round(volume * 100);
  const level = soundEnabled ? percent : 0;
  const Icon = !soundEnabled ? VolumeX : percent < 50 ? Volume1 : Volume2;

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setSoundEnabled(!soundEnabled)}
        aria-pressed={soundEnabled}
        aria-label={
          soundEnabled
            ? `Turn ambient sound off. Volume ${percent} percent.`
            : "Turn ambient sound on"
        }
        className="relative grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        {/* The level ring. A conic gradient masked to a 2px annulus, so it is
            one element and no SVG — and it animates on the compositor because
            only the gradient stop moves. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full transition-[background] duration-300 motion-reduce:transition-none"
          style={{
            background: `conic-gradient(var(--accent-ink) ${level}%, color-mix(in oklch, var(--ink-muted) 22%, transparent) ${level}% 100%)`,
            mask: "radial-gradient(circle, transparent 0 12px, black 12px)",
            WebkitMask: "radial-gradient(circle, transparent 0 12px, black 12px)",
            opacity: soundEnabled ? 1 : 0.45,
          }}
        />
        <Icon
          aria-hidden
          className={
            soundEnabled ? "h-4 w-4 text-[var(--ink)]" : "h-4 w-4 text-[var(--ink-muted)]"
          }
        />
      </button>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Sound settings"
        // 24×32, not the caret's own 10×6. Padding alone made this an 18×22
        // target — inside WCAG 2.5.8 only by the spacing exception, and still
        // the smallest thing on the page to hit on a phone. The caret does not
        // move; the box around it grew.
        className="grid h-8 w-6 place-items-center rounded-md text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        <svg aria-hidden viewBox="0 0 10 6" className="h-[6px] w-[10px] fill-current">
          <path d="M0 4.6 1.4 6 5 2.4 8.6 6 10 4.6 5 0Z" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label="Ambient sound"
          className="absolute bottom-full right-0 mb-3 w-56 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-solid)] p-4 shadow-xl"
        >
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
              Ambient
            </span>
            <span className="font-mono text-[11px] text-[var(--ink)]">
              {soundEnabled ? `${percent}%` : "Off"}
            </span>
          </div>

          <VolumeSlider id={`${panelId}-volume`} className="mt-3 w-full" />

          <p className="mt-3 text-[11px] leading-snug text-[var(--ink-muted)]">
            {soundEnabled
              ? "The bed follows the time of day; weather adds a layer over it."
              : "Nothing is downloaded until you turn sound on."}
          </p>
        </div>
      )}
    </div>
  );
}
