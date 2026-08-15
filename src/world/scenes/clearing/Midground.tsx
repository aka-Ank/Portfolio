"use client";

import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("grove");

/**
 * The story-stone — the "about" text reads as though it belongs to this
 * weathered marker, per docs/03 §2 ("text integrated into the environment
 * ... rather than a floating card"). Deliberately the only midground
 * object: this chapter's calm comes from restraint, not more content.
 */
export function ClearingMidground() {
  return (
    <group position={[0, 0, mid]}>
      <mesh position={[0, 1, 0]} rotation={[0.05, 0.3, -0.03]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial color="#7a7568" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.15, 10]} />
        <meshStandardMaterial color="#6b6658" roughness={1} />
      </mesh>
    </group>
  );
}
