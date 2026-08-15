"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { dampC } from "maath/easing";
import { CameraRig, type CameraWaypoint } from "@/world/engine/CameraRig";
import { useWorldStore } from "@/world/state/useWorldStore";
import { QUALITY_BY_TIER } from "@/types/world";
import { WORLD_TOKENS } from "@/world/tokens";
import { getWorldState } from "@/world/state/useWorldStore";
import { playSfx } from "@/world/systems/audio/audioManager";

// PROOF-SCENE ONLY — see docs/08-roadmap.md Phase 2. Real geometry/materials
// arrive scene-by-scene in Phase 3. Ground/foliage are deliberately neutral
// so any color shift visible here is coming from TimeOfDaySystem's lights,
// not a hand-authored scene color — the honest way to prove that system.
const PATH: CameraWaypoint[] = [
  { position: [0, 1.6, 8], lookAt: [0, 1, 0] },
  { position: [6, 2.2, 2], lookAt: [0, 1.5, -2] },
  { position: [-4, 3.5, -6], lookAt: [0, 0.5, -10] },
];

function InstancedTrees() {
  const tier = useWorldStore((s) => s.tier);
  const count = Math.round(60 * QUALITY_BY_TIER[tier].particleMultiplier) || 15;
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  const transforms = useMemo(() => {
    const dummy = new THREE.Object3D();
    const items: THREE.Matrix4[] = [];
    // Deterministic pseudo-random scatter so it doesn't reshuffle on re-count.
    let seed = 42;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = 4 + rand() * 20;
      dummy.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 6);
      dummy.scale.setScalar(0.6 + rand() * 0.8);
      dummy.updateMatrix();
      items.push(dummy.matrix.clone());
    }
    return items;
  }, [count]);

  useEffect(() => {
    if (!meshRef.current) return;
    transforms.forEach((matrix, i) => meshRef.current.setMatrixAt(i, matrix));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <coneGeometry args={[0.6, 2.4, 7]} />
      <meshStandardMaterial color="#8a9a86" roughness={0.9} />
    </instancedMesh>
  );
}

function AetherOrb() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // Perpetual idle bob (docs/06 "Object motion") — never converges, so
    // this component invalidates every frame it's mounted. That's the
    // honest cost of "always something gently animating" in demand mode.
    meshRef.current.position.y = 1.4 + Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
    if (materialRef.current) {
      const tokens = WORLD_TOKENS[getWorldState().targetAnchor];
      dampC(materialRef.current.emissive, tokens.aether, 4, delta);
    }
    state.invalidate();
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 1.4, -2]}
      onClick={(e) => {
        e.stopPropagation();
        playSfx("confirm");
        useWorldStore.getState().discoverLore("test-orb");
      }}
    >
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshStandardMaterial ref={materialRef} color="#111111" emissive="#4bb8b0" emissiveIntensity={1.4} />
    </mesh>
  );
}

export function TestScene() {
  return (
    <>
      <CameraRig path={PATH} />
      <InstancedTrees />
      <AetherOrb />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#9a9a8f" roughness={1} />
      </mesh>
    </>
  );
}
