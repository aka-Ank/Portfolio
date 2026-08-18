import { experienceContent } from "@/content/sections";
import { SectionShell, BentoGrid, Panel } from "./SectionShell";
import { cn } from "@/lib/utils";

/**
 * One role, one card. Deliberately not a timeline: with a single position, a
 * timeline is a vertical rule next to one dot — decoration standing in for
 * content that does not exist yet.
 */
export function ExperienceSection() {
  const { experience } = experienceContent;

  return (
    <SectionShell id="experience" heading={experienceContent.heading}>
      {/* Full grid width with the bullets in two columns, rather than a narrow
          card leaving a third of the row empty. One role does not need a
          timeline, but it does need to not look like an afterthought. */}
      <BentoGrid>
        <Panel as="article" className="lg:col-span-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-xl font-medium text-[var(--ink)]">{experience.role}</h3>
          <span className="font-mono text-xs text-[var(--ink-muted)]">{experience.period}</span>
        </div>
        <p className="mt-1 text-[15px] text-[var(--accent-ink)]">{experience.company}</p>

        <ul className="mt-4 grid gap-x-8 gap-y-2.5 border-t border-[var(--border-soft)] pt-4 sm:grid-cols-3">
          {experience.highlights.map((highlight) => (
            <li
              key={highlight}
              className={cn("flex gap-3 text-[15px] leading-relaxed text-[var(--ink-muted)]")}
            >
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent-ink)]" />
              {highlight}
            </li>
          ))}
        </ul>
        </Panel>
      </BentoGrid>
    </SectionShell>
  );
}
