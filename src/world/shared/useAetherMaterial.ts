"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { dampC } from "maath/easing";
import { getWorldState } from "@/world/state/useWorldStore";
import { WORLD_TOKENS } from "@/world/tokens";

/**
 * A material ref whose emissive color continuously damps toward the current
 * time-of-day's Aether token — the shared implementation behind the
 * recurring "life-force" motif (river current, creature markings, lab
 * conduits, campfire embers) described in
 * docs/01-design-specification.md §1. Every scene that renders an Aether
 * accent uses this instead of re-deriving the damp logic per scene.
 */
export function useAetherMaterialRef(smoothTime = 4) {
  const ref = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const tokens = WORLD_TOKENS[getWorldState().targetAnchor];
    const stillAnimating = dampC(ref.current.emissive, tokens.aether, smoothTime, delta);
    if (stillAnimating) state.invalidate();
  });
  return ref;
}
