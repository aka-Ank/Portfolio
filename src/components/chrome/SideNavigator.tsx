"use client";

import { useEffect, useRef, useState } from "react";
import { SECTIONS } from "@/content/sections";
import { useAppStore } from "@/state/useAppStore";
import { scrollToSection } from "@/systems/scroll/scrollToSection";

/** How long the navigator stays up after the last interaction. Long enough to
 * aim at, short enough that it is gone by the time the visitor is reading. */
const IDLE_MS = 2400;

/** How far down the page the navigator starts existing at all. At the top
 * there is nothing to navigate back to and the hero is the whole point of the
 * screen, so a rail hovering beside it is noise. Half a viewport means it
 * arrives once the visitor has committed to reading rather than on the first
 * flick of the wheel. */
const REVEAL_AFTER = () => window.innerHeight * 0.5;

/**
 * A hovering section navigator: appears on scroll or pointer movement, fades
 * out when idle, and never covers content.
 *
 * It is a real `<nav>` of real buttons, not a decorative rail — so it is
 * reachable by keyboard, and focusing any dot pins it open (an element that
 * vanishes while it has focus is a trap in the making). On small screens it
 * moves to the bottom edge and drops its labels, where a vertical rail would
 * either overlap the text column or be too narrow to hit.
 */
export function SideNavigator() {
  const activeSection = useAppStore((s) => s.activeSection);
  const [visible, setVisible] = useState(false);
  const [past, setPast] = useState(false);
  const [pinned, setPinned] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Two separate conditions, and keeping them apart is the point. `past`
    // answers "does this control exist yet"; `visible` answers "has the
    // visitor touched anything recently". Collapsing them into one flag was
    // what made the rail appear at the very top on a stray mouse move.
    const wake = () => {
      const scrolled = window.scrollY > REVEAL_AFTER();
      setPast(scrolled);
      if (!scrolled) return;

      setVisible(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setVisible(false), IDLE_MS);
    };

    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("pointermove", wake, { passive: true });
    window.addEventListener("keydown", wake);
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("keydown", wake);
      window.clearTimeout(timer.current);
    };
  }, []);

  // `pinned` deliberately cannot override `past`: nothing can be hovered or
  // focused while the rail is display-less, so there is no state where this
  // hides something the visitor is interacting with.
  const shown = past && (visible || pinned);

  return (
    <nav
      aria-label="Sections"
      onFocusCapture={() => setPinned(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setPinned(false);
      }}
      onPointerEnter={() => setPinned(true)}
      onPointerLeave={() => setPinned(false)}
      className={[
        "fixed z-30 transition-[opacity,visibility] duration-500 motion-reduce:transition-none",
        // On phones it tucks directly onto the top edge of the command strip
        // rather than floating a few centimetres above it. At `bottom-20` it
        // hovered in the middle of whatever card happened to be there and its
        // dots sat on top of the text — a translucent pill over body copy reads
        // as a rendering fault, not as chrome.
        "inset-x-0 bottom-[3.25rem] flex justify-center",
        "md:inset-x-auto md:bottom-auto md:right-6 md:top-1/2 md:block md:-translate-y-1/2",
        // `invisible`, not just `opacity-0`: a transparent element still takes
        // focus, so tabbing through the page would land on eight buttons
        // nobody can see. `visibility` holds `visible` for the length of the
        // transition, so this still fades rather than blinking out.
        shown ? "visible opacity-100" : "invisible opacity-0",
      ].join(" ")}
    >
      <ol
        className={[
          "flex items-center gap-0.5 rounded-full border border-[var(--border-soft)]",
          // Opaque on mobile: the strip is small and sits over content, so it
          // has to read as a solid object rather than as a smear.
          "bg-[var(--surface-solid)] px-1.5 py-1.5 shadow-lg backdrop-blur-md",
          "md:bg-[var(--surface)] md:px-2 md:py-3",
          "md:flex-col md:items-end md:gap-0 md:rounded-2xl md:px-2 md:py-3",
        ].join(" ")}
      >
        {SECTIONS.map((section) => {
          const isActive = section.id === activeSection;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => scrollToSection(section.id)}
                aria-current={isActive ? "true" : undefined}
                className="group flex items-center gap-3 rounded-full p-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] md:w-full md:justify-end md:px-2"
              >
                <span
                  className={[
                    "hidden text-right text-xs transition-colors md:inline",
                    isActive
                      ? "text-[var(--ink)]"
                      : "text-[var(--ink-muted)] group-hover:text-[var(--ink)]",
                  ].join(" ")}
                >
                  {section.label}
                </span>
                <span
                  aria-hidden
                  className={[
                    "block rounded-full transition-all duration-300 motion-reduce:transition-none",
                    isActive
                      ? "h-2.5 w-2.5 bg-[var(--accent-ink)]"
                      : "h-1.5 w-1.5 bg-[var(--ink-muted)] opacity-50 group-hover:opacity-100",
                  ].join(" ")}
                />
                {/* The label is hidden on mobile, so the accessible name has
                    to come from somewhere the dot cannot provide. */}
                <span className="sr-only md:hidden">{section.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
