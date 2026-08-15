"use client";

import { WORLD_LENGTH } from "@/world/scenes/worldLayout";

/**
 * One continuous ground plane spanning the whole world (see worldLayout.ts)
 * — neutral material so any color read comes from TimeOfDaySystem's lights,
 * not a hand-authored scene color (the same reasoning as the Phase 2 proof
 * scene, kept for the real scenes).
 */
export function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, -WORLD_LENGTH / 2 + 20]}
      receiveShadow
    >
      <planeGeometry args={[120, WORLD_LENGTH + 60]} />
      <meshStandardMaterial color="#9a9a8f" roughness={1} />
    </mesh>
  );
}
