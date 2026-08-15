import type { CameraWaypoint } from "@/world/engine/CameraRig";
import { chapterRange } from "./worldLayout";

// The single continuous camera path for the whole journey — one path, not
// six independent ones, since it's one connected world (see worldLayout.ts).
// Two waypoints per biome (entry beat + key beat); the next biome's entry
// waypoint is what the previous one eases toward, so biomes flow into each
// other rather than resetting.
//
// The Valley gets a third waypoint: it's double-depth (it carries both the
// river's milestones and the creatures holding the skill set), so two
// waypoints would have the camera cross it in the same spline-length as a
// half-sized biome and skim past most of it.
//
// Height and framing progress from low/intimate (Entrance, Campfire —
// deliberate bookends) through elevated/open (Observatory) per
// docs/01-design-specification.md's calm-to-complex progression, and the
// organic biomes sit lower and closer than the mechanical ones.

const entrance = chapterRange("entrance");
const valley = chapterRange("valley");
const grove = chapterRange("grove");
const jungle = chapterRange("jungle");
const observatory = chapterRange("observatory");
const campfire = chapterRange("campfire");

const valleyThird = (valley.start - valley.end) / 3;

export const WORLD_CAMERA_PATH: CameraWaypoint[] = [
  // Entrance Meadow — low, framed on the threshold ahead.
  { position: [0, 1.6, entrance.start + 6], lookAt: [0, 1.4, entrance.start - 4] },
  { position: [0, 1.7, entrance.mid], lookAt: [0, 1.5, entrance.end] },

  // Moss River Valley — following the current downstream, weaving bank to
  // bank so both the milestones and the creatures pass close to camera.
  { position: [4, 2.2, valley.start], lookAt: [0, 1.2, valley.start - 8] },
  { position: [-4, 2.6, valley.start - valleyThird], lookAt: [2, 1.4, valley.start - valleyThird - 8] },
  { position: [5, 2.4, valley.start - valleyThird * 2], lookAt: [-1, 1.6, valley.end] },

  // Ancient Grove — SDE. Wide, unhurried, human scale among the trees.
  { position: [3, 1.9, grove.start], lookAt: [0, 1.4, grove.mid] },
  { position: [-3, 2.0, grove.mid], lookAt: [0, 1.5, grove.end] },

  // Mechanical Jungle — AI/ML. Structured, architectural, more deliberate.
  { position: [0, 2.8, jungle.start], lookAt: [0, 2, jungle.start - 10] },
  { position: [3, 3, jungle.mid], lookAt: [-2, 2.2, jungle.end] },

  // Moonlit Observatory — rising toward open sky.
  { position: [0, 4.5, observatory.start], lookAt: [0, 5, observatory.mid] },
  { position: [0, 6.5, observatory.mid], lookAt: [0, 8, observatory.end] },

  // Campfire Terminal — descending back to low, intimate framing.
  { position: [3, 2.5, campfire.start], lookAt: [0, 1, campfire.mid] },
  { position: [0, 1.5, campfire.mid + 4], lookAt: [0, 1.2, campfire.end] },
];
