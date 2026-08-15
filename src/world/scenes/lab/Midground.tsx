"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAetherMaterialRef } from "@/world/shared/useAetherMaterial";
import { DistanceFadeHtml } from "@/world/shared/DistanceFadeHtml";
import { useWorldStore } from "@/world/state/useWorldStore";
import { chapterRange } from "@/world/scenes/worldLayout";
import { labContent } from "./content";

const { start, end } = chapterRange("jungle");
const length = start - end;

function ProjectConsole({
  slug,
  title,
  side,
  index,
  total,
}: {
  slug: string;
  title: string;
  /** -1 = left bench (SDE), +1 = right bench (AI/ML). */
  side: -1 | 1;
  index: number;
  total: number;
}) {
  const z = start - ((index + 0.5) / total) * length;
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
        <DistanceFadeHtml position={[0, 2.2, 0]} center>
          <div className="pointer-events-none rounded-md bg-[var(--scrim)] px-3 py-1.5 text-sm text-[var(--ink-inverse)] backdrop-blur-sm">
            {title} — click to open
          </div>
        </DistanceFadeHtml>
      )}
    </group>
  );
}

// Project consoles — click opens the deep-dive panel (chrome/DeepDiveLayer.tsx)
// via the navigation state machine's openDeepDive, per docs/03-scene-graph.md §5.
//
// The two tracks occupy opposite benches rather than alternating by index:
// walking between them, the SDE row is consistently on the left and the
// AI/ML row consistently on the right, so the split reads spatially instead
// of needing a caption to explain it.
export function LabMidground() {
  return (
    <>
      {labContent.tracks.map((track, trackIndex) => {
        const side: -1 | 1 = trackIndex === 0 ? -1 : 1;
        return (
          <group key={track.id}>
            <DistanceFadeHtml position={[side * 2.4, 3.1, start - length * 0.5]} center>
              <div className="pointer-events-none rounded-md bg-[var(--scrim)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--ink-inverse)] uppercase backdrop-blur-sm">
                {track.label}
              </div>
            </DistanceFadeHtml>
            {track.projects.map((project, i) => (
              <ProjectConsole
                key={project.slug}
                slug={project.slug}
                title={project.title}
                side={side}
                index={i}
                total={track.projects.length}
              />
            ))}
          </group>
        );
      })}
    </>
  );
}
