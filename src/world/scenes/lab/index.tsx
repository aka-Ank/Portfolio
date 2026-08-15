"use client";

import { LabForeground } from "./Foreground";
import { LabMidground } from "./Midground";
import { LabBackground } from "./Background";
import { LoreObject } from "@/world/shared/LoreObject";
import { chapterRange } from "@/world/scenes/worldLayout";

const { start, end } = chapterRange("lab");

// Lab / Project Chamber — projects as artifacts. See docs/03-scene-graph.md §5.
export function LabScene() {
  return (
    <group>
      <LabForeground />
      <LabMidground />
      <LabBackground />
      <LoreObject id="lab-conduit" position={[0, 0.25, (start + end) / 2 + 8]} />
    </group>
  );
}
