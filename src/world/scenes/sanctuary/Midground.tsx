"use client";

import { CreatureRig } from "@/world/shared/CreatureRig";
import { chapterRange } from "@/world/scenes/worldLayout";
import { sanctuaryContent } from "./content";
import type { SkillDomain } from "@/content/schema";

const valley = chapterRange("valley");
// Second half of the Valley — see river/Midground.tsx for why the biome is
// split between the two vocabularies rather than shared across all of it.
const length = (valley.start - valley.end) / 2;
const start = valley.start - length;

// Four domain clusters spread along the chapter's depth, two creatures each
// (see content.ts / src/content/skills.ts) — spatial grouping by domain
// gives the grove a little more narrative structure than a random scatter.
const DOMAIN_ORDER: SkillDomain[] = ["frontend", "backend", "ai-ml", "cloud-infra"];

export function SanctuaryMidground() {
  return (
    <group>
      {DOMAIN_ORDER.map((domain, clusterIndex) => {
        const clusterSkills = sanctuaryContent.skills.filter((s) => s.domain === domain);
        const clusterZ = start - ((clusterIndex + 0.5) / DOMAIN_ORDER.length) * length;
        return clusterSkills.map((skill, i) => (
          <CreatureRig
            key={skill.id}
            skill={skill}
            position={[i % 2 === 0 ? -1.6 : 1.6, 0.5, clusterZ + (i % 2 === 0 ? 1.2 : -1.2)]}
          />
        ));
      })}
    </group>
  );
}
