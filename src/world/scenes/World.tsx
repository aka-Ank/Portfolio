"use client";

import { CameraRig } from "@/world/engine/CameraRig";
import { WORLD_CAMERA_PATH } from "./cameraPath";
import { Ground } from "@/world/shared/Ground";
import { EntranceScene } from "./entrance";
import { ClearingScene } from "./clearing";
import { RiverScene } from "./river";
import { SanctuaryScene } from "./sanctuary";

// The real world root, mounted at "/" — one continuous scene, not seven
// isolated stages (see worldLayout.ts). Chapters land here one at a time
// per docs/08-roadmap.md Phase 3; unbuilt chapters simply have no content
// yet, the camera path still passes through their world-space range.
export function World() {
  return (
    <>
      <CameraRig path={WORLD_CAMERA_PATH} />
      <Ground />
      <EntranceScene />
      <ClearingScene />
      <RiverScene />
      <SanctuaryScene />
    </>
  );
}
