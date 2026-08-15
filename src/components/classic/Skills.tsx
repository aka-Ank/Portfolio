import { sanctuaryContent } from "@/world/scenes/sanctuary/content";
import { SkillTree } from "./SkillTree";

export function Skills() {
  return (
    <section id="skills" aria-label="Skills" className="mx-auto max-w-4xl px-6 py-24">
      <h2 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        {sanctuaryContent.heading}
      </h2>
      <p className="mt-3 max-w-xl text-[var(--muted-foreground)]">{sanctuaryContent.intro}</p>
      <div className="mt-10">
        <SkillTree />
      </div>
    </section>
  );
}
