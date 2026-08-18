import { aboutContent, glanceContent } from "@/content/sections";
import { SectionShell, BentoGrid, Panel, PROSE_MEASURE } from "./SectionShell";
import { cn } from "@/lib/utils";

/**
 * Two lines and a meta row. That is the whole section.
 *
 * The projects, the internship and the degree all have their own sections below
 * with more detail than a summary can carry, so what is left here is only what
 * those sections cannot say: the two tracks, and the kind of work he is after.
 *
 * It has been cut twice. It was three paragraphs beside a four-row fact panel,
 * which made it the tallest block on the page while saying least; then two
 * lines beside the same panel, at which point the panel was 128px taller than
 * the summary next to it and the section read as a short paragraph with a box
 * floating beside it. The panel is now one line, because every fact in it is
 * stated somewhere else on this page anyway — the location in the hero, the
 * degree and the year in Education — so it only ever needed to be a shortcut,
 * not a second copy.
 *
 * Both tiles sit on `--surface`, which is not decoration. Running
 * `--ink-muted` text directly on the backdrop measured 1.58:1 against the moon,
 * which crosses exactly this part of the frame — so prose belongs on a surface.
 */
export function AboutSection() {
  return (
    <SectionShell id="about" heading={aboutContent.heading}>
      <BentoGrid>
        <Panel as="div" className="lg:col-span-4">
          <div
            className={cn(
              "space-y-3 text-[17px] leading-relaxed text-[var(--ink-muted)]",
              PROSE_MEASURE,
            )}
          >
            {aboutContent.bio.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </Panel>

        {/* The facts get their own tile again now that the grid levels the two
            heights. As a free-floating panel beside two lines of prose it was
            128px taller than what it sat next to; as a bento cell it is simply
            the narrow half of a 4+2 row. */}
        <Panel as="div" className="lg:col-span-2">
          <dl className="space-y-3">
            {glanceContent.map((fact) => (
              <div key={fact}>
                <dd className="font-mono text-[12px] leading-snug text-[var(--ink-muted)]">
                  {fact}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>
      </BentoGrid>
    </SectionShell>
  );
}
