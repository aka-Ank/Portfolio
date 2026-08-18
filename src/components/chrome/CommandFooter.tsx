"use client";

import Link from "next/link";
import { Moon, Settings2, Sun, Keyboard } from "lucide-react";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";
import { about } from "@/content/about";
import { SoundControl } from "./SoundControl";
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

        {/* One control, same on every breakpoint. The level used to be a
            separate slider that only rendered on `sm:` and only while sound was
            already on, so the strip's width changed when it was toggled and a
            phone had no level control outside the settings panel. */}
        <SoundControl />

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
