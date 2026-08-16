import type { ReactNode } from "react";
import type { SectionId } from "@/content/sections";
import { sectionElementId } from "@/systems/scroll/scrollToSection";
import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";

/**
 * The one content column, shared by every section *and* the hero.
 *
 * This is a single constant on purpose. An earlier version let each section
 * pick its own width — 768px for the hero, 672px for prose, 1024px for grids,
 * each centred independently — which put the headings on three different left
 * edges. Scrolling from Experience into SDE Projects moved the heading 176px
 * sideways and then moved it back two sections later. One width means one
 * left edge, all the way down.
 */
export const CONTENT_GRID = "mx-auto w-full max-w-5xl";

/**
 * The readable measure for running prose, applied *inside* the grid rather
 * than instead of it. ~672px keeps a comfortable line length without
 * re-centring the block and breaking the shared left edge.
 */
export const PROSE_MEASURE = "max-w-2xl";

interface SectionShellProps {
  id: SectionId;
  heading: string;
  /** One line under the heading. Kept short — the sections carry their weight
   * in the content, not in preamble. */
  blurb?: string;
  children: ReactNode;
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
 * Sections are sized by their content rather than pinned to the viewport, and
 * the padding is deliberately modest: an earlier version left 224px of empty
 * space between every section, which was 24% of the whole page.
 */
export function SectionShell({ id, heading, blurb, children, className }: SectionShellProps) {
  return (
    <section
      id={sectionElementId(id)}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-20 px-6 py-12 sm:px-10 sm:py-16", className)}
    >
      <Reveal className={CONTENT_GRID}>
        <h2
          id={`${id}-heading`}
          className="font-[family-name:var(--font-display)] text-3xl leading-[1.15] tracking-[-0.01em] text-[var(--ink)] sm:text-4xl"
        >
          {heading}
        </h2>
        {blurb && (
          <p className={cn("mt-3 text-[17px] leading-relaxed text-[var(--ink-muted)]", PROSE_MEASURE)}>
            {blurb}
          </p>
        )}
        <div className="mt-8">{children}</div>
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
