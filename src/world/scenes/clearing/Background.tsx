"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("clearing");

// Forest wall enclosing the clearing — denser than Entrance's tree line
// since this is meant to read as a bounded, held space.
export function ClearingBackground() {
  return (
    <InstancedFoliage
      baseCount={90}
      center={[0, 0, mid]}
      radius={[14, 26]}
      scale={[0.9, 1.7]}
      depth={24}
      color="#546150"
      seed={23}
    />
  );
}
