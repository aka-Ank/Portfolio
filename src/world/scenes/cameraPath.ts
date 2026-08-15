import type { CameraWaypoint } from "@/world/engine/CameraRig";
import { chapterRange } from "./worldLayout";

// The single continuous camera path for the whole journey — one path, not
// seven independent ones, since it's one connected world (see
// worldLayout.ts). Two waypoints per chapter (entry beat + key beat); the
// next chapter's entry waypoint is what the previous chapter eases toward,
// so chapters flow into each other rather than resetting.
//
// Height and framing style progress from low/intimate (Entrance, Campfire —
// deliberate bookends) through elevated/open (Observatory) per
// docs/01-design-specification.md's calm-to-complex progression.

const entrance = chapterRange("entrance");
const clearing = chapterRange("clearing");
const river = chapterRange("river");
const sanctuary = chapterRange("sanctuary");
const lab = chapterRange("lab");
const observatory = chapterRange("observatory");
const campfire = chapterRange("campfire");

export const WORLD_CAMERA_PATH: CameraWaypoint[] = [
  // Entrance — low, framed on the threshold ahead.
  { position: [0, 1.6, entrance.start + 6], lookAt: [0, 1.4, entrance.start - 4] },
  { position: [0, 1.7, entrance.mid], lookAt: [0, 1.5, entrance.end] },

  // Clearing — wide, unhurried, human scale.
  { position: [3, 1.7, clearing.start], lookAt: [0, 1.3, clearing.mid] },
  { position: [-3, 1.8, clearing.mid], lookAt: [0, 1.4, clearing.end] },

  // Knowledge River — following the current downstream, slightly higher.
  { position: [4, 2.4, river.start], lookAt: [0, 1, river.start - 8] },
  { position: [-4, 2.6, river.mid], lookAt: [2, 1, river.end] },

  // Animal Sanctuary — weaving through the grove among the creatures.
  { position: [-5, 2.2, sanctuary.start], lookAt: [-1, 1.6, sanctuary.start - 10] },
  { position: [5, 2.4, sanctuary.mid], lookAt: [1, 1.6, sanctuary.end] },

  // Lab / Project Chamber — structured, architectural, more deliberate.
  { position: [0, 2.8, lab.start], lookAt: [0, 2, lab.start - 10] },
  { position: [3, 3, lab.mid], lookAt: [-2, 2.2, lab.end] },

  // Observatory — rising toward open sky.
  { position: [0, 4.5, observatory.start], lookAt: [0, 5, observatory.mid] },
  { position: [0, 6.5, observatory.mid], lookAt: [0, 8, observatory.end] },

  // Campfire — descending back to low, intimate framing (bookends Entrance).
  { position: [3, 2.5, campfire.start], lookAt: [0, 1, campfire.mid] },
  { position: [0, 1.5, campfire.mid + 4], lookAt: [0, 1.2, campfire.end] },
];
