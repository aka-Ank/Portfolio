"use client";

import { CameraRig } from "@/world/engine/CameraRig";
import { WORLD_CAMERA_PATH } from "./cameraPath";
import { Ground } from "@/world/shared/Ground";
import { EntranceScene } from "./entrance";
import { ClearingScene } from "./clearing";
import { RiverScene } from "./river";
import { SanctuaryScene } from "./sanctuary";
import { LabScene } from "./lab";
import { ObservatoryScene } from "./observatory";
import { CampfireScene } from "./campfire";

// The real world root, mounted at "/" — one continuous scene, not seven
// isolated stages (see worldLayout.ts). All seven chapters now present —
// see docs/08-roadmap.md Phase 3.
export function World() {
  return (
    <>
      <CameraRig path={WORLD_CAMERA_PATH} />
      <Ground />
      <EntranceScene />
      <ClearingScene />
      <RiverScene />
      <SanctuaryScene />
      <LabScene />
      <ObservatoryScene />
      <CampfireScene />
    </>
  );
}
