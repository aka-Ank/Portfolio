"use client";

import { RiverForeground } from "./Foreground";
import { RiverMidground } from "./Midground";
import { RiverBackground } from "./Background";

// Knowledge River — learning, iteration, growth. See docs/03-scene-graph.md §3.
export function RiverScene() {
  return (
    <group>
      <RiverForeground />
      <RiverMidground />
      <RiverBackground />
    </group>
  );
}
