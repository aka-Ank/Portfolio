"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { damp } from "maath/easing";
import { DistanceFadeHtml } from "./DistanceFadeHtml";
import { useAetherMaterialRef } from "./useAetherMaterial";
import type { Skill } from "@/content/schema";

// Deterministic per-id phase offset (0-2π) so creatures de-sync from each
// other without calling Math.random() during render — avoids both the
// impure-render lint rule and any SSR/hydration mismatch.
function phaseFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return (Math.abs(hash) % 1000) / 1000 * Math.PI * 2;
}

/**
 * The base rig every Animal Sanctuary creature extends (docs/02-architecture.md).
 * Deliberately abstract (body/head/legs from primitives, not a per-species
 * model) — see SESSION.md's Phase 1 note on placeholder art standing in for
 * bespoke assets. What's real: the Aether marking's size/intensity maps to
 * `skill.proficiency`, idle motion is perpetual-but-per-instance-offset (not
 * lockstep), and hover reveals the actual skill data via docs/03 §4's
 * "believable idle states... not static posed" requirement.
 */
export function CreatureRig({
  skill,
  position,
}: {
  skill: Skill;
  position: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const hoverAmount = useRef(0);
  const markingRef = useAetherMaterialRef(2);
  const phase = phaseFromId(skill.id);
  const baseY = position[1];

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime + phase;
    groupRef.current.position.y = baseY + Math.sin(t * 0.8) * 0.06;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.18;
    damp(hoverAmount, "current", hovered ? 1 : 0, 0.3, delta);
    if (markingRef.current) {
      markingRef.current.emissiveIntensity =
        (0.3 + skill.proficiency * 0.9) * (1 + hoverAmount.current * 0.6);
    }
    state.invalidate();
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow scale={[0.5, 0.4, 0.9]}>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshStandardMaterial color="#8b7a63" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.15, 0.65]} scale={[0.32, 0.3, 0.36]}>
        <sphereGeometry args={[0.5, 10, 8]} />
        <meshStandardMaterial color="#8b7a63" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.32, 0.1]} scale={[0.42, 0.06, 0.5]}>
        <sphereGeometry args={[0.5, 10, 8]} />
        <meshStandardMaterial
          ref={markingRef}
          color="#050505"
          emissive="#4bb8b0"
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      {[
        [-0.22, -0.35, 0.35],
        [0.22, -0.35, 0.35],
        [-0.22, -0.35, -0.35],
        [0.22, -0.35, -0.35],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.35, 6]} />
          <meshStandardMaterial color="#6b5d4d" roughness={0.9} />
        </mesh>
      ))}

      {/* No distanceFactor — see the equivalent note in river/Midground.tsx. */}
      {hovered && (
        <DistanceFadeHtml position={[0, 1, 0]} center>
          <div className="pointer-events-none w-56 rounded-md bg-[var(--scrim)] px-3 py-2 text-[var(--ink-inverse)] backdrop-blur-sm">
            <div className="text-sm font-semibold">{skill.name}</div>
            <div className="mt-1 text-xs opacity-80">{skill.description}</div>
          </div>
        </DistanceFadeHtml>
      )}
    </group>
  );
}
