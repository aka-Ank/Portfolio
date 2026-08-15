"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("sanctuary");

// Undergrowth the creatures move through — see docs/03-scene-graph.md §4.
export function SanctuaryForeground() {
  return (
    <InstancedFoliage
      baseCount={36}
      center={[0, 0, mid]}
      radius={[2, 7]}
      scale={[0.2, 0.4]}
      depth={24}
      color="#5f7a45"
      geometry="cylinder"
      seed={67}
    />
  );
}
