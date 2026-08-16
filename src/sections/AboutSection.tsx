import { aboutContent } from "@/content/sections";
import { SectionShell } from "./SectionShell";

/** Short by design. Three paragraphs is a professional summary; ten is an
 * essay nobody reads. */
export function AboutSection() {
  return (
    <SectionShell id="about" heading={aboutContent.heading}>
      <div className="space-y-5 text-[17px] leading-relaxed text-[var(--ink-muted)]">
        {aboutContent.bio.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </SectionShell>
  );
}
