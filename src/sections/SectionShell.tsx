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
 * the padding is deliberately modest. This has been tightened twice, both times
 * against a measurement rather than a feeling: an early version left 224px
 * between sections (24% of the page), the next left 128px (27.5%, because the
 * page had also got shorter), and this one leaves 96px. Below about 80px the
 * headings stop reading as section breaks and the page becomes one long column,
 * so this is close to the floor rather than a first cut.
 */
export function SectionShell({ id, heading, blurb, children, className }: SectionShellProps) {
  return (
    <section
      id={sectionElementId(id)}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-20 px-5 py-8 sm:px-10 sm:py-12", className)}
    >
      <Reveal className={CONTENT_GRID}>
        <h2
          id={`${id}-heading`}
          className="font-[family-name:var(--font-display)] text-3xl leading-[1.15] tracking-[-0.01em] text-[var(--ink)] sm:text-4xl"
        >
          {heading}
        </h2>
        {blurb && (
          <p className={cn("mt-2.5 text-[17px] leading-relaxed text-[var(--ink-muted)]", PROSE_MEASURE)}>
            {blurb}
          </p>
        )}
        <div className="mt-5 sm:mt-6">{children}</div>
      </Reveal>
    </section>
  );
}

/**
 * The one bento grid, shared by every section.
 *
 * Six columns at desktop, four at tablet, one on a phone. Tiles claim spans out
 * of that — 4+2, 3+3, 6 — so the page has a single underlying rhythm while no
 * two sections look identical. A six-up grid of equal boxes is a table with
 * rounded corners; what makes a bento read as designed is that the spans follow
 * the *content*, so the block with the most in it gets the most room.
 *
 * `stretch` is on by default, which levels every tile in a row so varying spans
 * never leaves ragged bottoms. The project grids turn it **off**: their cards
 * are disclosure widgets, and a stretched row would make opening one silently
 * inflate the blank space beside it.
 *
 * **Levelling only applies from `sm:` up, and that is the whole point.** At one
 * column every tile is its own row, so `auto-rows-fr` levels them against each
 * other — the tallest card in the section sets the height of every card in it.
 * Measured on a 390px screen that put 276px of dead space inside a card holding
 * four words. Levelling is a fix for *side-by-side* tiles; with nothing
 * alongside them there is nothing to level, only emptiness to add.
 */
export function BentoGrid({
  children,
  stretch = true,
  className,
}: {
  children: ReactNode;
  stretch?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6",
        stretch ? "sm:auto-rows-fr" : "items-start",
        className,
      )}
    >
      {children}
    </div>
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
        "rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[0_1px_2px_oklch(0_0_0/0.03),0_8px_24px_-12px_oklch(0_0_0/0.10)] backdrop-blur-md sm:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
