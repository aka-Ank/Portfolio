"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { start, end } = chapterRange("jungle");

// Chamber architecture framing the shot — structural pillars, not foliage.
export function LabForeground() {
  return (
    <InstancedFoliage
      baseCount={10}
      center={[0, 0, (start + end) / 2]}
      radius={[4.5, 5.5]}
      scale={[2, 2.6]}
      depth={Math.abs(start - end) - 4}
      color="#26241f"
      geometry="cylinder"
      seed={79}
    />
  );
}
