"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useAetherMaterialRef } from "@/world/shared/useAetherMaterial";
import { useWorldStore } from "@/world/state/useWorldStore";
import { chapterRange } from "@/world/scenes/worldLayout";
import { labContent } from "./content";

const { start, end } = chapterRange("lab");
const length = start - end;

function ProjectConsole({
  slug,
  title,
  index,
  total,
}: {
  slug: string;
  title: string;
  index: number;
  total: number;
}) {
  const z = start - ((index + 0.5) / total) * length;
  const side = index % 2 === 0 ? -1 : 1;
  const crystalRef = useRef<THREE.Mesh>(null!);
  const trimRef = useAetherMaterialRef(2);
  const openDeepDive = useWorldStore((s) => s.openDeepDive);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    state.invalidate();
  });

  return (
    <group
      position={[side * 2.4, 0, z]}
      onClick={(e) => {
        e.stopPropagation();
        openDeepDive(slug);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1.2, 1]} />
        <meshStandardMaterial color="#3a372f" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.05, 0]} scale={[1.15, 0.1, 1.15]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial ref={trimRef} color="#020202" emissive="#4bb8b0" emissiveIntensity={0.9} />
      </mesh>
      <mesh ref={crystalRef} position={[0, 1.6, 0]} castShadow>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#0a0a0a" emissive="#4bb8b0" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.05, 0.51]}>
        <planeGeometry args={[0.05, 1]} />
        <meshBasicMaterial color="#4bb8b0" transparent opacity={0.6} />
      </mesh>
      {hovered && (
        <Html position={[0, 2.2, 0]} center occlude>
          <div className="pointer-events-none rounded-md bg-[var(--scrim)] px-3 py-1.5 text-sm text-[var(--ink-inverse)] backdrop-blur-sm">
            {title} — click to open
          </div>
        </Html>
      )}
    </group>
  );
}

// Project consoles — click opens the deep-dive panel (chrome/DeepDiveLayer.tsx)
// via the navigation state machine's openDeepDive, per docs/03-scene-graph.md §5.
export function LabMidground() {
  return (
    <>
      {labContent.projects.map((project, i) => (
        <ProjectConsole
          key={project.slug}
          slug={project.slug}
          title={project.title}
          index={i}
          total={labContent.projects.length}
        />
      ))}
    </>
  );
}
