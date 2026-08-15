"use client";

import { ClearingForeground } from "./Foreground";
import { ClearingMidground } from "./Midground";
import { ClearingBackground } from "./Background";
import { LoreObject } from "@/world/shared/LoreObject";
import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("grove");

// Clearing — about, human scale, unhurried. See docs/03-scene-graph.md §2.
export function ClearingScene() {
  return (
    <group>
      <ClearingForeground />
      <ClearingMidground />
      <ClearingBackground />
      <LoreObject id="clearing-firefly" position={[-3.4, 0.6, mid + 3]} />
    </group>
  );
}
