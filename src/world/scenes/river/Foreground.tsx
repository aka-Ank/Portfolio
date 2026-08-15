"use client";

import { InstancedFoliage } from "@/world/shared/InstancedFoliage";
import { chapterRange } from "@/world/scenes/worldLayout";

const { mid } = chapterRange("valley");

export function RiverForeground() {
  return (
    <>
      <InstancedFoliage
        baseCount={30}
        center={[3, 0, mid]}
        radius={[1, 4]}
        scale={[0.5, 0.9]}
        depth={22}
        color="#6b8f4e"
        geometry="cylinder"
        seed={47}
      />
      <InstancedFoliage
        baseCount={30}
        center={[-3, 0, mid]}
        radius={[1, 4]}
        scale={[0.5, 0.9]}
        depth={22}
        color="#6b8f4e"
        geometry="cylinder"
        seed={53}
      />
    </>
  );
}
