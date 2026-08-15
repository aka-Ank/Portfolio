"use client";

import { ObservatoryForeground } from "./Foreground";
import { ObservatoryMidground } from "./Midground";
import { ObservatoryBackground } from "./Background";

// Observatory — achievements, certifications, blog, metrics. See
// docs/03-scene-graph.md §6.
export function ObservatoryScene() {
  return (
    <group>
      <ObservatoryForeground />
      <ObservatoryMidground />
      <ObservatoryBackground />
    </group>
  );
}
