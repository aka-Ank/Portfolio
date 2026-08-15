// Shared types for the immersive world engine. See docs/02-architecture.md
// and docs/04-state-machines.md for the full spec these types encode.

export type TimeOfDayAnchor = "dawn" | "day" | "sunset" | "night";

/** Scalar position of each anchor on the continuous 0-1 timeOfDay ring. */
export const TIME_OF_DAY_ANCHOR_VALUE: Record<TimeOfDayAnchor, number> = {
  dawn: 0,
  day: 0.25,
  sunset: 0.5,
  night: 0.75,
};

/**
 * The six biomes. Restructured from the original seven chapters to match the
 * biome map: Clearing folded into the Valley (its bio/themes copy is that
 * biome's opening beat, not a separate place), and the single Lab split in
 * two so the SDE and AI/ML tracks are distinct *places*, not two lists in one
 * room — the split is the point a visitor should leave with.
 */
export type ChapterId =
  | "entrance"
  | "valley"
  | "grove"
  | "jungle"
  | "observatory"
  | "campfire";

export const CHAPTER_ORDER: ChapterId[] = [
  "entrance",
  "valley",
  "grove",
  "jungle",
  "observatory",
  "campfire",
];

/** Human-facing biome names — the world's own vocabulary, kept out of the
 * ids so renaming a label never means touching layout or state. */
export const CHAPTER_LABELS: Record<ChapterId, string> = {
  entrance: "Entrance Meadow",
  valley: "Moss River Valley",
  grove: "Ancient Grove",
  jungle: "Mechanical Jungle",
  observatory: "Moonlit Observatory",
  campfire: "Campfire Terminal",
};

/** Each chapter's default time-of-day anchor — see docs/03-scene-graph.md.
 * Still a dawn→night progression across the journey, now over six steps:
 * the organic half sits in daylight, the mechanical half after sundown. */
export const CHAPTER_TIME_OF_DAY: Record<ChapterId, TimeOfDayAnchor> = {
  entrance: "dawn",
  valley: "day",
  grove: "day",
  jungle: "sunset",
  observatory: "night",
  campfire: "night",
};

export type NavigationPhase =
  | "preloading"
  | "active"
  | "transitioning"
  | "deep-dive";

export type DeviceTier = "low" | "mid" | "high";

export interface QualitySettings {
  dpr: number;
  particleMultiplier: number;
  shadowsEnabled: boolean;
  maxInstances: number;
}

export const QUALITY_BY_TIER: Record<DeviceTier, QualitySettings> = {
  low: { dpr: 1, particleMultiplier: 0.25, shadowsEnabled: false, maxInstances: 150 },
  mid: { dpr: 1.5, particleMultiplier: 0.6, shadowsEnabled: true, maxInstances: 500 },
  high: { dpr: 2, particleMultiplier: 1, shadowsEnabled: true, maxInstances: 1500 },
};
