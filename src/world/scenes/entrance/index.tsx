"use client";

import { EntranceForeground } from "./Foreground";
import { EntranceMidground } from "./Midground";
import { EntranceBackground } from "./Background";

// Entrance — gateway, first impression. See docs/03-scene-graph.md §1.
// Composition only; content lives in content.ts, the DOM headline in
// EntranceOverlay.tsx (rendered outside the Canvas — see
// docs/07-accessibility-and-testing.md).
export function EntranceScene() {
  return (
    <group>
      <EntranceForeground />
      <EntranceMidground />
      <EntranceBackground />
    </group>
  );
}
