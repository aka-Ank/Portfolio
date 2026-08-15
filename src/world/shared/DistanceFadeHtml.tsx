"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const FADE_START = 6;
const FADE_END = 10;

/**
 * drei's <Html occlude> only hides a label when real geometry blocks the
 * ray to it — fog is a shader effect, not geometry, so a distant chapter's
 * label can render faintly through the fog with nothing solid in between
 * (visible from Entrance looking toward River, and from Sanctuary/Lab
 * toward their neighbors — see ENGINEER_NOTES.md "Html occlude labels can
 * bleed through fog"). This wraps <Html occlude> with a camera-distance
 * fade written directly to the DOM node's style each frame — no React
 * state, matching the imperative-per-frame pattern already used everywhere
 * else in world/ (CameraRig, TimeOfDaySystem, CreatureRig's own bob/hover).
 * `occlude` still handles real geometry blocking; this only handles fog.
 */
export function DistanceFadeHtml({
  position,
  center,
  children,
}: {
  position: [number, number, number];
  center?: boolean;
  children: ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const worldPos = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (!groupRef.current || !wrapperRef.current) return;
    groupRef.current.getWorldPosition(worldPos.current);
    const distance = state.camera.position.distanceTo(worldPos.current);
    const t = (distance - FADE_START) / (FADE_END - FADE_START);
    const opacity = 1 - THREE.MathUtils.clamp(t, 0, 1);
    wrapperRef.current.style.opacity = String(opacity);
    wrapperRef.current.style.pointerEvents = opacity < 0.05 ? "none" : "auto";
  });

  return (
    <group ref={groupRef} position={position}>
      <Html center={center} occlude>
        <div ref={wrapperRef}>{children}</div>
      </Html>
    </group>
  );
}
