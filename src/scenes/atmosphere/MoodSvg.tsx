import type { ReactNode } from "react";
import type { MoodId } from "@/content/sections";

/** Three depth planes, drawn and parallaxed separately. A mood missing one of
 * the three reads flat — this is the composition rule the project has held
 * since the 3D build, and it survives the move to 2D unchanged. */
export type Depth = "far" | "mid" | "near";

export interface MoodProps {
  depth: Depth;
}

export type MoodArt = (props: MoodProps) => ReactNode;

/**
 * Every mood layer draws into the same 1440×900 box and is cropped, never
 * letterboxed — the horizon must sit at a consistent height across moods or
 * the crossfade between two sections reads as a jump cut.
 */
export function MoodSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {children}
    </svg>
  );
}

/** Silhouette fill for a depth plane. Far planes sit closer to the sky in
 * value so they recede; near planes are the darkest thing on screen. */
export const DEPTH_FILL: Record<Depth, string> = {
  far: "var(--layer-far)",
  mid: "var(--layer-mid)",
  near: "var(--layer-near)",
};

/** How far each plane travels relative to scroll. Kept inside 0.6–1.3× of
 * base: past that, parallax stops reading as depth and starts reading as a
 * web effect. */
export const DEPTH_PARALLAX: Record<Depth, number> = {
  far: 0.35,
  mid: 0.7,
  near: 1.15,
};

export type MoodRegistry = Record<MoodId, MoodArt>;
