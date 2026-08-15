"use client";

import { useMemo, useRef } from "react";
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

/**
 * Reads scroll-driven journey progress directly from the store (no
 * subscription — a plain getState() read inside useFrame, per
 * docs/00-research-and-stack.md §1 "never pushed through React state") and
 * damps the camera toward the corresponding point on a Catmull-Rom spline
 * through the waypoint path. Splines were chosen over hand-tuned piecewise
 * lerp (see ENGINEER_NOTES.md) because `getPointAt` walks the curve at
 * constant arc-length speed — the camera doesn't lurch through
 * closely-spaced waypoints or crawl through widely-spaced ones the way
 * naive per-segment lerp does. In reduced-motion mode the camera snaps
 * directly to the target instead of pursuing it — see
 * docs/06-animation-bible.md "Reduced motion".
 */
export function CameraRig({ path }: { path: CameraWaypoint[] }) {
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  const { positionCurve, lookAtCurve } = useMemo(() => {
    const positionCurve = new THREE.CatmullRomCurve3(
      path.map((wp) => new THREE.Vector3(...wp.position)),
      false,
      "catmullrom",
      0.5,
    );
    const lookAtCurve = new THREE.CatmullRomCurve3(
      path.map((wp) => new THREE.Vector3(...wp.lookAt)),
      false,
      "catmullrom",
      0.5,
    );
    // Pre-computes the internal arc-length lookup table once, up front,
    // instead of lazily on the first getPointAt call mid-scroll.
    positionCurve.getLengths(200);
    lookAtCurve.getLengths(200);
    return { positionCurve, lookAtCurve };
  }, [path]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const { journeyProgress, reducedMotion } = getWorldState();
    const t = THREE.MathUtils.clamp(journeyProgress, 0, 1);

    positionCurve.getPointAt(t, targetPos.current);
    lookAtCurve.getPointAt(t, targetLookAt.current);

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
