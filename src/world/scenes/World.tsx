"use client";

import { useEffect, useState } from "react";
import { useWorldStore } from "@/world/state/useWorldStore";
import { CHAPTER_ORDER } from "@/types/world";
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

const SEGMENT = 1 / CHAPTER_ORDER.length;
// A full segment of scroll progress before Lab is ever needed — Lighthouse
// profiling (Phase 5) found mounting all 7 chapters' geometry at once cost
// ~2.8s of main-thread script evaluation on the very first commit, delaying
// paint of content that doesn't even depend on it (the Preloader's
// headline, fully opaque on top of the canvas). journeyProgress only ever
// advances via Lenis's eased scrollTo (scroll, bookmarks, voice nav all go
// through it — see scrollToChapter.ts), never instantly, so a full segment
// of lead time is generous headroom, not a race.
const FAR_CHAPTERS_MOUNT_AT = SEGMENT * (CHAPTER_ORDER.indexOf("lab") - 1);

// The real world root, mounted at "/" — one continuous scene, not seven
// isolated stages (see worldLayout.ts). All seven chapters present — see
// docs/08-roadmap.md Phase 3. Lab/Observatory/Campfire mount a segment
// ahead of the camera rather than at t=0 (see FAR_CHAPTERS_MOUNT_AT) — a
// first-paint cost cut, not per-chapter lazy loading in the pop-in sense
// the non-negotiables forbid: everything is still built well before the
// camera can visually reach it.
export function World() {
  const [farChaptersReady, setFarChaptersReady] = useState(
    () => useWorldStore.getState().journeyProgress >= FAR_CHAPTERS_MOUNT_AT,
  );

  useEffect(() => {
    if (farChaptersReady) return;
    const unsubscribe = useWorldStore.subscribe((state) => {
      if (state.journeyProgress >= FAR_CHAPTERS_MOUNT_AT) {
        setFarChaptersReady(true);
        unsubscribe();
      }
    });
    return unsubscribe;
  }, [farChaptersReady]);

  return (
    <>
      <CameraRig path={WORLD_CAMERA_PATH} />
      <Ground />
      <EntranceScene />
      <ClearingScene />
      <RiverScene />
      <SanctuaryScene />
      {farChaptersReady && (
        <>
          <LabScene />
          <ObservatoryScene />
          <CampfireScene />
        </>
      )}
    </>
  );
}
