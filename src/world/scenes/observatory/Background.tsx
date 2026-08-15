"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("observatory");

// The canopy, far below and distant — this chapter's real background is the
// night sky itself (TimeOfDaySystem's stars), per docs/03-scene-graph.md §6
// "stars standing in for the Aether at its most diffuse and expansive."
export function ObservatoryBackground() {
  return (
    <InstancedFoliage
      baseCount={40}
      center={[0, -3, mid]}
      radius={[20, 36]}
      scale={[0.7, 1.2]}
      depth={26}
      color="#171d1a"
      seed={83}
    />
  );
}
