"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { start } = chapterRange("entrance");

// Framing foliage close to the camera's starting position — mostly still,
// per docs/01 §4's motion budget (this scene spends its budget on the
// arch's Aether trace, not on foreground sway).
export function EntranceForeground() {
  return (
    <InstancedFoliage
      baseCount={16}
      center={[0, 0, start + 3]}
      radius={[5, 9]}
      scale={[1.1, 1.7]}
      depth={10}
      color="#3f4d3c"
      seed={7}
    />
  );
}
