import { skillsContent } from "@/content/sections";
import { SectionShell, BentoGrid, Panel } from "./SectionShell";
import { cn } from "@/lib/utils";

/**
 * Grouped lists as bento tiles, no ratings and no bars.
 *
 * A self-assigned "PyTorch 80%" is unverifiable and reads as filler; the
 * grouping is the information. What backs each of these up is the projects
 * section directly above.
 *
 * The tiles are deliberately *unequal*: the spans follow the content, so the
 * groups with the most entries get the most room. This is the section the whole
 * page's bento grid was generalised from — see `BentoGrid`.
 */
const SPAN: Record<string, string> = {
  languages: "sm:col-span-2 lg:col-span-2",
  "core-cs": "sm:col-span-2 lg:col-span-4",
  "machine-learning": "sm:col-span-4 lg:col-span-3",
  "data-modeling": "sm:col-span-4 lg:col-span-3",
  "web-databases": "sm:col-span-2 lg:col-span-3",
  tools: "sm:col-span-2 lg:col-span-3",
};

export function SkillsSection() {
  return (
    <SectionShell id="skills" heading={skillsContent.heading}>
      <BentoGrid>
        {skillsContent.groups.map((group) => (
          <Panel key={group.id} as="div" className={cn("flex flex-col", SPAN[group.id])}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent-ink)]">
              {group.label}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
              {group.items.map((item) => (
                <li key={item} className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </BentoGrid>
    </SectionShell>
  );
}
