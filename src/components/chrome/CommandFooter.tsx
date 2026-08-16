"use client";

import Link from "next/link";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";
import { about } from "@/content/about";
import { cn } from "@/lib/utils";

/**
 * The stable command strip. Both modes get the same controls, because after
 * the 2D rebuild every one of them does something in both: the palette, the
 * time of day, the weather and the motion setting are all plain CSS variables
 * that classic mode renders against too. Only ambient sound is immersive-only,
 * and that is a property of the control panel rather than of this strip.
 */
export function CommandFooter({ variant }: { variant: "immersive" | "classic" }) {
  const setChromePanel = useAppStore((s) => s.setChromePanel);
  const weather = useAppStore((s) => s.weather);
  const colorMode = useAppStore((s) => s.colorMode);
  const reducedMotion = useAppStore(selectReducedMotion);
  const isImmersive = variant === "immersive";

  return (
    <footer
      aria-label="Site controls"
      className={cn(
        "z-30 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-xs text-[var(--ink-muted)]",
        isImmersive
          ? "fixed inset-x-0 bottom-0 border-t border-[var(--border-soft)] bg-[var(--surface)] px-5 py-3 backdrop-blur-md"
          : "mt-24 border-t border-[var(--border-soft)] px-6 py-6",
      )}
    >
      {/* Hidden on the narrowest screens: with the controls beside it the strip
          wrapped to two lines, which is the one thing a "calm command strip"
          must not do. */}
      <span className={isImmersive ? "hidden sm:inline" : undefined}>
        © {new Date().getFullYear()} {about.name}
      </span>

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => setChromePanel("controls")}
          className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Atmosphere
          {/* A short state summary so the panel does not have to be opened
              just to see what is currently set. */}
          <span className="ml-2 text-[var(--ink-muted)]/70">
            {colorMode} · {weather}
            {reducedMotion ? " · still" : ""}
          </span>
        </button>

        <Link
          href={isImmersive ? "/classic" : "/"}
          prefetch={false}
          className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          {isImmersive ? "Classic mode" : "Immersive mode"}
        </Link>

        <button
          type="button"
          onClick={() => setChromePanel("help")}
          className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Shortcuts
        </button>
      </div>
    </footer>
  );
}
