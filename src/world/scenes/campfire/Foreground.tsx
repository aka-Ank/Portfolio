"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getWorldState } from "@/world/state/useWorldStore";
import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("campfire");
const EMBER_COUNT = 10;

// Embers drift upward and reset in a loop — the one place a small amount of
// perpetual motion survives reduced-motion (docs/03-scene-graph.md §7 and
// docs/06-animation-bible.md "Reduced motion" exception): amplitude drops to
// near-zero instead of stopping outright, since a still, dark fire would
// read as "broken," not "calm."
export function CampfireForeground() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () => Array.from({ length: EMBER_COUNT }, (_, i) => ({
      angle: (i / EMBER_COUNT) * Math.PI * 2,
      radius: 0.3 + (i % 3) * 0.15,
      speed: 0.25 + (i % 4) * 0.08,
      offset: i * 0.9,
    })),
    [],
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const reduced = getWorldState().reducedMotion;
    const amplitude = reduced ? 0.15 : 1;
    const t = state.clock.elapsedTime;

    seeds.forEach((s, i) => {
      const life = ((t * s.speed + s.offset) % 1.6) / 1.6;
      const height = life * 1.8 * amplitude + 0.4;
      const drift = Math.sin(t * 0.5 + s.offset) * 0.15 * amplitude;
      dummy.position.set(
        Math.cos(s.angle) * s.radius + drift,
        height,
        mid + Math.sin(s.angle) * s.radius,
      );
      const scale = (1 - life) * 0.05 + 0.02;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    state.invalidate();
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, EMBER_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#e0813f" transparent opacity={0.85} />
    </instancedMesh>
  );
}
