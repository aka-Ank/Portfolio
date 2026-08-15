"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CHAPTER_ORDER, CHAPTER_LABELS } from "@/types/world";
import { useWorldStore } from "@/world/state/useWorldStore";
import { scrollToChapter } from "@/world/systems/scroll-camera/scrollToChapter";

/** Long enough to read where you are after arriving, short enough that the
 * rail isn't competing with the world for attention. */
const IDLE_HIDE_MS = 2400;

/**
 * The floating chapter navigator — a right-hand rail, hidden until you're
 * navigating.
 *
 * Pattern chosen over a bottom-pill and a compass: navigation is discrete
 * (seven fixed chapters), so one marker per chapter makes position on the
 * rail map 1:1 to position in the journey — progress reads spatially rather
 * than as a percentage. A bottom-pill would also collide with the overlay
 * panels that already sit low-left, and a compass conveys heading but not
 * how far through the world you are, which is the actual question.
 *
 * Stays keyboard-reachable while faded: focus inside it pins it open, so a
 * keyboard user is never tabbing into something invisible (the same class of
 * bug the Preloader `inert` fix addressed — see ENGINEER_NOTES.md).
 */
export function ChapterNavigator() {
  const currentChapter = useWorldStore((s) => s.currentChapter);
  const viewedChapters = useWorldStore((s) => s.viewedChapters);
  const phase = useWorldStore((s) => s.phase);
  const reducedMotion = useWorldStore((s) => s.reducedMotion);

  const [revealed, setRevealed] = useState(false);
  const [pinned, setPinned] = useState(false);
  const hideTimer = useRef<number | null>(null);

  const activeIndex = CHAPTER_ORDER.indexOf(currentChapter);

  // Every reveal comes from an external event — a store change, a wheel
  // gesture, the pointer nearing the right edge — never from a synchronous
  // setState in an effect body. That's both what the React Compiler's
  // set-state-in-effect rule requires and, as it turned out, the correct
  // behaviour: revealing on mount fired while the Preloader was still up and
  // the 2.4s timer expired before the visitor ever pressed Enter, so the
  // rail was invisible for the whole session.
  useEffect(() => {
    function wake() {
      setRevealed(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setRevealed(false), IDLE_HIDE_MS);
    }

    // Chapter arrivals *and* entering the world both count as navigation.
    // (goToChapter("entrance") on Enter is a no-op now that repeat requests
    // early-return, so the phase edge is what actually signals arrival.)
    const unsubscribe = useWorldStore.subscribe((s, prev) => {
      if (s.currentChapter !== prev.currentChapter || s.phase !== prev.phase) wake();
    });

    function onPointerMove(e: PointerEvent) {
      if (e.clientX > window.innerWidth - 140) wake();
    }
    window.addEventListener("wheel", wake, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      unsubscribe();
      window.removeEventListener("wheel", wake);
      window.removeEventListener("pointermove", onPointerMove);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  if (phase === "preloading") return null;

  const open = revealed || pinned;

  return (
    <nav
      aria-label="Chapters"
      onFocusCapture={() => setPinned(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPinned(false);
      }}
      onPointerEnter={() => setPinned(true)}
      onPointerLeave={() => setPinned(false)}
      // Fades, never unmounts — an unmounted rail can't be tabbed to, and
      // opacity alone keeps it out of the way without any layout shift.
      className={`pointer-events-auto fixed top-1/2 right-4 z-30 -translate-y-1/2 transition-opacity duration-500 ${
        open ? "opacity-100" : "opacity-0 focus-within:opacity-100"
      }`}
    >
      <ol className="flex flex-col gap-1 rounded-full bg-[var(--scrim)] px-2 py-3 backdrop-blur-sm">
        {CHAPTER_ORDER.map((chapter, index) => {
          const isCurrent = chapter === currentChapter;
          const isPassed = index < activeIndex;
          return (
            <li key={chapter} className="relative flex items-center justify-end">
              <button
                onClick={() => scrollToChapter(chapter)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${CHAPTER_LABELS[chapter]}${viewedChapters[chapter] ? " (visited)" : ""}`}
                className="group flex items-center gap-2 rounded-full py-1.5 pr-1 pl-2 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
              >
                {/* Label rides in on hover/focus only — the resting state is
                    just the dot column, so the rail stays a thin thread. */}
                <span
                  className={`pointer-events-none max-w-0 overflow-hidden text-right text-xs whitespace-nowrap text-[var(--ink-inverse)] opacity-0 transition-all duration-300 group-hover:max-w-[10rem] group-hover:opacity-100 group-focus-visible:max-w-[10rem] group-focus-visible:opacity-100 ${
                    isCurrent ? "max-w-[10rem] opacity-90" : ""
                  }`}
                >
                  {CHAPTER_LABELS[chapter]}
                </span>
                <span
                  aria-hidden
                  className={`block rounded-full transition-all duration-300 ${
                    isCurrent
                      ? "h-2.5 w-2.5 bg-[var(--accent)]"
                      : isPassed
                        ? "h-1.5 w-1.5 bg-[var(--ink-inverse)]/70"
                        : "h-1.5 w-1.5 bg-[var(--ink-inverse)]/30"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ol>

      {/* Current-chapter caption, so the rail answers "where am I" without
          needing a hover. Suppressed under reduced motion's spring. */}
      <AnimatePresence>
        {open && (
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 6 }}
            transition={
              reducedMotion
                ? { duration: 0.12 }
                : { type: "spring", stiffness: 180, damping: 24 }
            }
            className="mt-2 text-right font-[family-name:var(--font-mono)] text-[10px] tracking-wide text-[var(--ink-inverse)]/80 uppercase"
          >
            {activeIndex + 1} / {CHAPTER_ORDER.length}
          </motion.p>
        )}
      </AnimatePresence>
    </nav>
  );
}
