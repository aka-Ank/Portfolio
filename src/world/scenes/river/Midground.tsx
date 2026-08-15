"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAetherMaterialRef } from "@/world/shared/useAetherMaterial";
import { DistanceFadeHtml } from "@/world/shared/DistanceFadeHtml";
import { chapterRange } from "@/world/scenes/worldLayout";
import { riverContent } from "./content";

const { start, end } = chapterRange("river");
const length = start - end;
const mid = (start + end) / 2;

/**
 * The river itself — a flowing ribbon with the Aether as its literal
 * current, and the learning-journey milestones as stones along the bank
 * (docs/03-scene-graph.md §3: "milestones... sit as stones/eddies along the
 * bank, revealed as the camera travels downstream"). Milestone labels use
 * drei's <Html> since they're spatially distributed points along the
 * journey, not a single card the way Clearing's bio is.
 */
export function RiverMidground() {
  const currentRef = useAetherMaterialRef(2.5);
  const waterRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
    }
  });

  return (
    <group position={[0, 0, mid]}>
      {/* Water surface */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[3.2, length]} />
        <meshStandardMaterial color="#3d5f66" roughness={0.3} metalness={0.1} transparent opacity={0.6} />
      </mesh>
      {/* Aether current running down the middle */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.35, length * 0.96]} />
        <meshStandardMaterial ref={currentRef} color="#020202" emissive="#4bb8b0" emissiveIntensity={1.1} transparent opacity={0.85} />
      </mesh>

      {riverContent.milestones.map((milestone, i) => {
        const t = (i + 0.5) / riverContent.milestones.length;
        const z = start - t * length - mid;
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <group key={milestone.id} position={[side * 2.1, 0.4, z]}>
            <mesh castShadow receiveShadow>
              <dodecahedronGeometry args={[0.35, 0]} />
              <meshStandardMaterial color="#7a7568" roughness={1} flatShading />
            </mesh>
            {/* No distanceFactor: these read as UI annotations, not
                physical objects, so they stay a constant, legible size
                instead of ballooning when the camera passes close by. */}
            <DistanceFadeHtml position={[0, 0.8, 0]} center>
              <div className="pointer-events-none w-48 rounded-md bg-[var(--scrim)] px-3 py-2 text-center text-[var(--ink-inverse)] backdrop-blur-sm">
                <div className="text-xs tracking-wide opacity-70">{milestone.year}</div>
                <div className="text-sm">{milestone.label}</div>
              </div>
            </DistanceFadeHtml>
          </group>
        );
      })}
    </group>
  );
}
