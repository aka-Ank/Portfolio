"use client";

import { ClearingForeground } from "./Foreground";
import { ClearingMidground } from "./Midground";
import { ClearingBackground } from "./Background";

// Clearing — about, human scale, unhurried. See docs/03-scene-graph.md §2.
export function ClearingScene() {
  return (
    <group>
      <ClearingForeground />
      <ClearingMidground />
      <ClearingBackground />
    </group>
  );
}
