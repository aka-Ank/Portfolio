"use client";

import { RiverForeground } from "./Foreground";
import { RiverMidground } from "./Midground";
import { RiverBackground } from "./Background";
import { LoreObject } from "@/world/shared/LoreObject";
import { chapterRange } from "@/world/scenes/worldLayout";

const { start, end } = chapterRange("river");

// Knowledge River — learning, iteration, growth. See docs/03-scene-graph.md §3.
export function RiverScene() {
  return (
    <group>
      <RiverForeground />
      <RiverMidground />
      <RiverBackground />
      <LoreObject id="river-stone" position={[3.6, 0.3, (start + end) / 2 - 6]} />
    </group>
  );
}
