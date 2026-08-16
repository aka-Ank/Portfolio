"use client";

import Link from "next/link";
import { Moon, Settings2, Sun, Volume2, VolumeX, Keyboard } from "lucide-react";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";
import { about } from "@/content/about";
import { VolumeSlider } from "./VolumeSlider";
import { cn } from "@/lib/utils";

/**
 * The stable command strip. Both modes get the same controls, because every
 * one of them does something in both: the palette, the time of day and the
 * motion setting are all plain CSS variables that classic mode renders against
 * too.
 *
 * Light/dark and sound are here as one-tap toggles because they are the two a
 * visitor actually reaches for; everything finer lives one click away in the
 * settings panel, so the strip stays a strip.
 */
export function CommandFooter({ variant }: { variant: "full" | "classic" }) {
  const setChromePanel = useAppStore((s) => s.setChromePanel);
  const colorMode = useAppStore((s) => s.colorMode);
  const setColorMode = useAppStore((s) => s.setColorMode);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);
  const reducedMotion = useAppStore(selectReducedMotion);
  const isFullMode = variant === "full";

  // `auto` resolves to whichever family the clock implies, so the toggle has
  // to pick the opposite of what is *rendered*, not of what is stored.
  const rendered =
    typeof document !== "undefined" ? document.documentElement.dataset.family : undefined;
  const isDark = colorMode === "dark" || (colorMode === "auto" && rendered === "dark");

  const iconButton =
    "rounded-md p-2 transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";
  const textButton =
    "rounded-md px-2.5 py-1.5 transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";

  return (
    <footer
      aria-label="Site controls"
      className={cn(
        "z-30 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-xs text-[var(--ink-muted)]",
        isFullMode
          ? "fixed inset-x-0 bottom-0 border-t border-[var(--border-soft)] bg-[var(--surface)] px-5 py-2.5 backdrop-blur-md"
          : "mt-24 border-t border-[var(--border-soft)] px-6 py-6",
      )}
    >
      {/* Hidden on the narrowest screens: with the controls beside it the strip
          wrapped to two lines, which is the one thing a calm command strip
          must not do. */}
      <span className={isFullMode ? "hidden sm:inline" : undefined}>
        © {new Date().getFullYear()} {about.name}
      </span>

      <div className="flex flex-wrap items-center gap-0.5">
        <button
          type="button"
          onClick={() => setColorMode(isDark ? "light" : "dark")}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={iconButton}
        >
          {isDark ? (
            <Sun aria-hidden className="h-4 w-4" />
          ) : (
            <Moon aria-hidden className="h-4 w-4" />
          )}
        </button>

        {/* The level only appears once sound is actually on. A slider sitting
            next to a muted speaker is a control that does nothing, and on a
            narrow strip it is also the thing that forces a second line. */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? "Turn ambient sound off" : "Turn ambient sound on"}
            aria-pressed={soundEnabled}
            className={iconButton}
          >
            {soundEnabled ? (
              <Volume2 aria-hidden className="h-4 w-4" />
            ) : (
              <VolumeX aria-hidden className="h-4 w-4" />
            )}
          </button>

          {soundEnabled && <VolumeSlider id="footer-volume" className="hidden w-20 sm:block" />}
        </div>

        <button
          type="button"
          onClick={() => setChromePanel("controls")}
          className={cn(textButton, "flex items-center gap-2")}
        >
          <Settings2 aria-hidden className="h-4 w-4" />
          Settings
          {reducedMotion && <span className="text-[var(--ink-muted)]">· still</span>}
        </button>

        <Link href={isFullMode ? "/classic" : "/"} prefetch={false} className={textButton}>
          {isFullMode ? "Classic mode" : "Full mode"}
        </Link>

        <button
          type="button"
          onClick={() => setChromePanel("help")}
          aria-label="Keyboard shortcuts"
          className={iconButton}
        >
          <Keyboard aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
}
