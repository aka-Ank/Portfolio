"use client";

import { chapterRange } from "@/world/scenes/worldLayout";

const { start, end } = chapterRange("observatory");
const mid = (start + end) / 2;

// Observatory structure framing an open sky — a ring of slender pillars,
// the platform the visitor stands on rising above the canopy (see
// docs/03-scene-graph.md §6). No foliage here; this chapter has fully left
// "grown" behind for "built."
export function ObservatoryForeground() {
  const pillarCount = 8;
  const radius = 6;
  return (
    <group position={[0, 0, mid]}>
      {Array.from({ length: pillarCount }).map((_, i) => {
        const angle = (i / pillarCount) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius]}
            castShadow
          >
            <cylinderGeometry args={[0.15, 0.2, 3, 8]} />
            <meshStandardMaterial color="#232228" roughness={0.5} metalness={0.4} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[radius + 0.5, radius + 1, 0.1, 24]} />
        <meshStandardMaterial color="#2c2b30" roughness={0.6} />
      </mesh>
    </group>
  );
}
