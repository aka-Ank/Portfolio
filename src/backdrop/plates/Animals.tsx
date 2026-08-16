import { PHASE } from "../scene";

/**
 * The forest's inhabitants.
 *
 * Four rules keep these from reading as stickers, and all four matter more
 * than how well the shape is drawn:
 *
 * 1. **Same fill as the plane they stand on.** An animal in its own colour is
 *    an illustration placed on a background; an animal in the plane's colour
 *    is part of the plane.
 * 2. **Small.** The deer is ~46px tall against a 900px frame. At portfolio
 *    scale it should be something you notice second, not first.
 * 3. **Partially occluded.** Each is positioned to be clipped by a frond or
 *    the ground line. Occlusion is the strongest depth cue available and it is
 *    free.
 * 4. **Idle only, never travel.** An ear flick or a head dip on a long cycle
 *    reads as life. Anything crossing the screen is movement the eye is
 *    obliged to follow, which is precisely what a background must not demand.
 *
 * The motion is one short gesture separated by a long still pause — the
 * keyframes hold at rest for most of the cycle, so what the visitor mostly
 * sees is an animal standing still.
 */

const GROUP = {
  className: "absolute inset-0 h-full w-full",
  viewBox: "0 0 1440 900",
  preserveAspectRatio: "none" as const,
  "aria-hidden": true,
  focusable: "false" as const,
};

/** Standing at the treeline, hindquarters behind a frond. */
export function Deer() {
  return (
    <svg {...GROUP}>
      <g transform="translate(352 806) scale(0.92)">
        {/* Body, legs and neck as one path — a silhouette has no seams. */}
        <path
          fill="var(--layer-fore)"
          d="M0 46 L3 22 C 4 14, 10 9, 19 8 L44 7 C 52 7, 57 11, 58 18
             L59 30 L63 46 L58 46 L55 33 L44 34 L46 46 L41 46 L38 34 L22 34
             L20 46 L15 46 L17 33 L7 30 L5 46 Z"
        />
        {/* Neck and head, hinged at the shoulder so the dip rotates the whole
            head rather than stretching the neck. */}
        <g
          className="animal-graze"
          style={{ transformOrigin: "56px 16px", animationDelay: `${PHASE.animalA}s` }}
        >
          <path
            fill="var(--layer-fore)"
            d="M54 18 C 58 10, 62 4, 66 1 L72 0 C 74 0, 75 2, 74 4 L70 8
               C 68 11, 66 15, 64 20 Z"
          />
          {/* Ear, on its own faster flick. */}
          <g
            className="animal-ear"
            style={{ transformOrigin: "68px 3px", animationDelay: `${PHASE.animalB}s` }}
          >
            <path fill="var(--layer-fore)" d="M67 3 L73 -3 L74 1 L69 5 Z" />
          </g>
        </g>
      </g>
    </svg>
  );
}

/** Perched on a branch in the mid canopy. Night only. */
export function Owl() {
  return (
    <svg {...GROUP}>
      <g transform="translate(1046 646)">
        <path fill="var(--layer-near)" d="M0 0 L34 0 L34 3 L0 3 Z" opacity="0.9" />
        <g
          className="animal-turn"
          style={{ transformOrigin: "17px 0px", animationDelay: `${PHASE.animalA}s` }}
        >
          <path
            fill="var(--layer-fore)"
            d="M11 0 C 8 -6, 8 -14, 12 -19 C 14 -22, 16 -24, 17 -25
               C 18 -24, 20 -22, 22 -19 C 26 -14, 26 -6, 23 0 Z"
          />
          {/* Ear tufts — the one detail that makes an owl silhouette legible
              as an owl rather than as a lump. */}
          <path fill="var(--layer-fore)" d="M12 -21 L10 -26 L14 -23 Z" />
          <path fill="var(--layer-fore)" d="M22 -21 L24 -26 L20 -23 Z" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Distant birds. Three specks on a slow arc, never a flapping V-formation —
 * at this distance birds are punctuation, and animating wingbeats would draw
 * exactly the attention the scene is trying not to take.
 */
export function Birds() {
  return (
    <svg {...GROUP}>
      <g className="birds-drift" style={{ animationDelay: `${PHASE.animalA}s` }}>
        <path
          fill="var(--layer-mid)"
          d="M300 300 q4-3 8 0 q-4-1.5-8 0 M330 288 q4-3 8 0 q-4-1.5-8 0 M316 312 q3-2.4 6 0 q-3-1.2-6 0"
        />
      </g>
    </svg>
  );
}
