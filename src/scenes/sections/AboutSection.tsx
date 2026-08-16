import { aboutContent } from "@/content/sections";
import { SectionShell } from "./SectionShell";

export function AboutSection() {
  return (
    <SectionShell id="about" heading={aboutContent.heading} blurb={aboutContent.role}>
      <div className="space-y-5">
        {aboutContent.bio.map((paragraph, index) => (
          <p key={index} className="text-[17px] leading-[1.75] text-[var(--ink)]">
            {paragraph}
          </p>
        ))}
      </div>

      <ul className="mt-10 space-y-3 border-t border-[var(--border-soft)] pt-6">
        {aboutContent.themes.map((theme) => (
          <li key={theme} className="flex gap-3 text-[15px] text-[var(--ink-muted)]">
            <span aria-hidden className="mt-[0.6em] h-px w-5 shrink-0 bg-[var(--accent-ink)]" />
            <span>{theme}</span>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
