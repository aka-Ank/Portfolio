import type { ReactNode } from "react";
import type { SectionId } from "@/content/sections";
import { sectionElementId } from "@/systems/scroll/scrollToSection";
import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";

interface SectionShellProps {
  id: SectionId;
  heading: string;
  /** One line under the heading. Kept short — the sections carry their weight
   * in the content, not in preamble. */
  blurb?: string;
  children: ReactNode;
  /** `wide` for the sections that need room for a grid. */
  width?: "narrow" | "wide";
  className?: string;
}

/**
 * The standard frame every section sits in: consistent vertical rhythm, a
 * plain heading, and a single one-shot reveal.
 *
 * A **server** component — the only interactive part is the reveal, which is
 * isolated in `<Reveal>`. That keeps every content section out of the client
 * bundle.
 *
 * Sections are sized by their content rather than pinned to the viewport.
 * A short section (Education, Contact) that was forced to `min-h-dvh` would be
 * mostly empty space, and scroll-snap on top of that turns an ordinary read
 * into a sequence of jumps the visitor did not ask for.
 */
export function SectionShell({
  id,
  heading,
  blurb,
  children,
  width = "narrow",
  className,
}: SectionShellProps) {
  return (
    <section
      id={sectionElementId(id)}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-24 px-6 py-20 sm:px-10 sm:py-28", className)}
    >
      <Reveal className={cn("mx-auto w-full", width === "wide" ? "max-w-5xl" : "max-w-2xl")}>
        <h2
          id={`${id}-heading`}
          className="font-[family-name:var(--font-display)] text-3xl leading-[1.15] tracking-[-0.01em] text-[var(--ink)] sm:text-4xl"
        >
          {heading}
        </h2>
        {blurb && (
          <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-[var(--ink-muted)]">
            {blurb}
          </p>
        )}
        <div className="mt-10">{children}</div>
      </Reveal>
    </section>
  );
}

/** The site's one panel surface. Every card, list and callout uses it, so the
 * whole page reads as one material rather than as a pile of card styles. */
export function Panel({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 backdrop-blur-md",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
