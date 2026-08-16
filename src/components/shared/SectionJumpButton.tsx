"use client";

import type { ReactNode } from "react";
import type { SectionId } from "@/content/sections";
import { scrollToSection } from "@/systems/scroll/scrollToSection";
import { cn } from "@/lib/utils";

/**
 * A button that moves the page to a section.
 *
 * Isolated so the sections that use it stay server components. This is also
 * the only kind of thing allowed to move the page at all: an explicit click,
 * never a scroll observer deciding on the visitor's behalf.
 */
export function SectionJumpButton({
  target,
  children,
  className,
}: {
  target: SectionId;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => scrollToSection(target)}
      className={cn(
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
