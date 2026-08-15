"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("campfire");

// Dark forest, fire-glow falloff — see docs/03-scene-graph.md §7.
export function CampfireBackground() {
  return (
    <InstancedFoliage
      baseCount={60}
      center={[0, 0, mid]}
      radius={[12, 24]}
      scale={[0.9, 1.6]}
      depth={20}
      color="#181f19"
      seed={97}
    />
  );
}
