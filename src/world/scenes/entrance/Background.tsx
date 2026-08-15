"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("entrance");

// Distant tree line — slow parallax, softened by fog. See
// docs/01-design-specification.md §4 "three depth layers, always."
export function EntranceBackground() {
  return (
    <InstancedFoliage
      baseCount={70}
      center={[0, 0, mid]}
      radius={[18, 34]}
      scale={[0.8, 1.6]}
      depth={26}
      color="#5e6b58"
      seed={11}
    />
  );
}
