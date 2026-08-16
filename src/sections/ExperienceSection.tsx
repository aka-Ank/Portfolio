import { experienceContent } from "@/content/sections";
import { SectionShell, Panel } from "./SectionShell";

/**
 * One role, one card. Deliberately not a timeline: with a single position, a
 * timeline is a vertical rule next to one dot — decoration standing in for
 * content that does not exist yet.
 */
export function ExperienceSection() {
  const { experience } = experienceContent;

  return (
    <SectionShell id="experience" heading={experienceContent.heading}>
      <Panel as="article">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-xl font-medium text-[var(--ink)]">{experience.role}</h3>
          <span className="font-mono text-xs text-[var(--ink-muted)]">{experience.period}</span>
        </div>
        <p className="mt-1 text-[15px] text-[var(--accent-ink)]">{experience.company}</p>

        <ul className="mt-5 space-y-2.5 border-t border-[var(--border-soft)] pt-5">
          {experience.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex gap-3 text-[15px] leading-relaxed text-[var(--ink-muted)]"
            >
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent-ink)]" />
              {highlight}
            </li>
          ))}
        </ul>
      </Panel>
    </SectionShell>
  );
}
