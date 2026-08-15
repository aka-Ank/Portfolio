"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { start, end } = chapterRange("grove");
const mid = (start + end) / 2;

// Low grass/wildflower scatter — minimal parallax per docs/03 §2.
export function ClearingForeground() {
  return (
    <InstancedFoliage
      baseCount={40}
      center={[0, 0, mid]}
      radius={[2, 8]}
      scale={[0.15, 0.3]}
      depth={16}
      color="#7fae5c"
      geometry="cylinder"
      seed={31}
    />
  );
}
