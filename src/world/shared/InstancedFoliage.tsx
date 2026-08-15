"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useWorldStore } from "@/world/state/useWorldStore";
import { QUALITY_BY_TIER } from "@/types/world";

export interface InstancedFoliageProps {
  /** Base count at particleMultiplier=1; scaled down per device tier. */
  baseCount: number;
  /** World-space center of the scatter cluster. */
  center: [number, number, number];
  /** [minRadius, maxRadius] scatter distance from center. */
  radius: [number, number];
  /** [min, max] uniform scale per instance. */
  scale: [number, number];
  /** [min, max] Z spread, so scatter isn't a perfect circle around center. */
  depth?: number;
  color?: string;
  geometry?: "cone" | "cylinder";
  seed?: number;
}

// Deterministic PRNG (mulberry32) so scatter layout is stable across
// re-renders/re-counts instead of reshuffling — see docs/06-animation-bible
// "no jitter or randomness" applied to placement, not just motion.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Reusable instanced scatter primitive — the base every scene's foliage,
 * undergrowth, and rock-field dressing builds on. See
 * docs/00-research-and-stack.md §2 (InstancedMesh for repeated geometry).
 */
export function InstancedFoliage({
  baseCount,
  center,
  radius,
  scale,
  depth = radius[1],
  color = "#8a9a86",
  geometry = "cone",
  seed = 1,
}: InstancedFoliageProps) {
  const tier = useWorldStore((s) => s.tier);
  const count = Math.max(4, Math.round(baseCount * QUALITY_BY_TIER[tier].particleMultiplier));
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  const transforms = useMemo(() => {
    const rand = mulberry32(seed);
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const r = radius[0] + rand() * (radius[1] - radius[0]);
      const jitterZ = (rand() - 0.5) * depth * 0.6;
      dummy.position.set(
        center[0] + Math.cos(angle) * r,
        center[1],
        center[2] + Math.sin(angle) * r + jitterZ,
      );
      dummy.rotation.y = rand() * Math.PI * 2;
      dummy.scale.setScalar(scale[0] + rand() * (scale[1] - scale[0]));
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- center/radius/scale are stable literals per call site
  }, [count, seed]);

  useEffect(() => {
    if (!meshRef.current) return;
    transforms.forEach((matrix, i) => meshRef.current.setMatrixAt(i, matrix));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      {geometry === "cone" ? (
        <coneGeometry args={[0.55, 2.2, 7]} />
      ) : (
        <cylinderGeometry args={[0.3, 0.4, 1.6, 6]} />
      )}
      <meshStandardMaterial color={color} roughness={0.9} />
    </instancedMesh>
  );
}
