"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useWorldStore } from "@/world/state/useWorldStore";
import { QUALITY_BY_TIER } from "@/types/world";
import { PerformanceGovernor } from "./PerformanceGovernor";
import { TimeOfDaySystem } from "@/world/systems/time-of-day/TimeOfDaySystem";
import { ChapterTransitionDriver } from "@/world/systems/navigation/ChapterTransitionDriver";

/**
 * The immersive engine's Canvas root — see docs/02-architecture.md
 * `world/engine/`. frameloop="demand" per docs/00-research-and-stack.md §2;
 * every animating system is responsible for calling `state.invalidate()`
 * while it's still moving (see CameraRig / TimeOfDaySystem).
 */
export function WorldCanvas({ children }: { children: ReactNode }) {
  const dpr = useWorldStore((s) => QUALITY_BY_TIER[s.tier].dpr);
  const shadowsEnabled = useWorldStore((s) => QUALITY_BY_TIER[s.tier].shadowsEnabled);

  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      shadows={shadowsEnabled ? "soft" : false}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 50, near: 0.1, far: 2000, position: [0, 1.6, 6] }}
    >
      <Suspense fallback={null}>
        <PerformanceGovernor />
        <ChapterTransitionDriver />
        <TimeOfDaySystem />
        {children}
      </Suspense>
    </Canvas>
  );
}
