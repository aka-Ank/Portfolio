"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sky, Stars } from "@react-three/drei";
import * as THREE from "three";
import { damp, dampC } from "maath/easing";
import { getWorldState } from "@/world/state/useWorldStore";
import { WORLD_TOKENS } from "@/world/tokens";

// Slow, deliberate — "gradual, not toggle-switch" per the brief's
// non-negotiable rules and docs/06-animation-bible.md "Theme transition".
const SMOOTH_TIME = 4.5;
// Sky shader uniforms (turbidity/rayleigh/mie) don't have a ref-mutation
// path through drei's public API, so they're damped every frame in a plain
// object but only pushed into React state at ~12fps — imperceptible during
// a multi-second damped transition, and avoids 60fps re-renders for a
// component whose props aren't Object3D fields we can mutate directly.
const SKY_PROP_THROTTLE_FRAMES = 5;
// Below this, the Preetham sky shader is unmounted in favor of a solid
// scene.background — see the useFrame comment below.
const SKY_SHADER_MIN_ELEVATION = 0.03;

function sunPositionFromElevation(elevation: number, azimuth = 0.35): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - elevation * 90);
  const theta = THREE.MathUtils.degToRad(azimuth * 360);
  return new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
}

export function TimeOfDaySystem() {
  const { scene } = useThree();
  const directionalRef = useRef<THREE.DirectionalLight>(null!);
  const hemisphereRef = useRef<THREE.HemisphereLight>(null!);
  const starsGroupRef = useRef<THREE.Group>(null!);
  const fogRef = useRef(new THREE.FogExp2("#000000", 0.03));
  const sunVec = useRef(new THREE.Vector3(0, 1, 0));
  const skyShaderSunVec = useRef(new THREE.Vector3(0, 1, 0));
  const backgroundColor = useRef(new THREE.Color());
  const skyVisible = useRef(true);
  const [isSkyVisible, setSkyVisible] = useState(true);

  const skyParams = useRef({
    sunElevation: WORLD_TOKENS.dawn.sunElevation,
    turbidity: WORLD_TOKENS.dawn.turbidity,
    rayleigh: WORLD_TOKENS.dawn.rayleigh,
    mieCoefficient: WORLD_TOKENS.dawn.mieCoefficient,
    mieDirectionalG: WORLD_TOKENS.dawn.mieDirectionalG,
    starsOpacity: WORLD_TOKENS.dawn.starsOpacity,
  });
  const [skyProps, setSkyProps] = useState({ ...skyParams.current });
  const frameCount = useRef(0);

  useEffect(() => {
    scene.fog = fogRef.current;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1); // guard against tab-switch spikes
    const worldState = getWorldState();
    const tokens = WORLD_TOKENS[worldState.targetAnchor];
    // Reduced motion: theme changes still happen, just not damped — see
    // docs/06-animation-bible.md "Reduced motion". A tiny smooth-time
    // collapses to the target within a frame or two instead of a hard
    // one-frame snap, avoiding a visible pop.
    const smoothTime = worldState.reducedMotion ? 0.02 : SMOOTH_TIME;
    let stillAnimating = false;

    // Colors and Object3D-native numeric fields: mutated directly, every
    // frame, zero React involvement.
    if (directionalRef.current) {
      stillAnimating = dampC(directionalRef.current.color, tokens.lightKey, smoothTime, delta) || stillAnimating;
      stillAnimating = damp(directionalRef.current, "intensity", tokens.lightIntensity, smoothTime, delta) || stillAnimating;
    }
    if (hemisphereRef.current) {
      stillAnimating = dampC(hemisphereRef.current.color, tokens.skyTop, smoothTime, delta) || stillAnimating;
      stillAnimating = dampC(hemisphereRef.current.groundColor, tokens.foliageAmbient, smoothTime, delta) || stillAnimating;
      stillAnimating = damp(hemisphereRef.current, "intensity", tokens.ambientIntensity, smoothTime, delta) || stillAnimating;
    }
    stillAnimating = dampC(fogRef.current.color, tokens.fog, smoothTime, delta) || stillAnimating;
    stillAnimating = damp(fogRef.current, "density", tokens.fogDensity, smoothTime, delta) || stillAnimating;

    // Sky shader params: damped every frame in-place, thrown at React at a
    // throttled rate (see comment above).
    const p = skyParams.current;
    stillAnimating = damp(p, "sunElevation", tokens.sunElevation, smoothTime, delta) || stillAnimating;
    stillAnimating = damp(p, "turbidity", tokens.turbidity, smoothTime, delta) || stillAnimating;
    stillAnimating = damp(p, "rayleigh", tokens.rayleigh, smoothTime, delta) || stillAnimating;
    stillAnimating = damp(p, "mieCoefficient", tokens.mieCoefficient, smoothTime, delta) || stillAnimating;
    stillAnimating = damp(p, "mieDirectionalG", tokens.mieDirectionalG, smoothTime, delta) || stillAnimating;
    stillAnimating = damp(p, "starsOpacity", tokens.starsOpacity, smoothTime, delta) || stillAnimating;
    if (stillAnimating) state.invalidate();

    sunVec.current = sunPositionFromElevation(p.sunElevation);
    if (directionalRef.current) {
      directionalRef.current.position.copy(sunVec.current).multiplyScalar(50);
    }
    skyShaderSunVec.current = sunPositionFromElevation(Math.max(p.sunElevation, SKY_SHADER_MIN_ELEVATION));
    if (starsGroupRef.current) {
      starsGroupRef.current.visible = p.starsOpacity > 0.05;
    }

    // three.js's Preetham sky shader (drei's <Sky>) is only modeled for a
    // sun at or near the horizon — it isn't a night sky model at all, and
    // even clamped to a grazing angle it produces a bright dusk-glow band
    // that's wrong for a dark night. Past this threshold the Sky mesh is
    // unmounted entirely and scene.background carries the dark tone instead
    // (stars + fog do the rest of the work) — the swap lands well after
    // sunset's already-dim light, so it doesn't read as a pop.
    const showSky = p.sunElevation > SKY_SHADER_MIN_ELEVATION;
    if (showSky !== skyVisible.current) {
      skyVisible.current = showSky;
      setSkyVisible(showSky);
    }
    if (!showSky) {
      backgroundColor.current.set(tokens.skyTop);
      scene.background = backgroundColor.current;
    } else if (scene.background) {
      scene.background = null;
    }

    frameCount.current += 1;
    if (frameCount.current % SKY_PROP_THROTTLE_FRAMES === 0) {
      setSkyProps({ ...p });
    }
  });

  return (
    <>
      {isSkyVisible && (
        <Sky
          distance={450000}
          sunPosition={skyShaderSunVec.current.toArray()}
          turbidity={skyProps.turbidity}
          rayleigh={skyProps.rayleigh}
          mieCoefficient={skyProps.mieCoefficient}
          mieDirectionalG={skyProps.mieDirectionalG}
        />
      )}
      <group ref={starsGroupRef}>
        <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade speed={0.5} />
      </group>
      <directionalLight ref={directionalRef} castShadow />
      <hemisphereLight ref={hemisphereRef} />
    </>
  );
}
