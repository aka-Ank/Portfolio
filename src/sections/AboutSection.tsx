import { aboutContent } from "@/content/sections";
import { SectionShell, PROSE_MEASURE } from "./SectionShell";
import { cn } from "@/lib/utils";

/** Short by design. Three paragraphs is a professional summary; ten is an
 * essay nobody reads. The measure is capped inside the grid rather than by
 * narrowing the section, so the heading keeps the shared left edge. */
export function AboutSection() {
  return (
    <SectionShell id="about" heading={aboutContent.heading}>
      <div className={cn("space-y-4 text-[17px] leading-relaxed text-[var(--ink-muted)]", PROSE_MEASURE)}>
        {aboutContent.bio.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </SectionShell>
  );
}
