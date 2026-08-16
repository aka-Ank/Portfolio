import type { ReactNode } from "react";
import { sectionMeta, type SectionId } from "@/content/sections";
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
 * The standard frame every section sits in: snap point, consistent vertical
 * rhythm, the place name as an eyebrow, and a single one-shot reveal.
 *
 * A **server** component — the only interactive part is the reveal, which is
 * isolated in `<Reveal>`. That keeps six of the eight sections out of the
 * client bundle entirely.
 *
 * `min-h-dvh` plus `snap-start` is the whole scroll model — the browser owns
 * the movement, so there is nothing here that can fight the visitor's input.
 * Sections are allowed to grow past the viewport rather than being forced to
 * fit it; a section that clipped its own content to preserve a snap point
 * would be choosing the effect over the content.
 */
export function SectionShell({
  id,
  heading,
  blurb,
  children,
  width = "narrow",
  className,
}: SectionShellProps) {
  const meta = sectionMeta(id);

  return (
    <section
      id={sectionElementId(id)}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "flex min-h-dvh snap-start flex-col justify-center px-6 py-28 sm:px-10",
        className,
      )}
    >
      <Reveal className={cn("mx-auto w-full", width === "wide" ? "max-w-5xl" : "max-w-2xl")}>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-ink)]">
          {meta.place}
        </p>
        <h2
          id={`${id}-heading`}
          className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-[1.1] text-[var(--ink)] sm:text-5xl"
        >
          {heading}
        </h2>
        {blurb && (
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--ink-muted)]">{blurb}</p>
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
