"use client";

import Link from "next/link";
import { useWorldStore } from "@/world/state/useWorldStore";
import { about } from "@/content/about";
import { TimeOfDayToggle } from "./TimeOfDayToggle";
import { ReducedMotionToggle } from "./ReducedMotionToggle";
import { AudioControls } from "./AudioControls";

interface CommandFooterProps {
  /** Immersive gets the atmosphere/audio/motion controls; classic doesn't —
   * see the note on `showWorldControls` below. */
  variant: "immersive" | "classic";
  audio?: { enabled: boolean; muted: boolean; onToggleMute: () => void };
}

/**
 * The persistent command strip — docs' Phase 7 addendum: brand left,
 * controls centre, help right; "a calm command strip, not a noisy settings
 * bar." Present in both modes so the experience switch is never buried.
 *
 * **Why classic shows fewer controls.** The addendum lists theme, audio and
 * motion toggles for both modes, but in classic all three would be dead
 * buttons: there is no atmosphere to shift (no 3D world), no ambience
 * playing (AmbientAudioBridge is immersive-only), and no client-side motion
 * to reduce (nothing in components/classic/ imports motion/react). Shipping
 * a mute button that mutes nothing fails the project's own bar that every
 * component must justify its existence, so classic gets the two controls
 * that do something — the experience switch and the brand — rather than a
 * fuller-looking strip of no-ops.
 */
export function CommandFooter({ variant, audio }: CommandFooterProps) {
  const setChromePanel = useWorldStore((s) => s.setChromePanel);
  const phase = useWorldStore((s) => s.phase);
  const isImmersive = variant === "immersive";

  // Hidden behind the Preloader, and inert with it so a keyboard visitor
  // can't tab into controls they can't see (same fix as the top bar).
  const hiddenBehindPreloader = isImmersive && phase === "preloading";

  return (
    <footer
      inert={hiddenBehindPreloader}
      aria-label="Site controls"
      className={
        isImmersive
          ? "pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-between gap-3 bg-[var(--scrim)] px-4 py-2 text-xs text-[var(--ink-inverse)] backdrop-blur-sm"
          : "mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-4 text-xs text-[var(--muted-foreground)]"
      }
    >
      <span className={isImmersive ? "pointer-events-none" : undefined}>
        © {new Date().getFullYear()} {about.name}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        {isImmersive && (
          <>
            <TimeOfDayToggle />
            <ReducedMotionToggle />
            {audio?.enabled && (
              <AudioControls muted={audio.muted} onToggleMute={audio.onToggleMute} />
            )}
          </>
        )}

        {isImmersive ? (
          <Link
            href="/classic"
            prefetch={false}
            className="pointer-events-auto rounded px-2 py-1 outline-offset-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Classic mode
          </Link>
        ) : (
          <Link
            href="/"
            prefetch={false}
            className="rounded px-2 py-1 text-[var(--ink)] outline-offset-2 hover:bg-[var(--secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Immersive mode
          </Link>
        )}
      </div>

      {isImmersive ? (
        <button
          onClick={() => setChromePanel("help")}
          aria-label="Keyboard shortcuts"
          className="pointer-events-auto rounded px-2 py-1 outline-offset-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          ? Shortcuts
        </button>
      ) : (
        // No shortcuts panel in classic: every shortcut it documents
        // (G/C/R/P) drives the 3D world and does nothing here.
        <span>Built with Next.js &amp; Three.js</span>
      )}
    </footer>
  );
}
