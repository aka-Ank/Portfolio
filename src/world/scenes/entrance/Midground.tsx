"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { damp } from "maath/easing";
import { useAetherMaterialRef } from "@/world/shared/useAetherMaterial";
import { chapterRange } from "@/world/scenes/worldLayout";

const { start } = chapterRange("entrance");
const ARCH_Z = start - 6;

/**
 * The threshold — a living archway of two leaning root-pillars, the one
 * focal point of the Entrance per docs/03-scene-graph.md §1. Its Aether
 * trace brightens gently as the camera nears, "responding to scroll intent"
 * without any explicit interaction — a quiet welcome, not a prompt.
 */
export function EntranceMidground() {
  const glowRef = useAetherMaterialRef(3);
  const glowMeshRef = useRef<THREE.Mesh>(null!);
  const proximity = useRef(0);

  useFrame((state, delta) => {
    const distance = Math.abs(state.camera.position.z - ARCH_Z);
    const target = THREE.MathUtils.clamp(1 - distance / 14, 0, 1);
    const stillAnimating = damp(proximity, "current", target, 1.2, delta);
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = 0.4 + proximity.current * 1.6;
    }
    if (stillAnimating) state.invalidate();
  });

  return (
    <group position={[0, 0, ARCH_Z]}>
      {/* Two leaning root-pillars */}
      <mesh position={[-1.8, 2.2, 0]} rotation={[0, 0, 0.22]} castShadow>
        <cylinderGeometry args={[0.28, 0.42, 4.6, 8]} />
        <meshStandardMaterial color="#4a3d33" roughness={0.95} />
      </mesh>
      <mesh position={[1.8, 2.2, 0]} rotation={[0, 0, -0.22]} castShadow>
        <cylinderGeometry args={[0.28, 0.42, 4.6, 8]} />
        <meshStandardMaterial color="#4a3d33" roughness={0.95} />
      </mesh>
      {/* Connecting arc */}
      <mesh position={[0, 4.1, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
        <torusGeometry args={[1.9, 0.24, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#4a3d33" roughness={0.95} />
      </mesh>
      {/* Aether trace along the inner arch edge */}
      <mesh ref={glowMeshRef} position={[0, 4.1, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
        <torusGeometry args={[1.55, 0.045, 6, 24, Math.PI]} />
        <meshStandardMaterial ref={glowRef} color="#050505" emissive="#4bb8b0" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}
