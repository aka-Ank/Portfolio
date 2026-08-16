import { skillsContent } from "@/content/sections";
import { SectionShell, Panel } from "./SectionShell";
import { cn } from "@/lib/utils";

/**
 * Grouped lists as bento tiles, no ratings and no bars.
 *
 * A self-assigned "PyTorch 80%" is unverifiable and reads as filler; the
 * grouping is the information. What backs each of these up is the projects
 * section directly above.
 *
 * The tiles are deliberately *unequal*. A six-up grid of identical boxes is a
 * table with rounded corners — what makes a bento read as designed is that the
 * spans follow the content, so the two groups with the most entries get the
 * most room. `auto-rows-fr` then keeps every tile in a row the same height, so
 * varying the spans never produces ragged bottoms.
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
      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-4 lg:grid-cols-6">
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
      </div>
    </SectionShell>
  );
}
