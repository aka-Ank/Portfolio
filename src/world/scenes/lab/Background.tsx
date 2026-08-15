"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { start, end, mid } = chapterRange("jungle");

// The chamber recedes into structured dark — sparse pillars instead of trees,
// this is the first chapter that reads as built rather than grown (see
// docs/03-scene-graph.md §5). Foliage doesn't disappear entirely (nature and
// structure "visibly merging" per the design spec), just thins out.
export function LabBackground() {
  return (
    <>
      <InstancedFoliage
        baseCount={30}
        center={[0, 0, mid]}
        radius={[16, 28]}
        scale={[0.7, 1.3]}
        depth={26}
        color="#3d443a"
        seed={71}
      />
      <InstancedFoliage
        baseCount={14}
        center={[0, 0, mid]}
        radius={[7, 10]}
        scale={[1.6, 2.2]}
        depth={Math.abs(start - end)}
        color="#302d27"
        geometry="cylinder"
        seed={73}
      />
    </>
  );
}
