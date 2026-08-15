"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useWorldStore } from "@/world/state/useWorldStore";
import { playSfx } from "@/world/systems/audio/audioManager";

/**
 * A hidden, subtle, optional discovery — see docs/03-scene-graph.md
 * "a small number of hidden lore/narrative objects across the world
 * (subtle, optional discovery, not required for comprehension)". Small,
 * dim, easy to miss; brightens slightly on hover as the only hint it's
 * interactive, then confirms discovery with a soft SFX — never blocks or
 * gates content.
 */
export function LoreObject({ id, position }: { id: string; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const discoverLore = useWorldStore((s) => s.discoverLore);
  const alreadyFound = useWorldStore((s) => s.loreFound.includes(id));

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.03;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const base = alreadyFound ? 0.6 : 0.25;
    mat.emissiveIntensity = base + (hovered ? 0.5 : 0);
    state.invalidate();
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (!alreadyFound) playSfx("confirm");
        discoverLore(id);
      }}
    >
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial color="#050505" emissive="#4bb8b0" emissiveIntensity={0.25} />
    </mesh>
  );
}
