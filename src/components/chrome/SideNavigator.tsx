"use client";

import { useEffect, useRef, useState } from "react";
import { SECTIONS } from "@/content/sections";
import { useAppStore } from "@/state/useAppStore";
import { scrollToSection } from "@/systems/scroll/scrollToSection";

/** How long the navigator stays up after the last interaction. Long enough to
 * aim at, short enough that it is gone by the time the visitor is reading. */
const IDLE_MS = 2400;

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
  const [pinned, setPinned] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const wake = () => {
      setVisible(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setVisible(false), IDLE_MS);
    };

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

  const shown = visible || pinned;

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
        "fixed z-30 transition-opacity duration-500 motion-reduce:transition-none",
        "inset-x-0 bottom-4 flex justify-center",
        "md:inset-x-auto md:bottom-auto md:right-6 md:top-1/2 md:block md:-translate-y-1/2",
        shown ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <ol
        className={[
          "flex items-center gap-1 rounded-full border border-[var(--border-soft)]",
          "bg-[var(--surface)] px-2 py-2 backdrop-blur-md",
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
                className="group flex items-center gap-3 rounded-full p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] md:w-full md:justify-end md:px-2"
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
