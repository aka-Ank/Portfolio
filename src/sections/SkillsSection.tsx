import { skillsContent } from "@/content/sections";
import { SectionShell, Panel } from "./SectionShell";

/**
 * Grouped lists, no ratings and no bars.
 *
 * A self-assigned "PyTorch 80%" is unverifiable and reads as filler; the
 * grouping is the information. What backs each of these up is the projects
 * section directly above.
 */
export function SkillsSection() {
  return (
    <SectionShell id="skills" heading={skillsContent.heading} width="wide">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillsContent.groups.map((group) => (
          <Panel key={group.id} as="div">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent-ink)]">
              {group.label}
            </h3>
            <ul className="mt-4 space-y-1.5">
              {group.items.map((item) => (
                <li key={item} className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </SectionShell>
  );
}
