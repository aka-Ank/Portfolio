"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("valley");

// Denser grove, filtered light — see docs/03-scene-graph.md §4.
export function SanctuaryBackground() {
  return (
    <InstancedFoliage
      baseCount={100}
      center={[0, 0, mid]}
      radius={[13, 26]}
      scale={[0.8, 1.6]}
      depth={26}
      color="#4d5c48"
      seed={61}
    />
  );
}
