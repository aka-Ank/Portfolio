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

export type ChapterId =
  | "entrance"
  | "clearing"
  | "river"
  | "sanctuary"
  | "lab"
  | "observatory"
  | "campfire";

export const CHAPTER_ORDER: ChapterId[] = [
  "entrance",
  "clearing",
  "river",
  "sanctuary",
  "lab",
  "observatory",
  "campfire",
];

/** Each chapter's default time-of-day anchor — see docs/03-scene-graph.md. */
export const CHAPTER_TIME_OF_DAY: Record<ChapterId, TimeOfDayAnchor> = {
  entrance: "dawn",
  clearing: "dawn",
  river: "day",
  sanctuary: "day",
  lab: "sunset",
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
