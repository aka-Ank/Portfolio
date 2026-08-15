"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { damp3, dampLookAt } from "maath/easing";
import { getWorldState } from "@/world/state/useWorldStore";

export interface CameraWaypoint {
  position: [number, number, number];
  lookAt: [number, number, number];
}

// Heavier/slower than UI motion on purpose — the camera should feel like a
// patient observer, not a drone. See docs/06-animation-bible.md "Camera".
const SMOOTH_TIME_POSITION = 1.1;
const SMOOTH_TIME_LOOKAT = 1.4;

const scratchA = new THREE.Vector3();
const scratchB = new THREE.Vector3();

function computePathPoint(
  path: CameraWaypoint[],
  t: number,
  outPos: THREE.Vector3,
  outLookAt: THREE.Vector3,
) {
  const segments = path.length - 1;
  if (segments <= 0) {
    outPos.set(...path[0].position);
    outLookAt.set(...path[0].lookAt);
    return;
  }
  const clamped = THREE.MathUtils.clamp(t, 0, 1);
  const scaled = clamped * segments;
  const index = Math.min(Math.floor(scaled), segments - 1);
  const localT = scaled - index;
  const a = path[index];
  const b = path[index + 1];

  outPos.set(...a.position);
  scratchA.set(...b.position);
  outPos.lerp(scratchA, localT);

  outLookAt.set(...a.lookAt);
  scratchB.set(...b.lookAt);
  outLookAt.lerp(scratchB, localT);
}

/**
 * Reads scroll-driven journey progress directly from the store (no
 * subscription — a plain getState() read inside useFrame, per
 * docs/00-research-and-stack.md §1 "never pushed through React state") and
 * damps the camera toward the corresponding point on a waypoint path. In
 * reduced-motion mode the camera snaps directly to the target instead of
 * pursuing it — see docs/06-animation-bible.md "Reduced motion".
 */
export function CameraRig({ path }: { path: CameraWaypoint[] }) {
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const { journeyProgress, reducedMotion } = getWorldState();

    computePathPoint(path, journeyProgress, targetPos.current, targetLookAt.current);

    if (reducedMotion) {
      state.camera.position.copy(targetPos.current);
      state.camera.lookAt(targetLookAt.current);
      return;
    }

    const stillMovingPos = damp3(state.camera.position, targetPos.current, SMOOTH_TIME_POSITION, delta);
    const stillMovingLook = dampLookAt(state.camera, targetLookAt.current, SMOOTH_TIME_LOOKAT, delta);
    if (stillMovingPos || stillMovingLook) state.invalidate();
  });

  return null;
}
