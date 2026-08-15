"use client";

import { useMemo, useState } from "react";
import { skills } from "@/content/skills";
import type { SkillDomain } from "@/content/schema";

const DOMAIN_LABELS: Record<SkillDomain, string> = {
  frontend: "Frontend",
  backend: "Backend",
  "ai-ml": "AI / ML",
  "cloud-infra": "Cloud & Infra",
};
const DOMAIN_ORDER: SkillDomain[] = ["frontend", "backend", "ai-ml", "cloud-infra"];
const ROOT = { x: 400, y: 460 };
const BRANCH_X = [100, 300, 500, 700];
const BRANCH_Y = 90;

/**
 * The animated skill tree — an organic root/constellation system that
 * lights up by domain, the Phase 4 feature that ties into the Sanctuary
 * scene's creature-domain grouping. Decorative SVG is aria-hidden; the real
 * accessible content is the definition list beside it, so screen reader
 * users get full skill data regardless of whether the diagram renders.
 */
export function SkillTree() {
  const [activeDomain, setActiveDomain] = useState<SkillDomain | null>(null);

  const branches = useMemo(
    () =>
      DOMAIN_ORDER.map((domain, i) => {
        const bx = BRANCH_X[i];
        const domainSkills = skills.filter((s) => s.domain === domain);
        return {
          domain,
          x: bx,
          y: BRANCH_Y,
          skills: domainSkills.map((skill, j) => ({
            skill,
            x: bx + (j - (domainSkills.length - 1) / 2) * 70,
            y: BRANCH_Y - 60,
          })),
        };
      }),
    [],
  );

  return (
    <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
      <svg
        viewBox="0 0 800 500"
        role="presentation"
        aria-hidden="true"
        className="h-auto w-full"
      >
        {branches.map((branch) => (
          <g key={branch.domain}>
            <path
              d={`M ${ROOT.x} ${ROOT.y} Q ${(ROOT.x + branch.x) / 2} ${(ROOT.y + branch.y) / 2 + 40} ${branch.x} ${branch.y}`}
              fill="none"
              stroke="var(--border)"
              strokeWidth={activeDomain === branch.domain ? 2 : 1}
              className="transition-[stroke-width] duration-300"
            />
            {branch.skills.map(({ skill, x, y }) => (
              <g key={skill.id}>
                <line
                  x1={branch.x}
                  y1={branch.y}
                  x2={x}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={6 + skill.proficiency * 8}
                  fill="var(--accent)"
                  opacity={0.35 + skill.proficiency * 0.5}
                  className="motion-safe:animate-pulse"
                  style={{ animationDuration: "3s" }}
                />
              </g>
            ))}
          </g>
        ))}
        <circle cx={ROOT.x} cy={ROOT.y} r={10} fill="var(--accent)" />
      </svg>

      <dl className="flex flex-col gap-6">
        {DOMAIN_ORDER.map((domain) => (
          <div
            key={domain}
            onMouseEnter={() => setActiveDomain(domain)}
            onMouseLeave={() => setActiveDomain(null)}
          >
            <dt className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--accent)] uppercase">
              {DOMAIN_LABELS[domain]}
            </dt>
            {skills
              .filter((s) => s.domain === domain)
              .map((skill) => (
                <dd key={skill.id} className="mt-2 border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--ink)]">{skill.name}</span>
                  <p className="text-sm text-[var(--muted-foreground)]">{skill.description}</p>
                </dd>
              ))}
          </div>
        ))}
      </dl>
    </div>
  );
}
