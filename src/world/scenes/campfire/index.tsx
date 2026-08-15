"use client";

import { CampfireForeground } from "./Foreground";
import { CampfireMidground } from "./Midground";
import { CampfireBackground } from "./Background";

// Campfire — calm, emotionally memorable close. See docs/03-scene-graph.md §7.
export function CampfireScene() {
  return (
    <group>
      <CampfireForeground />
      <CampfireMidground />
      <CampfireBackground />
    </group>
  );
}
