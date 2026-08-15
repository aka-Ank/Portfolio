"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("river");

export function RiverBackground() {
  return (
    <InstancedFoliage
      baseCount={80}
      center={[0, 0, mid]}
      radius={[16, 30]}
      scale={[0.9, 1.7]}
      depth={26}
      color="#556354"
      seed={41}
    />
  );
}
