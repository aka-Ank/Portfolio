"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("campfire");

// The fire itself — the Aether's final form, warm instead of the cool
// teal/cyan used everywhere else in the journey (docs/03-scene-graph.md §7:
// "closing the motif that began as a cool river current"). Deliberately not
// useAetherMaterialRef — this is the one place the motif transforms rather
// than just recolors with time-of-day.
export function CampfireMidground() {
  const coreRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    const flicker = 1.4 + Math.sin(state.clock.elapsedTime * 6) * 0.15 + Math.sin(state.clock.elapsedTime * 13) * 0.08;
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = flicker;
    }
    if (lightRef.current) {
      lightRef.current.intensity = flicker * 1.8;
    }
    state.invalidate();
  });

  return (
    <group position={[0, 0, mid]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, (i / 4) * Math.PI, Math.PI / 2 + 0.1]} position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 1.1, 6]} />
          <meshStandardMaterial color="#2e2318" roughness={1} />
        </mesh>
      ))}
      <mesh ref={coreRef} position={[0, 0.35, 0]}>
        <icosahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial color="#170a02" emissive="#e0813f" emissiveIntensity={1.4} roughness={0.6} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.6, 0]} color="#e0813f" intensity={2} distance={9} decay={2} />
    </group>
  );
}
