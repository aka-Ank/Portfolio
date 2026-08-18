import { about } from "@/content/about";
import { CONTENT_GRID } from "./SectionShell";
import { cn } from "@/lib/utils";

/**
 * The closing line — a personal principle, at the end of the page.
 *
 * It sits *after* Contact rather than in the hero, and that placement is the
 * whole point. The hero's job is to answer "what does this person build" for
 * someone in a hurry, and it does that with a concrete sentence that is also
 * the `description` in the Person JSON-LD. A motto there would replace a line
 * that says what he does with a line that says how he feels about doing it, in
 * the one place a recruiter is least likely to read twice.
 *
 * At the end it costs nothing and reads as what it is: the last thing said,
 * after the facts are done.
 *
 * Deliberately not a heading and not in a panel. It is quieter than the section
 * titles above it, which is what keeps it from reading as an eighth section —
 * `CLAUDE.md` records that poetic *headings* were removed once already, and
 * this is careful not to become one.
 */
export function Motto() {
  return (
    <section aria-label="Personal motto" className="px-5 pb-4 pt-2 sm:px-10 sm:pb-8">
      <p
        className={cn(
          CONTENT_GRID,
          "border-t border-[var(--border-soft)] pt-8 text-center",
          "font-[family-name:var(--font-display)] text-[19px] leading-snug",
          "tracking-[0.01em] text-[var(--ink-muted)] sm:text-[22px]",
        )}
      >
        {about.motto}
      </p>
    </section>
  );
}
