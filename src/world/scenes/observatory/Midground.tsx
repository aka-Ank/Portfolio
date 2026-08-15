"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
import { useAetherMaterialRef } from "@/world/shared/useAetherMaterial";
import { chapterRange } from "@/world/scenes/worldLayout";
import { observatoryContent } from "./content";

const { start, end } = chapterRange("observatory");
const length = start - end;

function CertPlaque({
  title,
  issuer,
  date,
  significance,
  index,
  total,
}: {
  title: string;
  issuer: string;
  date: string;
  significance: string;
  index: number;
  total: number;
}) {
  const z = start - ((index + 0.5) / total) * length;
  const side = index % 2 === 0 ? -1 : 1;
  const trimRef = useAetherMaterialRef(2);
  const [hovered, setHovered] = useState(false);
  const year = new Date(date).getFullYear();

  return (
    <group
      position={[side * 2.6, 0, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.9, 0]} rotation={[0, side * -0.35, 0]} castShadow>
        <boxGeometry args={[0.08, 1.4, 0.9]} />
        <meshStandardMaterial color="#2a2a30" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[side * 0.06, 0.9, 0]} rotation={[0, side * -0.35, 0]}>
        <boxGeometry args={[0.02, 1.2, 0.7]} />
        <meshStandardMaterial ref={trimRef} color="#020202" emissive="#4fd3ef" emissiveIntensity={0.7} />
      </mesh>
      <Html position={[0, 1.7, 0]} center occlude>
        <div
          className={`pointer-events-none rounded-md bg-[var(--scrim)] px-3 py-2 text-center text-[var(--ink-inverse)] backdrop-blur-sm transition-[width] ${hovered ? "w-64" : "w-32"}`}
        >
          <div className="font-[family-name:var(--font-mono)] text-xs opacity-70">{year}</div>
          <div className="text-sm">{title}</div>
          {hovered && (
            <>
              <div className="mt-1 text-xs opacity-70">{issuer}</div>
              <div className="mt-1 text-xs italic opacity-80">{significance}</div>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}

// Certification wall as a ceremonial timeline, not a resume table — see
// docs/03-scene-graph.md §6.
export function ObservatoryMidground() {
  return (
    <>
      {observatoryContent.certifications.map((cert, i) => (
        <CertPlaque
          key={cert.id}
          title={cert.title}
          issuer={cert.issuer}
          date={cert.date}
          significance={cert.significance}
          index={i}
          total={observatoryContent.certifications.length}
        />
      ))}
    </>
  );
}
