"use client";

import { SanctuaryForeground } from "./Foreground";
import { SanctuaryMidground } from "./Midground";
import { SanctuaryBackground } from "./Background";

// Animal Sanctuary — skills as symbolic creatures. See docs/03-scene-graph.md §4.
export function SanctuaryScene() {
  return (
    <group>
      <SanctuaryForeground />
      <SanctuaryMidground />
      <SanctuaryBackground />
    </group>
  );
}
