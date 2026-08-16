import { skillsContent } from "@/content/sections";
import type { SkillDomain } from "@/content/schema";

const DOMAIN_LABELS: Record<SkillDomain, string> = {
  "ai-ml": "AI / Machine Learning",
  backend: "Backend & Foundations",
  frontend: "Frontend",
  "cloud-infra": "Data & Infrastructure",
};

const DOMAIN_ORDER: SkillDomain[] = ["ai-ml", "backend", "frontend", "cloud-infra"];

export function Skills() {
  const groups = DOMAIN_ORDER.map((domain) => ({
    domain,
    skills: skillsContent.skills.filter((skill) => skill.domain === domain),
  })).filter((group) => group.skills.length > 0);

  return (
    <section id="skills" aria-labelledby="classic-skills-heading" className="mx-auto max-w-3xl px-6 py-16">
      <h2
        id="classic-skills-heading"
        className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]"
      >
        {skillsContent.heading}
      </h2>
      <p className="mt-3 max-w-xl text-[var(--ink-muted)]">{skillsContent.blurb}</p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {groups.map((group) => (
          <section key={group.domain} aria-label={DOMAIN_LABELS[group.domain]}>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
              {DOMAIN_LABELS[group.domain]}
            </h3>
            <ul className="mt-4 space-y-4 border-t border-[var(--border-soft)] pt-4">
              {group.skills.map((skill) => (
                <li key={skill.id}>
                  <p className="text-[15px] font-medium text-[var(--ink)]">{skill.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">
                    {skill.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
