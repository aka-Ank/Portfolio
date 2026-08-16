import { skillsContent } from "@/content/sections";
import type { Skill, SkillDomain } from "@/content/schema";
import { SectionShell } from "./SectionShell";

const DOMAIN_LABELS: Record<SkillDomain, string> = {
  "ai-ml": "AI / Machine Learning",
  backend: "Backend & Foundations",
  frontend: "Frontend",
  "cloud-infra": "Data & Infrastructure",
};

const DOMAIN_ORDER: SkillDomain[] = ["ai-ml", "backend", "frontend", "cloud-infra"];

/**
 * Grouped cards, not a rated grid.
 *
 * `proficiency` exists in the content layer but is deliberately **not** drawn
 * as a bar or a score. The resume states no self-ratings, so a filled meter
 * would present a derived number as a measured one. The evidence sentence
 * under each skill says what the number was derived from, which is the honest
 * version of the same information — and reads better besides.
 */
export function SkillsSection() {
  const byDomain = DOMAIN_ORDER.map((domain) => ({
    domain,
    skills: skillsContent.skills.filter((skill) => skill.domain === domain),
  })).filter((group) => group.skills.length > 0);

  return (
    <SectionShell
      id="skills"
      heading={skillsContent.heading}
      blurb={skillsContent.blurb}
      width="wide"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {byDomain.map((group) => (
          <section
            key={group.domain}
            aria-label={DOMAIN_LABELS[group.domain]}
            className="rounded-md border border-[var(--border-soft)] bg-[var(--surface)] p-6 backdrop-blur-md"
          >
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
              {DOMAIN_LABELS[group.domain]}
            </h3>
            <ul className="mt-4 space-y-4">
              {group.skills.map((skill) => (
                <SkillRow key={skill.id} skill={skill} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SectionShell>
  );
}

function SkillRow({ skill }: { skill: Skill }) {
  return (
    <li>
      <p className="text-[15px] font-medium text-[var(--ink)]">{skill.name}</p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{skill.description}</p>
    </li>
  );
}
